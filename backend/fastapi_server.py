from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow Next.js dev server 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CalcRequest(BaseModel):
    num1: float
    num2: float
    operation: str

@app.post("/calculate")
async def calculate(req: CalcRequest):
    num1 = req.num1
    num2 = req.num2
    op = req.operation

    if op == 'add':
        result = num1 + num2
    elif op == 'subtract':
        result = num1 - num2
    elif op == 'multiply':
        result = num1 * num2
    elif op == 'divide':
        if num2 != 0:
            result = num1 / num2
        else:
            result = "Error: Division by zero"
    else:
        result = "Error: Unknown operation"

    return {"result": result}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)  