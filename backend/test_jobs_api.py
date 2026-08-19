from fastapi.testclient import TestClient
import sys
import os
sys.path.insert(0, os.path.abspath("."))
from main import app

client = TestClient(app)
try:
    response = client.get("/api/v1/jobs?domain=AI%20%26%20Data%20Science")
    print(response.status_code)
    print(response.json())
except Exception as e:
    import traceback
    traceback.print_exc()
