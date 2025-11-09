from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import hashlib, secrets

DATABASE_URL = (
    "postgresql+psycopg2://postgres.kcusrobnqpiqqiycwser:"
    "Smit.aupabase%402103@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class PasswordTable(Base):
    __tablename__ = "password_table"
    id = Column(Integer, primary_key=True, index=True)
    password_hash = Column(String)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Password-only Login API")

def hash_password(password: str, salt: str) -> str:
    digest = hashlib.sha256((password + salt).encode()).hexdigest()
    return salt + digest + salt

def verify_password(password: str, stored_hash: str) -> bool:
    salt_length = 16
    salt = stored_hash[:salt_length]
    expected = hash_password(password, salt)
    print("🔍 Debug:")
    print(" - Entered password:", password)
    print(" - Expected hash:", expected)
    print(" - Stored hash:", stored_hash)
    return secrets.compare_digest(expected, stored_hash)

def initialize_password():
    db = SessionLocal()
    salt = "a1b2c3d4e5f6a7b8"
    password = "admin123"
    hashed = hash_password(password, salt)
    
    # Always reset the stored password for demo
    record = db.query(PasswordTable).first()
    if record:
        record.password_hash = hashed
    else:
        new_entry = PasswordTable(password_hash=hashed)
        db.add(new_entry)
    db.commit()
    print(f"✅ Password reset to: {password}")
    print(f"🔐 Stored hash: {hashed}")
    db.close()

initialize_password()

class PasswordPayload(BaseModel):
    password: str

@app.post("/login")
def login(payload: PasswordPayload):
    db = SessionLocal()
    record = db.query(PasswordTable).first()
    db.close()
    if not record:
        raise HTTPException(status_code=404, detail="No password stored in database")
    if verify_password(payload.password.strip(), record.password_hash):
        return {"message": "login successful"}
    else:
        raise HTTPException(status_code=401, detail="invalid password")

@app.get("/")
def home():
    return {"message": "API running successfully", "usage": "POST /login with password"}
