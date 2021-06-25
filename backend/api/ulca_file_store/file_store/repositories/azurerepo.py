import logging
from azure.storage.blob import BlobServiceClient, BlobClient
from config import azure_link_prefix,azure_connection_string,azure_container_name
from utilities import post_error
import os
from azure.storage.blob import ContainerClient


log = logging.getLogger('file')

class AzureFileRepo():

    def __init__(self):
        pass

    def upload_file_to_blob(self, file_name, folder):
        blob_file_name = folder + "/" + file_name.split('/')[2]
        blob_service_client =  BlobServiceClient.from_connection_string(azure_connection_string)
        blob_client = blob_service_client.get_blob_client(container=azure_container_name, blob=blob_file_name)
        try:
            with open(file_name, "rb") as data:
                log.info(f'Pushing {file_name} to azure at {blob_file_name} ......')
                blob_client.upload_blob(data,overwrite=True)
            return f'{azure_link_prefix}{blob_file_name}'
        except Exception as e:
            log.exception(f'Exception while pushing to azure blob storage: {e}', e)
            return post_error("Service Exception",f"Exception occurred:{e}")

    

    def download_file_from_blob(self, blob_file_name):
        blob_service_client =  BlobServiceClient.from_connection_string(azure_connection_string)
        blob_client = blob_service_client.get_blob_client(container=azure_container_name, blob=blob_file_name)
        try:
            download_file_path = os.path.join(local_path, str.replace(local_file_name ,'.txt', 'DOWNLOAD.txt'))
            log.info("\nDownloading blob to \n\t" + download_file_path)
            with open(download_file_path, "wb") as download_file:
                download_file.write(blob_client.download_blob().readall())
            # return response
        except Exception as e:
            log.exception(e)
            return post_error("Service Exception",f"Exception occurred:{e}")


    def remove_file_from_blob(self, blob_file_name):
        container_client = ContainerClient.from_connection_string(conn_str=azure_connection_string, container_name=azure_container_name)
        try:
            container_client.delete_blob(blob=blob_file_name)
        except Exception as e:
            log.exception(e)
            return post_error("Service Exception",f"Exception occurred:{e}")