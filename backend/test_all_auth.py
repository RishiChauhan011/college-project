import requests, json, uuid

BASE = "http://localhost:8000/api/v1"
test_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
test_password = "TestPass123!"

print("=== Test: Signup ===")
r = requests.post(f"{BASE}/signup", json={"name": "Test User", "email": test_email, "password": test_password})
print("Status:", r.status_code)
print("Response:", r.json())

print("\n=== Test: User Login (valid) ===")
from urllib.parse import urlencode
form = urlencode({"username": test_email, "password": test_password})
r2 = requests.post(f"{BASE}/login", data=form, headers={"Content-Type": "application/x-www-form-urlencoded"})
print("Status:", r2.status_code)
d = r2.json()
print("Response:", json.dumps(d, indent=2))

if r2.status_code == 200:
    token = d["access_token"]
    print("\n=== Test: Profile with user token ===")
    prof = requests.get(f"{BASE}/profile", headers={"Authorization": f"Bearer {token}"})
    print("Status:", prof.status_code)
    print("Profile:", json.dumps(prof.json(), indent=2))

print("\n=== Test: User Login (invalid) ===")
form_bad = urlencode({"username": test_email, "password": "wrongpassword"})
r3 = requests.post(f"{BASE}/login", data=form_bad, headers={"Content-Type": "application/x-www-form-urlencoded"})
print("Status:", r3.status_code)
print("Response:", r3.json())

print("\n=== Test: Admin Login (valid) ===")
r4 = requests.post(f"{BASE}/admin-login", json={"admin_id": "admin", "pin": "1234"})
print("Status:", r4.status_code)
print("access_token received:", bool(r4.json().get("access_token")))

print("\n=== Test: Admin Login (invalid) ===")
r5 = requests.post(f"{BASE}/admin-login", json={"admin_id": "admin", "pin": "0000"})
print("Status:", r5.status_code)
print("Response:", r5.json())
