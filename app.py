import psycopg2
from flask import Flask, jsonify
from flask_cors import CORS
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)  # ✅ Enables CORS for all routes





def get_db_connection():
    return psycopg2.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        dbname=DB_CONFIG["dbname"],
        cursor_factory=RealDictCursor,  # ✅ returns rows as dict
    )


@app.route("/clients", methods=["GET"])
def get_clients():
    """
    Fetch all clients from the database.
    Returns JSON list.
    """

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, client_id, name, phone_number, TO_CHAR(end_date, 'DD-FMMon-YYYY') AS end_date, status
        FROM clients
        ORDER BY status;
        """
    )

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rows), 200


@app.route("/client/<int:client_id>", methods=["GET"])
def get_client_by_id(client_id):
    """
    Fetch single client by client_id.
    """

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, client_id, name, phone_number, end_date, status
        FROM clients
        WHERE client_id = %s;
    """,
        (client_id,),
    )

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
