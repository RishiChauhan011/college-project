import requests

# 1. Admin login
res = requests.post("http://localhost:8000/api/v1/admin-login", json={"admin_id": "admin", "pin": "1234"})
print("Admin Login Status:", res.status_code)
token = res.json().get("access_token")
print("Token received:", bool(token))

# 2. Get Profile with token
headers = {"Authorization": f"Bearer {token}"}
prof_res = requests.get("http://localhost:8000/api/v1/profile", headers=headers)
print("Profile Status:", prof_res.status_code)
print("Profile Data:", prof_res.json())
