import hashlib
import logging
import multiprocessing
import threading
import time
from datetime import datetime
from functools import partial
from logging.config import dictConfig
from configs.configs import parallel_ds_batch_size, offset, limit, aws_ocr_prefix, search_output_topic, \
    sample_size, ocr_immutable_keys, ocr_non_tag_keys, delete_output_topic, dataset_type_ocr
from repository.ocr import OCRRepo
from utils.datasetutils import DatasetUtils
from kafkawrapper.producer import Producer
from events.error import ErrorEvent


log = logging.getLogger('file')

mongo_instance = None
repo = OCRRepo()
utils = DatasetUtils()
prod = Producer()
error_event = ErrorEvent()


class OCRService:
    def __init__(self):
        pass

    # Method to load ASR Dataset
    def load_ocr_dataset(self, request):
        log.info("Loading OCR Dataset.....")
        try:
            ip_data = request["data"]
            batch_data, error_list = [], []
            total, count, duplicates, batch = len(ip_data), 0, 0, parallel_ds_batch_size
            metadata = ip_data
            metadata.pop("records")
            ip_data = ip_data["records"]
            if ip_data:
                func = partial(self.get_enriched_ocr_data, metadata=metadata)
                no_of_m1_process = request["processors"]
                pool_enrichers = multiprocessing.Pool(no_of_m1_process)
                enrichment_processors = pool_enrichers.map_async(func, ip_data).get()
                for result in enrichment_processors:
                    if result:
                        if result[0] == "INSERT":
                            if len(batch_data) == batch:
                                if metadata["datasetMode"] != 'pseudo':
                                    persist_thread = threading.Thread(target=repo.insert, args=(batch_data,))
                                    persist_thread.start()
                                    persist_thread.join()
                                count += len(batch_data)
                                batch_data = []
                            batch_data.append(result[1])
                        elif result[0] == "FAILED":
                            error_list.append({"record": result[1], "code": "UPLOAD_FAILED",
                                               "datasetType": dataset_type_ocr,
                                               "serviceRequestNumber": metadata["serviceRequestNumber"],
                                               "message": "Upload to s3 bucket failed"})
                        else:
                            error_list.append(
                                {"record": result[1], "code": "DUPLICATE_RECORD", "originalRecord": result[2],
                                 "datasetType": dataset_type_ocr,
                                 "serviceRequestNumber": metadata["serviceRequestNumber"],
                                 "message": "This record is already available in the system"})
                pool_enrichers.close()
                if batch_data:
                    if metadata["datasetMode"] != 'pseudo':
                        persist_thread = threading.Thread(target=repo.insert, args=(batch_data,))
                        persist_thread.start()
                        persist_thread.join()
                    count += len(batch_data)
            if error_list:
                error_event.create_error_event(error_list)
            log.info(f'Done! -- INPUT: {total}, INSERTS: {count}, "INVALID": {len(error_list)}')
        except Exception as e:
            log.exception(e)
            return {"message": "EXCEPTION while loading dataset!!", "status": "FAILED"}
        lang_code = f'{request["details"]["sourceLanguage"]}|{request["details"]["targetLanguage"]}'
        return {"message": f'loaded {lang_code} dataset to DB', "status": "SUCCESS", "total": total, "inserts": count,
                "invalid": len(error_list)}

    # Method to enrich asr dataset
    def get_enriched_ocr_data(self, data, metadata):
        records = self.get_ocr_dataset_internal({"imageHash": data["imageHash"], "groundTruthHash": data["groundTruthHash"]})
        if records:
            dup_data = self.enrich_duplicate_data(data, records[0], metadata)
            if dup_data:
                repo.update(dup_data)
                return None
            else:
                return "DUPLICATE", data, records[0]
        insert_data = data
        insert_data["datasetType"] = metadata["datasetType"]
        insert_data["datasetId"] = [metadata["datasetId"]]
        for key in insert_data.keys():
            if key not in ocr_immutable_keys:
                insert_data[key] = [insert_data[key]]
        insert_data["tags"] = self.get_tags(insert_data)
        if metadata["datasetMode"] != 'pseudo':
            epoch = eval(str(time.time()).replace('.', '')[0:13])
            s3_file_name = f'{data["imageFilename"]}|{metadata["datasetId"]}|{epoch}'
            object_store_path = utils.upload_file(data["imageFilePath"], f'{aws_ocr_prefix}{s3_file_name}')
            if not object_store_path:
                return "FAILED", insert_data, insert_data
            insert_data["objStorePath"] = object_store_path
        return "INSERT", insert_data, insert_data

    def enrich_duplicate_data(self, data, record, metadata):
        db_record = record
        for key in data.keys():
            if key not in ocr_immutable_keys:
                if key not in record.keys():
                    record[key] = [data[key]]
                elif isinstance(data[key], list):
                    record[key] = list(set(data[key]) | set(record[key]))
                else:
                    if isinstance(record[key], list):
                        if data[key] not in record[key]:
                            record[key].append(data[key])
        if db_record != record:
            record["datasetId"].append(metadata["datasetId"])
            record["tags"] = self.get_tags(record)
            return record
        else:
            return False

    def get_tags(self, insert_data):
        tag_details = insert_data
        for key in ocr_non_tag_keys:
            if key in tag_details.keys():
                tag_details.pop(key)
        return list(utils.get_tags(tag_details))

    # Method for deduplication
    def get_ocr_dataset_internal(self, query):
        try:
            exclude = {"_id": False}
            data = repo.search(query, exclude, None, None)
            if data:
                return data[0]
            else:
                return None
        except Exception as e:
            log.exception(e)
            return None

    # Method for searching asr datasets
    def get_ocr_dataset(self, query):
        log.info(f'Fetching datasets..... | {datetime.now()}')
        try:
            off = query["offset"] if 'offset' in query.keys() else offset
            lim = query["limit"] if 'limit' in query.keys() else limit
            db_query, tags = {}, []
            if 'language' in query.keys():
                tags.append(query["language"])
            if 'collectionMode' in query.keys():
                tags.append(query["collectionMode"])
            if 'collectionSource' in query.keys():
                tags.append(query["collectionMode"])
            if 'license' in query.keys():
                tags.append(query["licence"])
            if 'domain' in query.keys():
                tags.append(query["domain"])
            if 'datasetId' in query.keys():
                tags.append(query["datasetId"])
            if 'imageFilename' in query.keys():
                tags.append(query["imageFilename"])
            if 'datasetId' in query.keys():
                tags.append(query["datasetId"])
            if tags:
                db_query["tags"] = tags
            exclude = {"_id": False}
            data = repo.search(db_query, exclude, off, lim)
            result, query, count = data[0], data[1], data[2]
            log.info(f'Result --- Count: {count}, Query: {query}')
            path = utils.push_result_to_s3(result, query["serviceRequestNumber"])
            if path:
                size = sample_size
                if count <= 10:
                    size = count
                op = {"serviceRequestNumber": query["serviceRequestNumber"], "count": count, "sample": result[:size], "dataset": path}
            else:
                log.error(f'There was an error while pushing result to S3')
                op = {"serviceRequestNumber": query["serviceRequestNumber"], "count": 0, "sample": [], "dataset": None}
            prod.produce(op, search_output_topic, None)
            log.info(f'Done!')
            return op
        except Exception as e:
            log.exception(e)
            return {"message": str(e), "status": "FAILED", "dataset": "NA"}

    def delete_ocr_dataset(self, delete_req):
        log.info(f'Deleting datasets....')
        records = self.get_ocr_dataset({"datasetId": delete_req["datasetId"]})
        d, u = 0, 0
        for record in records:
            if len(record["datasetId"]) == 1:
                repo.delete(record["id"])
                utils.delete_from_s3(record["objStorePath"])
                d += 1
            else:
                record["datasetId"].remove(delete_req["datasetId"])
                record["tags"].remove(delete_req["datasetId"])
                repo.update(record)
                u += 1
        op = {"serviceRequestNumber": delete_req["serviceRequestNumber"], "deleted": d, "updated": u}
        prod.produce(op, delete_output_topic, None)
        log.info(f'Done!')
        return op


# Log config
dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] {%(filename)s:%(lineno)d} %(threadName)s %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {
        'info': {
            'class': 'logging.FileHandler',
            'level': 'DEBUG',
            'formatter': 'default',
            'filename': 'info.log'
        },
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',
            'formatter': 'default',
            'stream': 'ext://sys.stdout',
        }
    },
    'loggers': {
        'file': {
            'level': 'DEBUG',
            'handlers': ['info', 'console'],
            'propagate': ''
        }
    },
    'root': {
        'level': 'DEBUG',
        'handlers': ['info', 'console']
    }
})