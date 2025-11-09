from fastapi import FastAPI, HTTPException, Query
from data_connection import engine  # Import DB connection from dataconnection.py
from sqlalchemy import text

app = FastAPI(title="Client Data API", description="Fetch client data from PostgreSQL database", version="1.0")



@app.get("/")
def home():
    return {"message": "Welcome to the Client Data API!"}


@app.get("/client")
def get_client(
    id: int = Query(None),
    name: str = Query(None),
    phone_number: str = Query(None)
):
    """
    Fetch a client record by ID, name, or phone number from the `clients` table.
    Example: /client?id=1  or  /client?name=Amit  or  /client?phone_number=9999999999
    """

    query = "SELECT * FROM clients WHERE 1=1"
    params = {}

    if id:
        query += " AND id = :id"
        params["id"] = id
    if name:
        query += " AND LOWER(name) = LOWER(:name)"
        params["name"] = name
    if phone_number:
        query += " AND phone_number = :phone_number"
        params["phone_number"] = phone_number

    with engine.connect() as conn:
        result = conn.execute(text(query), params)
        rows = result.fetchall()

        if not rows:
            raise HTTPException(status_code=404, detail="No matching client found in database")

        return [dict(row._mapping) for row in rows]


@app.get("/clients")
def get_all_clients():
    """Fetch all client records from the `clients` table."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM clients"))
        rows = result.fetchall()

        if not rows:
            raise HTTPException(status_code=404, detail="No clients found in database")

        return [dict(row._mapping) for row in rows]
