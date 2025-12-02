import json
from http.server import BaseHTTPRequestHandler, HTTPServer

class JSONRPCWithCORS(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        request = json.loads(post_data.decode('utf-8'))

        method_name = request.get("method")
        params = request.get("params", [])
        request_id = request.get("id")

        methods = {
            "add": lambda a, b: a + b,
            "subtract": lambda a, b: a - b,
            "multiply": lambda a, b: a * b,
            "divide": lambda a, b: a / b if b != 0 else None
        }

        if method_name not in methods:
            response = {"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": request_id}
        else:
            try:
                a, b = params
                result = methods[method_name](a, b)
                if result is None:
                    response = {"jsonrpc": "2.0", "error": {"code": -32603, "message": "Division by zero"}, "id": request_id}
                else:
                    response = {"jsonrpc": "2.0", "result": result, "id": request_id}
            except Exception as e:
                response = {"jsonrpc": "2.0", "error": {"code": -32603, "message": str(e)}, "id": request_id}

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

if __name__ == "__main__":
    server = HTTPServer(('localhost', 4000), JSONRPCWithCORS)
    print("JSON-RPC 2.0 server with CORS running on http://localhost:4000")
    server.serve_forever()