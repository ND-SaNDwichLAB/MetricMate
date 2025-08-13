from pydantic import BaseModel
from typing import List

from Models.Assertion import CriteriaAssertion

class Criteria(BaseModel):
    id: str
    status: str
    CRITERION_NAME: str
    DEFINITION: str
    ASSERTIONS: List[CriteriaAssertion] = []
