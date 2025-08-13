import json
def getJudgeResults(assertion, input, output, llm):    
    #read json file
    with open("prompts/judge.json", "r") as file:
        system_prompt = json.load(file)
    messages = [
        {"role": "system", "content": system_prompt[0]['content']},
        {"role": "user", "content": f'''
            Input: {str(input)}
            Output: {str(output)}
            Criteria with examples: {str(assertion)}
    '''}]

    
    response = llm.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
        max_tokens=4096,
        temperature=0,
        response_format={"type": "json_object"}

        )

    result = response.choices[0].message.content
    #if result is a string, convert to json
    if isinstance(result, str):
        result = json.loads(result)
    return result
