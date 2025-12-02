import sys
import json

data = json.loads(sys.argv[1]) # Get args from Electron

num1 = data["num1"]
num2 = data["num2"]
op = data["operation"]

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
    print ("Error: Unknown operation")
    sys.exit(1)

print(f"{result}")