package com.ulca.model.service;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import javax.net.ssl.SSLException;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ulca.model.request.Input;
import com.ulca.model.request.ModelComputeRequest;
import com.ulca.model.response.ModelComputeResponse;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import io.swagger.model.ASRRequest;
import io.swagger.model.ASRResponse;
import io.swagger.model.ImageFile;
import io.swagger.model.ImageFiles;
import io.swagger.model.OCRRequest;
import io.swagger.model.OCRResponse;
import io.swagger.model.OneOfInferenceAPIEndPointSchema;
import io.swagger.model.Sentence;
import io.swagger.model.Sentences;
import io.swagger.model.TTSConfig;
import io.swagger.model.TTSRequest;
import io.swagger.model.TTSResponse;
import io.swagger.model.TranslationRequest;
import io.swagger.model.TranslationResponse;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.io.File;
import java.io.IOException;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;


@Slf4j
@Service
public class ModelInferenceEndPointService {

	@Autowired
	WebClient.Builder builder;

	public OneOfInferenceAPIEndPointSchema validateCallBackUrl(String callBackUrl,
			OneOfInferenceAPIEndPointSchema schema)
			throws URISyntaxException, IOException {

		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.TranslationInference")) {
			io.swagger.model.TranslationInference translationInference = (io.swagger.model.TranslationInference) schema;
			TranslationRequest request = translationInference.getRequest();
			
			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			OkHttpClient client = new OkHttpClient();
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			Response httpResponse = client.newCall(httpRequest).execute();
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String responseJsonStr = httpResponse.body().string();
			
			TranslationResponse response = objectMapper.readValue(responseJsonStr, TranslationResponse.class);
			translationInference.setResponse(response);
			schema = translationInference;

		}

		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.ASRInference")) {
			io.swagger.model.ASRInference asrInference = (io.swagger.model.ASRInference) schema;
			ASRRequest request = asrInference.getRequest();

			ASRResponse response  = null;
			SslContext sslContext;
			try {
				sslContext = SslContextBuilder
				        .forClient()
				        .trustManager(InsecureTrustManagerFactory.INSTANCE)
				        .build();
				
				 HttpClient httpClient = HttpClient.create().secure(t -> t.sslContext(sslContext));
				 
				 response = builder.clientConnector(new ReactorClientHttpConnector(httpClient)).build().post().uri(callBackUrl)
							.body(Mono.just(request), ASRRequest.class).retrieve().bodyToMono(ASRResponse.class)
							.block(); 
				 
			} catch (SSLException e) {
				e.printStackTrace();
			}

			ObjectMapper objectMapper = new ObjectMapper();
			log.info("logging asr inference point response"  + objectMapper.writeValueAsString(response));
			asrInference.setResponse(response);
			schema = asrInference;

		}
		
		
		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.OCRInference")) {
			io.swagger.model.OCRInference ocrInference = (io.swagger.model.OCRInference) schema;
			OCRRequest request = ocrInference.getRequest();

			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			OkHttpClient client = new OkHttpClient();
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			Response httpResponse = client.newCall(httpRequest).execute();
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String responseJsonStr = httpResponse.body().string();
			OCRResponse response = objectMapper.readValue(responseJsonStr, OCRResponse.class);
			ocrInference.setResponse(response);
			schema = ocrInference;

			log.info("logging ocr inference point response" + responseJsonStr);
		}
		
		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.TTSInference")) {
			io.swagger.model.TTSInference ttsInference = (io.swagger.model.TTSInference) schema;
			TTSRequest request = ttsInference.getRequest();

			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			OkHttpClient client = new OkHttpClient();
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			Response httpResponse = client.newCall(httpRequest).execute();
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String responseJsonStr = httpResponse.body().string();
			TTSResponse response = objectMapper.readValue(responseJsonStr, TTSResponse.class);
			ttsInference.setResponse(response);
			schema = ttsInference;

			log.info("logging tts inference point response" + responseJsonStr);
		}
		
	

		return schema;

	}

	public ModelComputeResponse compute(String callBackUrl, OneOfInferenceAPIEndPointSchema schema,
			ModelComputeRequest compute)
			throws URISyntaxException, IOException {

		ModelComputeResponse response = new ModelComputeResponse();

		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.TranslationInference")) {
			io.swagger.model.TranslationInference translationInference = (io.swagger.model.TranslationInference) schema;
			TranslationRequest request = translationInference.getRequest();

			List<Input> input = compute.getInput();
			Sentences sentences = new Sentences();
			for (Input ip : input) {
				Sentence sentense = new Sentence();
				sentense.setSource(ip.getSource());
				sentences.add(sentense);
			}
			request.setInput(sentences);
			
			
			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			OkHttpClient client = new OkHttpClient();
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			Response httpResponse = client.newCall(httpRequest).execute();
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String responseJsonStr = httpResponse.body().string();

			TranslationResponse translation = objectMapper.readValue(responseJsonStr, TranslationResponse.class);

			response.setOutputText(translation.getOutput().get(0).getTarget());
			
			return response;
		}
		
		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.OCRInference")) {
			io.swagger.model.OCRInference ocrInference = (io.swagger.model.OCRInference) schema;
			
			
			ImageFiles imageFiles = new ImageFiles();
			ImageFile imageFile = new ImageFile();
			imageFile.setImageUri(compute.getImageUri());
			imageFiles.add(imageFile);
			
			
			OCRRequest request = ocrInference.getRequest();
			request.setImage(imageFiles);

			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			OkHttpClient client = new OkHttpClient();
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			Response httpResponse = client.newCall(httpRequest).execute();
			
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			OCRResponse ocrResponse  = objectMapper.readValue(httpResponse.body().string(), OCRResponse.class);
			
			response.setOutputText(ocrResponse.getOutput().get(0).getSource());
			
		}
		
		if (schema.getClass().getName().equalsIgnoreCase("io.swagger.model.TTSInference")) {
			io.swagger.model.TTSInference ttsInference = (io.swagger.model.TTSInference) schema;
			
			
			TTSRequest request = ttsInference.getRequest();
			
			List<Input> input = compute.getInput();
			Sentences sentences = new Sentences();
			for (Input ip : input) {
				Sentence sentense = new Sentence();
				sentense.setSource(ip.getSource());
				sentences.add(sentense);
			}
			request.setInput(sentences);
			TTSConfig config = request.getConfig();
			config.setGender(compute.getGender());
			request.setConfig(config);
			
			ObjectMapper objectMapper = new ObjectMapper();
			String requestJson = objectMapper.writeValueAsString(request);
			
			OkHttpClient client = new OkHttpClient();
			RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
			Request httpRequest = new Request.Builder()
			        .url(callBackUrl)
			        .post(body)
			        .build();
			
			Response httpResponse = client.newCall(httpRequest).execute();
			
			String ttsResponseStr = httpResponse.body().string(); 
			
			//objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			TTSResponse ttsResponse  = objectMapper.readValue(ttsResponseStr, TTSResponse.class);
			
			String encodedString = Base64.getEncoder().encodeToString(ttsResponse.getAudio().get(0).getAudioContent());
			response.setOutputText(encodedString);
			
		}
		
		
		return response;
	}
	
	public ModelComputeResponse compute(String callBackUrl, OneOfInferenceAPIEndPointSchema schema,
			String  imagePath)
			throws URISyntaxException, IOException {

		ModelComputeResponse response = new ModelComputeResponse();
		
		io.swagger.model.OCRInference ocrInference = (io.swagger.model.OCRInference) schema;
		
		byte[] bytes = FileUtils.readFileToByteArray(new File(imagePath));
		
		ImageFile imageFile = new ImageFile();
		imageFile.setImageContent(bytes);
		
		ImageFiles imageFiles = new ImageFiles();
		imageFiles.add(imageFile);
		
		OCRRequest request = ocrInference.getRequest();
		request.setImage(imageFiles);

		ObjectMapper objectMapper = new ObjectMapper();
		String requestJson = objectMapper.writeValueAsString(request);
		
		OkHttpClient client = new OkHttpClient();
		RequestBody body = RequestBody.create(requestJson,MediaType.parse("application/json"));
		Request httpRequest = new Request.Builder()
		        .url(callBackUrl)
		        .post(body)
		        .build();
		
		Response httpResponse = client.newCall(httpRequest).execute();
		String responseJsonStr = httpResponse.body().string();
		
		OCRResponse ocrResponse  = objectMapper.readValue(responseJsonStr, OCRResponse.class);
		if(ocrResponse != null && ocrResponse.getOutput() != null && ocrResponse.getOutput().size() > 0) {
			response.setOutputText(ocrResponse.getOutput().get(0).getSource());
		}else {
			log.info("Ocr try me response is null or not proper" );
			log.info("callBackUrl :: " + callBackUrl);
			log.info("Request Json :: " + requestJson);
			log.info("ResponseJson :: " + responseJsonStr);
			
		}
		

		FileUtils.delete(new File(imagePath));
		
		return response;
	}
	

}
