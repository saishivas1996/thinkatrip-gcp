import os
import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS so your Next.js frontend can communicate with this API safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://thinkatrip.in", "https://www.thinkatrip.in"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS")
    )

@app.get("/api/deals")
def get_all_deals():
    """Fetches all live deals from PostgreSQL and serves them to Next.js"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch all deals
        cursor.execute("SELECT flight_number, origin, destination, price, date, airline FROM live_deals")

        # Convert SQL rows to a JSON-friendly list of dictionaries
        columns = [desc[0] for desc in cursor.description]
        deals = [dict(zip(columns, row)) for row in cursor.fetchall()]

        cursor.close()
        conn.close()

        return {"status": "success", "deals": deals}
    except Exception as e:
        return {"status": "error", "message": str(e)}
