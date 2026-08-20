import requests, json
from urllib.parse import urlencode

if __name__ == "__main__":
    BASE = "http://localhost:8000/api/v1"

    # Step 1: Login as test user (created earlier)
    print("=== Step 1: Login ===")
    form = urlencode({"username": "test_7cefa9ea@test.com", "password": "TestPass123!"})
    r = requests.post(f"{BASE}/login", data=form, headers={"Content-Type": "application/x-www-form-urlencoded"})
    print("Status:", r.status_code)
    if r.status_code != 200:
        print("Login failed:", r.json())
        exit(1)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Step 2: Get current profile
    print("\n=== Step 2: GET /profile (before update) ===")
    r2 = requests.get(f"{BASE}/profile", headers=headers)
    print("Status:", r2.status_code)
    print("Profile:", json.dumps(r2.json(), indent=2))

    # Step 3: PUT /profile (update)
    print("\n=== Step 3: PUT /profile ===")
    update_payload = {
        "name": "Test User Updated",
        "education": "M.S. Computer Science",
        "experience_years": 3,
        "preferred_field": "Artificial Intelligence / MLOps",
        "preferred_location": "Remote",
        "skills": ["Python", "Machine Learning", "FastAPI"]
    }
    r3 = requests.put(f"{BASE}/profile", json=update_payload, headers=headers)
    print("Status:", r3.status_code)
    print("Response:", json.dumps(r3.json(), indent=2))

    # Step 4: GET /profile again to confirm persistence
    print("\n=== Step 4: GET /profile (after update) ===")
    r4 = requests.get(f"{BASE}/profile", headers=headers)
    print("Status:", r4.status_code)
    print("Profile:", json.dumps(r4.json(), indent=2))
