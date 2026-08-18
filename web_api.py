import os
import psycopg2
import psycopg2.extras
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
def get_deals(origin: str = "BLR"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        cursor.execute("""
            SELECT flight_number, origin, destination, price, date, airline, booking_link
            FROM live_deals
            WHERE origin = %s
            LIMIT 100
        """, (origin.upper(),))

        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        deals = []
        for row in rows:
            # Clean the price string and convert to integer
            deal_price_int = int(float(str(row["price"]).replace(" INR", "").strip()))

            # Generate a realistic 'original price' (e.g., 20% higher than the deal)
            original_price_int = int(deal_price_int * 1.20)
            price_drop = original_price_int - deal_price_int

            deals.append({
                "flightNumber": row["flight_number"],
                "origin": row["origin"],
                "destination": row["destination"],
                "travelDate": row["date"], # Standardized travel date
                "dealPrice": deal_price_int,
                "originalPrice": original_price_int,
                "priceDrop": price_drop,
                "airline": row["airline"],
                "bookingLink": row["booking_link"]
            })

        return deals

    except Exception as e:
        return {"error": str(e)}
