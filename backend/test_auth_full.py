import requests, json

BASE = "http://localhost:8000/api/v1"

print("=== Test 1: Valid admin credentials ===")
r = requests.post(f"{BASE}/admin-login", json={"admin_id": "admin", "pin": "1234"})
print("Status:", r.status_code)
d = r.json()
print("Response:", json.dumps(d, indent=2))

if r.status_code == 200:
    token = d["access_token"]
    print("\n=== Test 2: Profile endpoint with admin token ===")
    prof = requests.get(f"{BASE}/profile", headers={"Authorization": f"Bearer {token}"})
    print("Status:", prof.status_code)
    print("Profile:", json.dumps(prof.json(), indent=2))

print("\n=== Test 3: Invalid credentials ===")
r2 = requests.post(f"{BASE}/admin-login", json={"admin_id": "admin", "pin": "0000"})
print("Status:", r2.status_code)
print("Response:", r2.json())

print("\n=== Test 4: Regular user login ===")
# Check if there's a user in the DB
from urllib.parse import urlencode
form = urlencode({"username": "test@test.com", "password": "testpass"})
r3 = requests.post(f"{BASE}/login", data=form, headers={"Content-Type": "application/x-www-form-urlencoded"})
print("Status:", r3.status_code, "(expected 401 if user doesn't exist)")
