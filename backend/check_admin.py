import sys
import os
sys.path.insert(0, os.path.abspath("."))
from db.database import SessionLocal, engine, Base
from db.models import Admin
import bcrypt
from api.routes.routes_auth import verify_password

# Ensure tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()
admins = db.query(Admin).all()
print(f"Total admins found: {len(admins)}")
for a in admins:
    print(f"Admin ID: '{a.admin_id}', PIN Hash: '{a.pin_hash}'")
    match = verify_password("1234", a.pin_hash)
    print(f"Password '1234' matches: {match}")

if len(admins) == 0:
    print("Creating default admin...")
    salt = bcrypt.gensalt()
    hashed_pin = bcrypt.hashpw("1234".encode('utf-8'), salt).decode('utf-8')
    default_admin = Admin(admin_id="admin", pin_hash=hashed_pin)
    db.add(default_admin)
    db.commit()
    print("Admin 'admin' / '1234' created successfully!")
