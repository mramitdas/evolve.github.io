import os
from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor

# Optional: load .env file if you want local environment support
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)


# ✅ Load DB config from environment variables
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT", "5432"),  # default if not provided
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "dbname": os.getenv("DB_NAME"),
}


def get_db_connection():
    return psycopg2.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        dbname=DB_CONFIG["dbname"],
        cursor_factory=RealDictCursor,
    )


@app.route("/clients", methods=["GET"])
def get_clients():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, client_id, name, phone_number,
               TO_CHAR(end_date, 'DD-FMMon-YYYY') AS end_date,
               status, gender, image_url
        FROM clients
        ORDER BY status;
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(rows), 200


@app.route("/client/<int:client_id>", methods=["GET"])
def get_client_by_id(client_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, client_id, name, phone_number,
               TO_CHAR(end_date, 'DD-FMMon-YYYY') AS end_date,
               status, gender, image_url
        FROM clients
        WHERE client_id = %s;
    """, (client_id,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if row is None:
        return jsonify({"error": "Client not found"}), 404

    return jsonify(row), 200


@app.route("/")
def root():
    return {"message": "Flask API is running!"}, 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
