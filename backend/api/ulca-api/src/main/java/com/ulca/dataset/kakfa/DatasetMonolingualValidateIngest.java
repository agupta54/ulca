package com.ulca.dataset.kakfa;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import com.ulca.dataset.dao.ProcessTrackerDao;
import com.ulca.dataset.dao.TaskTrackerDao;
import com.ulca.dataset.dao.TaskTrackerRedisDao;
import com.ulca.dataset.model.Error;
import com.ulca.dataset.model.ProcessTracker.StatusEnum;
import com.ulca.dataset.model.TaskTracker.ToolEnum;
import com.ulca.dataset.model.deserializer.MonolingualDatasetParamsSchemaDeserializer;
import com.ulca.dataset.service.DatasetService;
import com.ulca.dataset.service.ProcessTaskTrackerService;

import io.swagger.model.DatasetType;
import io.swagger.model.MonolingualParamsSchema;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class DatasetMonolingualValidateIngest implements DatasetValidateIngest {

	@Autowired
	ProcessTaskTrackerService processTaskTrackerService;

	@Autowired
	ProcessTrackerDao processTrackerDao;

	@Autowired
	TaskTrackerDao taskTrackerDao;

	@Autowired
	DatasetErrorPublishService datasetErrorPublishService;

	@Autowired
	private KafkaTemplate<String, String> datasetValidateKafkaTemplate;

	@Value("${kafka.ulca.ds.validate.ip.topic}")
	private String validateTopic;
	
	@Autowired
	TaskTrackerRedisDao taskTrackerRedisDao;
	
	@Autowired
	DatasetService datasetService;

	public void validateIngest(Map<String, String> fileMap, FileDownload file) {

		log.info("************ Entry DatasetMonolingualValidateIngest :: validateIngest *********");
		
		String serviceRequestNumber = file.getServiceRequestNumber();
		String datasetName = file.getDatasetName();
		DatasetType datasetType = file.getDatasetType();
		String userId = file.getUserId();
		String datasetId = file.getDatasetId();
		
		MonolingualParamsSchema paramsSchema = null;

		Error fileError = validateFileExistence(fileMap);
		
		if (fileError != null) {
			log.info("params.json or data.json file missing :: serviceRequestNumber : "+serviceRequestNumber );
			
			processTaskTrackerService.updateTaskTrackerWithErrorAndEndTime(serviceRequestNumber, ToolEnum.ingest,
					com.ulca.dataset.model.TaskTracker.StatusEnum.failed, fileError);
			
			processTaskTrackerService.updateProcessTracker(serviceRequestNumber, StatusEnum.failed);
			//send error event for download failure
			datasetErrorPublishService.publishDatasetError("dataset-training", fileError.getCode(), fileError.getMessage(), serviceRequestNumber, datasetName,"download" , datasetType.toString()) ;
			return;
		}

		String paramsFilePath = fileMap.get("baseLocation")  + File.separator + "params.json";
		try {
			paramsSchema = validateParamsSchema(paramsFilePath, file);

		} catch (IOException | JSONException | NullPointerException e) {
			log.info("Exception while validating params :: serviceRequestNumber : "+serviceRequestNumber + " error : " + e.getMessage());
			
			Error error = new Error();
			error.setCause(e.getMessage());
			error.setMessage("params validation failed");
			error.setCode("1000_PARAMS_VALIDATION_FAILED");

			processTaskTrackerService.updateTaskTrackerWithErrorAndEndTime(serviceRequestNumber, ToolEnum.ingest,
					com.ulca.dataset.model.TaskTracker.StatusEnum.failed, error);

			processTaskTrackerService.updateProcessTracker(serviceRequestNumber, StatusEnum.failed);
			
			// send error event
			datasetErrorPublishService.publishDatasetError("dataset-training","1000_PARAMS_VALIDATION_FAILED", e.getMessage(), serviceRequestNumber, datasetName,"ingest" , datasetType.toString()) ;
			e.printStackTrace();
			return;
		}
		try {
			ingest(paramsSchema, file, fileMap);

		} catch (IOException e) {

			log.info("Exception while ingesting :: serviceRequestNumber : "+serviceRequestNumber + " error : " + e.getMessage());
			
			
			Error error = new Error();
			error.setCause(e.getMessage());
			error.setMessage("INGEST FAILED");
			error.setCode("1000_INGEST_FAILED");

			processTaskTrackerService.updateTaskTrackerWithError(serviceRequestNumber, ToolEnum.ingest,
					com.ulca.dataset.model.TaskTracker.StatusEnum.failed, error);

			processTaskTrackerService.updateProcessTracker(serviceRequestNumber, StatusEnum.failed);

			// send error event
			datasetErrorPublishService.publishDatasetError("dataset-training","1000_INGEST_FAILED", e.getMessage(), serviceRequestNumber, datasetName,"ingest" , datasetType.toString()) ;

			//update redis when ingest failed
			taskTrackerRedisDao.updateCountOnIngestFailure(serviceRequestNumber);
			return;
		}
		try {
			
			ObjectMapper objectMapper = new ObjectMapper();
			JSONObject record;
			record = new JSONObject(objectMapper.writeValueAsString(paramsSchema));
			
			datasetService.updateDataset(datasetId, userId, record);
			
		} catch (JsonProcessingException | JSONException e) {
			
			log.info("update Dataset failed , datasetId :: " + datasetId + " reason :: " + e.getMessage());
		}

	}

	public MonolingualParamsSchema validateParamsSchema(String filePath, FileDownload file)
			throws JsonParseException, JsonMappingException, IOException {

		log.info("************ Entry DatasetMonolingualValidateIngest :: validateParamsSchema *********");
		log.info("validing file :: against params schema");
		log.info(filePath);
		String serviceRequestNumber = file.getServiceRequestNumber();
		log.info(serviceRequestNumber);
		ObjectMapper mapper = new ObjectMapper();
		SimpleModule module = new SimpleModule();
		module.addDeserializer(MonolingualParamsSchema.class, new MonolingualDatasetParamsSchemaDeserializer());
		mapper.registerModule(module);

		MonolingualParamsSchema paramsSchema = mapper.readValue(new File(filePath), MonolingualParamsSchema.class);
		if (paramsSchema == null) {

			log.info("params validation failed");
			throw new IOException("paramsValidation failed");

		}
		if (paramsSchema.getDatasetType() != file.getDatasetType()) {
			log.info("params validation failed");
			throw new IOException("params datasetType does not matches with submitted datasetType");
		}

		return paramsSchema;

	}

	public void ingest(MonolingualParamsSchema paramsSchema, FileDownload file, Map<String, String> fileMap)
			throws IOException {

		log.info("************ Entry DatasetMonolingualValidateIngest :: ingest *********");

		String datasetId = file.getDatasetId();
		String serviceRequestNumber = file.getServiceRequestNumber();
		String userId = file.getUserId();
		String datasetName = file.getDatasetName();
		DatasetType datasetType = file.getDatasetType();
		

		ObjectMapper objectMapper = new ObjectMapper();

		JSONObject source;

		String path = fileMap.get("baseLocation")  + File.separator + "data.json";
		log.info("data.json file path :: " + path);
		

		source = new JSONObject(objectMapper.writeValueAsString(paramsSchema));

		InputStream inputStream = Files.newInputStream(Path.of(path));
		JsonReader reader = new JsonReader(new InputStreamReader(inputStream));


		int numberOfRecords = 0;
		int failedCount = 0;
		int successCount = 0;
		
		JSONObject vModel = new JSONObject();
		vModel.put("datasetId", datasetId);
		vModel.put("datasetName", file.getDatasetName());
		vModel.put("datasetType", paramsSchema.getDatasetType().toString());
		vModel.put("serviceRequestNumber", serviceRequestNumber);
		vModel.put("userId", userId);
		vModel.put("userMode", "real");
		
		taskTrackerRedisDao.intialize(serviceRequestNumber);
		log.info("starting to ingest serviceRequestNumber :: " + serviceRequestNumber);

		reader.beginArray();
		while (reader.hasNext()) {

			numberOfRecords++;
			
			
			Object rowObj = new Gson().fromJson(reader, Object.class);
			ObjectMapper mapper = new ObjectMapper();
			String dataRow = mapper.writeValueAsString(rowObj);
			
			JSONObject target =  new JSONObject(dataRow);
			if(!target.has("text")) {
				
				failedCount++;
				taskTrackerRedisDao.increment(serviceRequestNumber, "ingestError");
				// send error event
				datasetErrorPublishService.publishDatasetError("dataset-training","1000_ROW_DATA_VALIDATION_FAILED","data row does not contains text field", serviceRequestNumber, datasetName,"ingest" , datasetType.toString()) ;
				
				
				
			}else {
				Set<String> rowKeys = target.keySet();
				if(rowKeys.size() > 1) {
					log.info("record :: " +numberOfRecords + "failed " );
					log.info("data row does contains unkown fields" );
					
					failedCount++;
					taskTrackerRedisDao.increment(serviceRequestNumber, "ingestError");
					// send error event
					datasetErrorPublishService.publishDatasetError("dataset-training","1000_ROW_DATA_VALIDATION_FAILED", "data row does contains unkown fields", serviceRequestNumber, datasetName,"ingest" , datasetType.toString()) ;
					
					
				}else {
					
					successCount++;
					taskTrackerRedisDao.increment(serviceRequestNumber, "ingestSuccess");
					
					JSONObject finalRecord = deepMerge(source, target);
					String sourceLanguage = finalRecord.getJSONObject("languages").getString("sourceLanguage");
					finalRecord.remove("languages");
					finalRecord.put("sourceLanguage", sourceLanguage);

					UUID uid = UUID.randomUUID();
					finalRecord.put("id", uid);

					vModel.put("record", finalRecord);
					vModel.put("currentRecordIndex", numberOfRecords);

					datasetValidateKafkaTemplate.send(validateTopic, vModel.toString());
					
				}
			}
			
		}
		reader.endArray();
		reader.close();
		inputStream.close();
		

		taskTrackerRedisDao.setCountOnIngestComplete(serviceRequestNumber, numberOfRecords);
		
		log.info("data sending for validation serviceRequestNumber :: " + serviceRequestNumber + " total Record :: " + numberOfRecords + " success record :: " + successCount) ;
		
	}


}