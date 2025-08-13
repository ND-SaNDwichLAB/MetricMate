from fastapi import APIRouter
from fastapi import Request

import configparser
import openai
import pandas as pd
import numpy as np

import json


from helpers.assertion import format_output
from Models.Assertion import AssertionFromExamples
import uuid


router = APIRouter()

#set up openai
config = configparser.ConfigParser()
# Read the config.ini file
config.read('config.ini')
API_KEY = config.get("settings", "openai_api").split('#')[0].strip()
openai.api_key = API_KEY


@router.get("/")
def criteriaDefinition(request:Request):

    context =  request.headers.get('data-context')

	#TODO: generate embeddings if the embeddings are not available
	
    df_cluster = pd.read_csv("data/patient_bot_output_embeddings_clusters.csv")

    clusters = df_cluster['cluster'].unique()

    sampled_rows = []

    for cluster in clusters:
        selected = df_cluster[df_cluster['cluster'] == cluster].sample(1)
        sampled_rows.append(selected)

    sampled_inputs = []
    sampled_outputs = []
    sampled_pairs = []

    for row in sampled_rows:
        sampled_inputs.append(row['input'].values[0])
        sampled_outputs.append(row['output'].values[0])
        sampled_pairs.append({"input": row['input'].values[0], "output": row['output'].values[0]})

    # print("sampled pairs: ", sampled_pairs)

    #generate highlevel criteria
    with open('prompts/generate_criteria.json', 'r') as file:
        generate_crt = json.load(file)

    
    generate_crt.append({"role":"user", "content":f'''"context":{context}, "input output pairs":{sampled_pairs}'''})

    response = openai.chat.completions.create(
            model="gpt-4o",
            messages=generate_crt,
            max_tokens=4096,
            temperature=0,
            response_format={ "type": "json_object" }
    )
    criteria = response.choices[0].message.content

    print("criteria: ", criteria)

    print("criteria type: ", type(criteria))

    #if criteria is a string, convert to json
    if isinstance(criteria, str):
        criteria = json.loads(criteria)


    results = {}
    counter = 0
    for criterionxx in criteria['criteria']:

        if counter >= 3:
            break

        counter += 1
         

        #use high level criteria to generate assertions, grammar and examples
        with open('prompts/generate_assertions.json', 'r') as file:
            generate_assertions = json.load(file)
        
        generate_assertions.append({"role":"user", "content":f'''"context":{context}, "criteria":{criterionxx}'''})
        response = openai.chat.completions.create(
                model="gpt-4o",
                messages=generate_assertions,
                max_tokens=4096,
                temperature=0,
                response_format={ "type": "json_object" }
        )
        criteria_with_assrt = response.choices[0].message.content
        if isinstance(criteria_with_assrt, str):
            criteria_with_assrt = json.loads(criteria_with_assrt)

        # print(f"this criteria {criteria_with_assrt}\n\n")

        if not isinstance(criteria_with_assrt, list):
            criteria_with_assrt = [criteria_with_assrt]

        #iterate over each criterion and add the id and status
        for i, criterion in enumerate(criteria_with_assrt):
            criterion['id'] = f"crt_{counter}"
            criterion['status'] = 'off'

            #iterate over each assertion and add the id
            assertions = criterion['ASSERTIONS']
            for assertion in assertions:
                assertion['id'] = i

            #update the criterion
            criterion['ASSERTIONS'] = assertions

            print(f"this criterion being added is {criterion}\n\n")

            results[f"crt_{counter}"] = criterion
        # print("results", results)
    #change to string
    results = json.dumps(results)
    #make all lowercase
    results = results.lower()
    #change back to json
    results = json.loads(results)

    return results


@router.post("/generate_examples")
async def generateExamples(request:Request):
    request_json = await request.json()
    #get the assertion, current examples, results, criteria name and definition
    assertion = request_json['assertion']
    current_examples = request_json['examples']
    results = request_json['results']
    criteria_name = request_json['criteria_name']
    criteria_definition = request_json['criteria_definition']

    #generate new examples and results
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": f''''''}
        ],
        max_tokens=4096,
        temperature=0,
        response_format={ "type": "json_object" }
        )
    


@router.post("/compare_data")
async def compareData(request:Request):
    request_json = await request.json()
    #get the data to compare
    groups = request_json['groups']

    messages = []
    #compare the data to generate a criteria
    with open('prompts/compare_data.json', 'r') as file:
        compare_data_system = json.load(file)

    messages.append(compare_data_system)
    #add the data to compare
    messages.append({"role":"user", "content":f'''{groups}'''})

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=4096,
        temperature=0,
        response_format={ "type": "json_object" }
        )
    

    data = response.choices[0].message.content
    print("data before reformat: ", data)
    #if data is a string, convert to json
    if isinstance(data, str):
        data = json.loads(data)

    print("data: ", data)

    #iterate through each criteria and add the id and assign it a random id
    for group_id in data:

        temp_data = data[group_id]
        print("temp_data: ", temp_data)
        for i in range(len(temp_data)):
            temp_data[i]['id'] = str(uuid.uuid4())
        data[group_id] = temp_data

    
    #return data to frontend
    return {"suggested_criteria":data}

    #use data to generate criteria


    #generate new examples and results
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": f''''''}
        ],
        max_tokens=4096,
        temperature=0,
        response_format={ "type": "json_object" }
        )



@router.post("/modify/assertion_by_example")
def criteriaModAssert(assertionHistory: AssertionFromExamples):

    old_assertion = assertionHistory.old_name
    old_passing_examples = assertionHistory.old_passingInputs
    old_failing_examples = assertionHistory.old_failingInputs
    new_passing_examples = assertionHistory.passingInputs
    new_failing_examples = assertionHistory.failingInputs


    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": f'''
            Your task is to update the evaluation assersion based on the previous examples that should pass and fail and the users desired outputs. The old assersion incorrectly passes on the old passing examples and fail on the old failing examples. The new assersion should pass on the new passing examples and fail on the new failing examples.
            Your goal is to update the assertion so that it passes on the new passing examples and fails on the new failing examples.
            Based on the data show your reasoning for the new assertion by providing an observation, an action you would take to change the assertion and the new assertion
            Be specific and provide examples for your reasoning. In your action you should argue how the new assertion will support the new examples and not the old ones.
            Follow the following format and only generate the required text, Do not generate other explanations or examples.
                (observation)
                (action)
                (new assertion)
            '''},
            {"role": "user", "content":f'''
            old assertion: {old_assertion}
            old passing examples:{str(old_passing_examples)}
            old failing examples:{str(old_failing_examples)}


            new passing examples:{str(new_passing_examples)}
            new failing examples:{str(new_failing_examples)}

            Focus on the example that was flipped: {new_passing_examples[0]}
            ''' }
        ],
        max_tokens=4096,
        temperature=0
        ) 

    data =  response.choices[0].message.content
    new_assertion = format_output(data)

    #modify assertion, generate test case changes, modify evaluation, modify outputs
    return {"request":assertionHistory, "results":new_assertion}



@router.post("/data_recommendation")
async def criteriaDataRecommendation(request:Request):
    #get the criteria name from the request
    request_json = await request.json()
    criteria_info = request_json['criteria_info']

    embedding_df = pd.read_csv("data/patient_bot_output_embeddings.csv")


    #get embeddings for the criteria
    response = openai.embeddings.create(
        input=criteria_info,
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

    return {"top_5_ids":top_5_ids}









# @app.post("/assertions/results")
# def resultsForAssertions(assertion: Assertion):
#     response = openai.chat.completions.create(
# 	model="gpt-4o",
# 	messages=[
# 		{"role": "system", "content": f'''
# 			For each of the  following inputs and output pairs give me a true or false response if the output is a valid response to the input according to the specific criteria.
# 			Your output should only be in a list format that looks like this: 
# 			[True, False, True, True, False]
	
# 			For the following criteria: {assertion.name}
# 			Inputs: {str(assertion.inputs)}
# 			Outputs: {str(assertion.outputs)}
# 	'''}],
# 		max_tokens=4096,
# 		temperature=0,
# 		)

#     results = eval(response.choices[0].message.content)
#     return {"request":assertion , "results":results}
