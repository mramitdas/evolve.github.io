from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import hashlib, secrets
from data_connection import SessionLocal, PasswordTable  # ✅ Imported from separate file

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
    record = db.query(PasswordTable).first()
    if record:
        record.password_hash = hashed
    else:
        db.add(PasswordTable(password_hash=hashed))
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
