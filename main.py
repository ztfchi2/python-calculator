from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List

import json
import util
import operation

class Item(BaseModel):
    operands: List[str]
    operators: List[str]

app = FastAPI()

@app.get("/")
async def index():
    return FileResponse('static/index.html',media_type='text/html')

@app.post('/compute')
async def compute(item: Item):
    operands = item.operands
    operators = item.operators

    operator_counts = len(operators)
    for i in range(operator_counts):
        operator = operators.pop()
        operand2 = util.stringToNumber(operands.pop())
        operand1 = util.stringToNumber(operands.pop())
        operands.append(operation.binaryOperate(operand1, operand2, operator))

    answer = operands.pop();

    return {'message' : 'success', 'answer' : answer}

app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == '__main__':  # pragma: no cover
    app.run(port=8080)