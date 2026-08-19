import requests

try:
    res = requests.post("http://localhost:8000/api/v1/admin-login", json={"admin_id": "admin", "pin": "1234"})
    print("Status:", res.status_code)
    print("Response:", res.json())
except Exception as e:
    print("Error:", e)
