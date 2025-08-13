from pydantic import BaseModel
from typing import List
from Models.Examples import Example

class InputOutputs(BaseModel):
    input: str
    output: str

class Assertion(BaseModel):
    criteria_id: int
    assertion_index: int
    name: str
    old_name: str = ""
    inputs: List[str] = []
    outputs: List[str] = []
    results: List[str] = []
    


class AssertionFromExamples(BaseModel):
    criteria_id: int
    assertion_index: int
    name: str=""
    old_name: str = ""
    old_passingInputs: List[str] = []
    old_passingOutputs: List[str] = []
    old_failingInputs: List[str] = []
    old_failingOutputs: List[str] = []
    passingInputs: List[str] = []
    passingOutputs: List[str] = []
    failingInputs: List[str] = []
    failingOutputs: List[str] = []
    results: List[str] = []


class CriteriaAssertion(BaseModel):
    NAME: str
    DESCRIPTION: str
    EXAMPLES: List[Example] = []
    