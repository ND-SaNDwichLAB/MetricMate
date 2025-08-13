from fastapi import APIRouter
from fastapi import Request

import configparser
import openai
import pandas as pd
import json
import numpy as np

from helpers.assertion import format_output
from Models.Assertion import AssertionFromExamples


router = APIRouter()

#set up openai
config = configparser.ConfigParser()
# Read the config.ini file
config.read('config.ini')
API_KEY = config.get("settings", "openai_api").split('#')[0].strip()
openai.api_key = API_KEY


@router.post("/suggestions")
async def getAssertionFromCriteria(request: Request):

	context =  request.headers.get('data-context')

	print("context: ", context)	

	request_json = await request.json()


	criteria = request_json['criteria']
	assertion = request_json['assertions']

	#build the prompt
	user_prompt = {"context": context, 
				"criteria_name": criteria}
	if assertion:
		user_prompt["previous_assertions"] = assertion

	#generate highlevel criteria
	with open('prompts/generate_assertions_1.json', 'r') as file:
		generate_asrt = json.load(file)
	generate_asrt.append({"role":"user", "content":json.dumps(user_prompt)})

	response = openai.chat.completions.create(
			model="gpt-4o",
			messages=generate_asrt,
			temperature=0,
			response_format={ "type": "json_object" }
	)

	#format the output
	formatted_output = response.choices[0].message.content
	print("formatted_output: ", formatted_output)
	
	#change the all the string into lower case
	formatted_output = formatted_output.lower()

	#change formatted_output to json
	formatted_output = json.loads(formatted_output)
	return formatted_output



@router.post("/examples")
async def getExamplesFromAssertion(request: Request):
	context =  request.headers.get('data-context')

	request_json = await request.json()

	assertion = request_json['assertion']
	data = request_json['data']
	data_ids = list(data.keys())

	print("assertion: ", assertion)


	embedding_df = pd.read_csv("data/patient_bot_output_embeddings.csv")


    #get embeddings for the criteria
	response = openai.embeddings.create(
        input=assertion["name"],
        model="text-embedding-3-large"
    )
	criteria_embedding = response.data[0].embedding
	
	all_data_embeddings = [eval(x) for x in embedding_df["embedding"].tolist()]
	all_data_array = np.vstack(all_data_embeddings)  # Each embedding is presumably of the same length
	criteria_array = np.array(criteria_embedding)

    # Compute the norms
	all_data_norms = np.linalg.norm(all_data_array, axis=1)
	criteria_norm = np.linalg.norm(criteria_array)

    # Dot product of each embedding with the criteria vector
	dot_products = np.dot(all_data_array, criteria_array)

    # Element-wise division to get similarity
	similarities = dot_products / (all_data_norms * criteria_norm)
	
	top_5_indices = np.argsort(similarities)[-5:][::-1]

    #get the ids 
	top_5_ids = embedding_df.iloc[top_5_indices]['id'].tolist()

	# get judge results for selected examples
	# print("top_5_ids: ", top_5_ids)

	examples = []

	#iterate over the ids, get input output pairs from the data and run the assertions
	for id in top_5_ids:
		
		row = data[data_ids[id%len(data_ids)]]		

		with open('prompts/judge.json', 'r') as file:
			judge_prompt = json.load(file)
			judge_prompt.append({"role":"user", 
						"content":json.dumps({
							"assertions":[assertion], 
							"data":[row]}) })
			#send to openai api
			response = openai.chat.completions.create(
					model="gpt-4o-mini",
					messages=judge_prompt,  
					temperature=0,
					response_format={ "type": "json_object" }
					)
		formatted_output = json.loads(response.choices[0].message.content)['results'][0]['result']
		input_reasons = []
		output_reasons = []

		#get relevant texts if the assertion passes
		if formatted_output == "pass":
			with open("prompts/relevant_text_extraction.json") as file:
				relevant_text_prompt = json.load(file)
				relevant_text_prompt.append({"role":"user", "content":json.dumps({"input":row['input'], "output":row['output'], "assertion":assertion})})
				relevant_text_response = openai.chat.completions.create(
						model="gpt-4o-mini",
						messages=relevant_text_prompt,  
						temperature=0,
						response_format={ "type": "json_object" }
						)
				relevant_text_extracted = json.loads(relevant_text_response.choices[0].message.content)
				print("relevant_text_extracted: ", relevant_text_extracted)

				input_reasons = relevant_text_extracted['input_reasoning']
				output_reasons = relevant_text_extracted['output_reasoning']


		examples.append({"input": row['input'], "output": row['output'], "result": formatted_output, "input_reasons": input_reasons, "output_reasons": output_reasons})
		# print("response: ", response)
		# break

	return examples

