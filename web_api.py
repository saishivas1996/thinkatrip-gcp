import os
import re
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
            # 1. Grab the raw string from the database
            raw_price = str(row["price"])
            
            # 2. Use Regex to strip EVERYTHING except digits and decimal points
            numeric_string = re.sub(r'[^\d.]', '', raw_price)
            
            try:
                # 3. Convert the cleaned string to a float, then to an integer
                deal_price_int = int(float(numeric_string)) if numeric_string else 0
            except ValueError:
                deal_price_int = 0

            # 4. Generate the simulated original price and drop (22% higher)
            original_price_int = int(deal_price_int * 1.22)
            price_drop_int = original_price_int - deal_price_int

            deals.append({
                "flightNumber": row["flight_number"],
                "origin": row["origin"],
                "destination": row["destination"],
                "travelDate": row["date"],
                "dealPrice": deal_price_int,
                "originalPrice": original_price_int,
                "priceDrop": price_drop_int,
                "airline": row["airline"] or "Various",
                "bookingLink": row["booking_link"]
            })
            
        # 5. Filter out deals where price is 0 to keep the frontend table clean
        valid_deals = [deal for deal in deals if deal["dealPrice"] > 0]

        return valid_deals

    except Exception as e:
        return {"error": str(e)}
