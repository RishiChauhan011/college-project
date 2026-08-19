import requests
import json

res = requests.get("http://localhost:8000/openapi.json")
print("Status:", res.status_code)
paths = list(res.json().get("paths", {}).keys())
print("Registered paths:")
for p in sorted(paths):
    print(" ", p)
