import sys
import os
sys.path.insert(0, os.path.abspath("."))
from fastapi.testclient import TestClient
from main import app
from db.database import SessionLocal
from db.models import Admin
import bcrypt

client = TestClient(app)

# Test Admin login to get token
login_res = client.post("/api/v1/admin-login", json={"admin_id": "admin", "pin": "1234"})
print("Admin Login status:", login_res.status_code)
token = login_res.json().get("access_token")

# Test Admin Stats
stats_res = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {token}"})
print("Admin Stats status:", stats_res.status_code)
print("Admin Stats summary:", stats_res.json())

# Test Admin Users
users_res = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
print("Admin Users status:", users_res.status_code)
print("Admin Users count:", len(users_res.json().get("users", [])))
