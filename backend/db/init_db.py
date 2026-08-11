from db.database import Base, engine
from db.models import User, UserProfile, Job, SkillScore

def init_db():
    # Create all tables in the database
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database tables created.")
