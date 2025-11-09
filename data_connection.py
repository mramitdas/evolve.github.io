
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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
