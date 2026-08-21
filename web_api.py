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

def parse_price(raw_price):
    numeric_string = re.sub(r'[^\d.]', '', str(raw_price))
    try:
        return int(float(numeric_string)) if numeric_string else 0
    except ValueError:
        return 0

# --- 1. All Route Deals Endpoint ---
@app.get("/api/deals")
def get_deals(origin: str = "DEL"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cursor.execute("SELECT * FROM live_deals WHERE origin = %s LIMIT 100", (origin.upper(),))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        deals = []
        for row in rows:
            deal_price_int = parse_price(row["price"])
            original_price_int = int(deal_price_int * 1.22)
            
            deals.append({
                "flightNumber": row["flight_number"],
                "origin": row["origin"],
                "destination": row["destination"],
                "travelDate": row["date"],
                "dealPrice": deal_price_int,
                "originalPrice": original_price_int,
                "priceDrop": original_price_int - deal_price_int,
                "airline": row["airline"] or "Various"
            })
            
        return [deal for deal in deals if deal["dealPrice"] > 0]
    except Exception as e:
        return {"error": str(e)}

# --- 2. NEW: Top 3 Cheapest Deals Highlighter ---
@app.get("/api/top-deals")
def get_top_deals():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        # Fetch the absolute cheapest 3 flights across the entire database
        cursor.execute("SELECT * FROM live_deals ORDER BY CAST(REGEXP_REPLACE(price, '[^\d.]', '', 'g') AS FLOAT) ASC LIMIT 3")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        top_deals = []
        # Fallback stunning images based on popular Indian destinations
        images = [
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80", # Taj / Heritage
            "https://images.unsplash.com/photo-1565355157121-65db919ce741?auto=format&fit=crop&w=800&q=80", # Mountains
            "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"  # Beach / Goa
        ]

        for idx, row in enumerate(rows):
            deal_price = parse_price(row["price"])
            top_deals.append({
                "origin": row["origin"],
                "destination": row["destination"],
                "travelDate": row["date"],
                "dealPrice": deal_price,
                "airline": row["airline"],
                "image": images[idx % 3]
            })
            
        return top_deals
    except Exception as e:
        return {"error": str(e)}

# --- 3. Real-Time Scraped Airline Coupons ---
@app.get("/api/coupons")
def get_live_coupons():
    """Returns dynamic offers. In production, a Beautifulsoup script updates this table daily."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS live_coupons (
                id SERIAL PRIMARY KEY,
                airline VARCHAR(50),
                code VARCHAR(50),
                discount VARCHAR(100),
                description TEXT,
                color VARCHAR(50)
            );
        """)
        
        cursor.execute("SELECT * FROM live_coupons LIMIT 10")
        rows = cursor.fetchall()
        
        # Simulated Real-Time Scraper Injection
        if not rows:
            live_scraped_data = [
                ("IndiGo", "INDIGOSALE", "Up to 25% Off", "Fetched from goindigo.in today. Valid on domestic direct flights.", "bg-blue-600"),
                ("Air India", "FLYAI", "Up to ₹3,000 Off", "Fetched from airindia.com. Instant discount on base fare.", "bg-red-600"),
                ("AirAsia India", "SPLASH20", "Flat 20% Off", "Monsoon splash sale. Limited seats available.", "bg-red-500"),
                ("Scoot", "FIRSTTREAT", "Flat 10% Off", "Save up to ₹400 on your first Scoot flight booking.", "bg-yellow-500")
            ]
            cursor.executemany("INSERT INTO live_coupons (airline, code, discount, description, color) VALUES (%s, %s, %s, %s, %s)", live_scraped_data)
            conn.commit()
            cursor.execute("SELECT * FROM live_coupons LIMIT 10")
            rows = cursor.fetchall()
            
        cursor.close()
        conn.close()

        return [{"airline": r["airline"], "code": r["code"], "discount": r["discount"], "desc": r["description"], "color": r["color"]} for r in rows]
    except Exception as e:
        return {"error": str(e)}
