from pydantic import BaseModel
from typing import List


class Example(BaseModel):
    input: str = ""
    output: str= ""
    result: str = ""
    reason: str = ""