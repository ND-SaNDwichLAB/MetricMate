import pandas as pd
import configparser
import json
import os
import uvicorn
import sys
from fastapi import FastAPI, Cookie, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from routers import criteriaRouter, assertionRouter
from fastapi.responses import StreamingResponse

import asyncio
from concurrent.futures import ProcessPoolExecutor

import openai
# from helpers.assertion.helper import format_output
from helpers.getJudgeResults import getJudgeResults
from typing import List, Dict
from Models.Assertion import Assertion, AssertionFromExamples
from Models.Criteria import Criteria


executor = ProcessPoolExecutor()
loop = asyncio.get_event_loop()

config = configparser.ConfigParser()
# Read the config.ini file
config.read('config.ini')


API_KEY = config.get("settings", "openai_api").split('#')[0].strip()
openai.api_key = API_KEY

stop_signals = {}
stop_signals_lock = asyncio.Lock()  # Lock for thread-safe updates



app = FastAPI()
router = APIRouter()


app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


app.include_router(criteriaRouter.router, prefix="/criteria")
app.include_router(assertionRouter.router, prefix="/assertions")


config = configparser.ConfigParser()
# Read the config.ini file
config.read('config.ini')


API_KEY = config.get("settings", "openai_api").split('#')[0].strip()


os.environ["OPENAI_API_KEY"] = API_KEY


def format_output(text):
	# Define the sections we are looking for
	sections = ['observation', 'action', 'new assertion']

	# Split the text into lines
	lines = text.split('\n')

	# Initialize the formatted output
	formatted_output = []
	current_section = None
	new_assertion = None 

	# Iterate through lines and add newlines before section titles
	for index, line in enumerate(lines):
		for section in sections:
			if line.strip().startswith(f'({section})'):
				current_section = section
				formatted_output.append('\n')
			if current_section == 'new assertion':
				new_assertion = line      
					 
		formatted_output.append(line)
	return formatted_output[-1]



data_collector = {}

@app.get("/")
async def home():
	return {"message": "Hello World"}

@app.get("/session")
async def getSession():
	#open the data index json file
	with open("data/data_index.json", "r") as file:
		data_index = json.load(file)
	return data_index



@app.post("/upload_data")
async def importData(request: Request):
	data = await request.json()

	data_name = data['data_name']
	data_id = data['data_id']
	data_type = data['data_type']
	data_content = data['data']
	data_context = data['data_context']

	uploaded_date = pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')


	#check if the data is in the correct format, if not return an error
	columns = data_content[0]
	print("uploaded columns ", columns)
	if('id' not in columns or 'input' not in columns or 'output' not in columns):
		return {"message":"Data not in the correct format", "results":None}
	
	#store the data in a tsv file
	df = pd.DataFrame(data_content[1:], columns=columns)
	file_name = f"data/uploaded_data/{data_name}.tsv"
	df.to_csv(file_name, sep="\t", index=False)
	
	#open the data index file
	with open("data/data_index.json", "r") as file:
		data_index = json.load(file)
	
	#add the data to the index
	data_index[data_id] = {
		"name":data_name,
		"type":data_type,
		"file":file_name,
		"uploaded_date":uploaded_date,
		"id":data_id,
		"context":data_context
	}

	#write the data index file
	with open("data/data_index.json", "w") as file:
		json.dump(data_index, file)
	
	for index, row in df.iterrows():
		data_collector[row['id']] = {
			"input": row['input'],
			"output": row['output']}
			
	return{"message":"Data uploaded successfully", "results":data_collector, "data_index":data_index}

@app.get("/data/{data_id}")
def getData(request:Request, data_id:str):
	if data_id==None:
		return {"message":"Data not found", "results":None}
	#open the data index json file
	with open("data/data_index.json", "r") as file:
		data_index = json.load(file)
	
	
	#check if the data id exists in the index
	if data_id not in data_index:
		return {"message":"Data not found", "results":None}
	data_path = data_index[data_id]['file']
	print(data_path)
	data = pd.read_csv(data_path, sep="\t")
	data_collector = {}
	#iterate over the rows
	for index, row in data.iterrows():
		data_collector[row['id']] = {
			"input": row['input'],
			"output": row['output']}
		
	return data_collector


@app.post("/stop")
async def stop_stream(request: Request):
	json_data = await request.json()
	session_id = json_data.get('session_id')

	print(f"Setting session id {session_id} to True")

	if session_id:
		async with stop_signals_lock:
			if session_id in stop_signals:
				stop_signals[session_id] = True
				return {"message": "Stream stopped successfully"}
	return {"message": "Invalid session ID"}

async def generate_results(data_collector, criteria, session_id):
	count = 0
	for id in data_collector:
		count += 1
		# if count > 3:  # Optional limit
		# 	break

		async with stop_signals_lock:
			if stop_signals.get(session_id):
				print(f"Stopping stream for session: {session_id}")
				break

			results_for_data = {}
			for criterion in criteria:
				# Filter active assertions
				assertions = list(filter(lambda x: x['status'] == 'active', criterion['assertions']))

				if len(assertions) == 0:
					results_for_data[criterion['id']] = []
					continue

				# Load the judge prompt
				with open('prompts/judge.json', 'r') as file:
					judge_prompt = json.load(file)

				judge_prompt.append({
					"role": "user",
					"content": json.dumps({"assertions": assertions, "data": data_collector[id]})
					})

				## Send to OpenAI API
				response = openai.chat.completions.create(
					model="gpt-4o-mini",
					messages=judge_prompt,
					temperature=0,
				)

				# Extract and format the output
				formatted_output = response.choices[0].message.content
				if isinstance(formatted_output, str):
					formatted_output = json.loads(formatted_output)    

				results_for_data[criterion['id']] = formatted_output

		# Yield results for this data ID
		yield json.dumps({id: results_for_data}) + "EOR"
		await asyncio.sleep(0)
            

@app.post("/judge")
async def judge(request: Request):
	json_data = await request.json()

	criteria = json_data.get('criteria', [])
	session_id = json_data.get('session_id')
	print("session_id ", session_id)

	if not session_id:
		return {"message": "Session ID is required", "results": None}

	# Initialize stop signal for this session
	async with stop_signals_lock:
		stop_signals[session_id] = False

	# Check if there is criteria
	if not criteria:
		return {"message": "No criteria provided", "results": None}

	data_collector = json_data.get('data', {})

	# Use StreamingResponse to stream the results
	return StreamingResponse(generate_results(data_collector, criteria, session_id), media_type="application/json")

	return StreamingResponse(await loop.run_in_executor(executor,generate_results, data_collector, criteria, session_id), media_type="application/json")





if __name__ == "__main__":
	print("running main")
	uvicorn.run("main:app", port=8089, host="0.0.0.0", log_level="info", reload=True, workers=4)