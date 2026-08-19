from db.database import Base, engine, SessionLocal
from db.models import User, UserProfile, Job, SkillScore, Admin
import bcrypt

def init_db():
    # Create all tables in the database
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        if not db.query(Admin).first():
            salt = bcrypt.gensalt()
            hashed_pin = bcrypt.hashpw("1234".encode('utf-8'), salt).decode('utf-8')
            default_admin = Admin(admin_id="admin", pin_hash=hashed_pin)
            db.add(default_admin)
            db.commit()
            print("Default admin created (admin / 1234)")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    print("Database tables created.")
