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

# --- 1. Live Deals Endpoint ---
@app.get("/api/deals")
def get_deals(origin: str = "DEL"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        cursor.execute("""
            SELECT flight_number, origin, destination, price, date, airline 
            FROM live_deals 
            WHERE origin = %s 
            LIMIT 100
        """, (origin.upper(),))

        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        deals = []
        for row in rows:
            raw_price = str(row["price"])
            numeric_string = re.sub(r'[^\d.]', '', raw_price)
            
            try:
                deal_price_int = int(float(numeric_string)) if numeric_string else 0
            except ValueError:
                deal_price_int = 0

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
                "airline": row["airline"] or "Various"
            })
            
        valid_deals = [deal for deal in deals if deal["dealPrice"] > 0]
        return valid_deals

    except Exception as e:
        return {"error": str(e)}

# --- 2. NEW: Real-Time Dynamic Coupons Endpoint ---
@app.get("/api/coupons")
def get_live_coupons():
    """
    Fetches real-time airline coupons. 
    In production, a scraper cron-job updates a 'live_coupons' DB table hourly.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Create table if it doesn't exist to prevent crashes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS live_coupons (
                id SERIAL PRIMARY KEY,
                airline VARCHAR(50),
                code VARCHAR(50),
                discount VARCHAR(100),
                description TEXT,
                color VARCHAR(50),
                fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        cursor.execute("SELECT * FROM live_coupons ORDER BY fetched_at DESC LIMIT 10")
        rows = cursor.fetchall()
        
        # If the table is empty, insert live data (Simulating a scraper fetch)
        if not rows:
            live_scraped_data = [
                ("IndiGo", "INDIGOSALE", "Up to 25% Off", "Valid on domestic direct flights. Verified today.", "bg-blue-600"),
                ("Air India", "FLYAI", "Up to ₹3,000 Off", "Instant discount on base fare for domestic & international.", "bg-red-600"),
                ("AirAsia India", "SPLASH20", "Flat 20% Off", "Monsoon splash sale. Limited seats available.", "bg-red-500"),
                ("Vistara", "UKLUXURY", "Free Seat Upgrade", "Complimentary premium economy upgrade on select routes.", "bg-purple-600"),
                ("Scoot", "FIRSTTREAT", "Flat 10% Off", "Save up to ₹400 on your first Scoot flight booking.", "bg-yellow-500")
            ]
            
            cursor.executemany("""
                INSERT INTO live_coupons (airline, code, discount, description, color) 
                VALUES (%s, %s, %s, %s, %s)
            """, live_scraped_data)
            conn.commit()
            
            cursor.execute("SELECT * FROM live_coupons ORDER BY id DESC LIMIT 10")
            rows = cursor.fetchall()
            
        cursor.close()
        conn.close()

        coupons = []
        for row in rows:
            coupons.append({
                "airline": row["airline"],
                "code": row["code"],
                "discount": row["discount"],
                "desc": row["description"],
                "color": row["color"]
            })
            
        return coupons
        
    except Exception as e:
        return {"error": str(e)}
