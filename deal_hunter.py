import os
import time
import requests
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Travelpayouts Credentials
TRAVELPAYOUTS_API_TOKEN = os.getenv("TRAVELPAYOUTS_API_TOKEN")
TRAVELPAYOUTS_MARKER = os.getenv("TRAVELPAYOUTS_MARKER")

# --- INDIAN HUBS (OUTBOUND ORIGINS) ---
INDIAN_HUBS = {
    "VTZ": "Visakhapatnam",
    "BLR": "Bengaluru",
    "DEL": "Delhi",
    "BOM": "Mumbai",
    "HYD": "Hyderabad",
    "MAA": "Chennai",
    "CCU": "Kolkata",
    "COK": "Kochi"
}

# --- 87 MAJOR GLOBAL DESTINATIONS ---
GLOBAL_DESTINATIONS = {
    "DPS": "Bali", "HKT": "Phuket", "BKK": "Bangkok", "SIN": "Singapore", 
    "KUL": "Kuala Lumpur", "SGN": "Ho Chi Minh City", "HAN": "Hanoi", 
    "MNL": "Manila", "NRT": "Tokyo (Narita)", "HND": "Tokyo (Haneda)", 
    "KIX": "Osaka", "ICN": "Seoul", "TPE": "Taipei", "HKG": "Hong Kong",
    "PNH": "Phnom Penh", "CMB": "Colombo", "MLE": "Maldives", "KTM": "Kathmandu",
    "DXB": "Dubai", "DOH": "Doha", "AUH": "Abu Dhabi", "SHJ": "Sharjah",
    "MCT": "Muscat", "KWI": "Kuwait City", "BAH": "Bahrain", "RUH": "Riyadh",
    "JED": "Jeddah", "AMM": "Amman", "LHR": "London (Heathrow)", "CDG": "Paris", 
    "AMS": "Amsterdam", "FRA": "Frankfurt", "MAD": "Madrid", "BCN": "Barcelona", 
    "FCO": "Rome", "MXP": "Milan", "ZRH": "Zurich", "VIE": "Vienna", "CPH": "Copenhagen", 
    "ARN": "Stockholm", "OSL": "Oslo", "DUB": "Dublin", "LIS": "Lisbon", "ATH": "Athens",
    "IST": "Istanbul", "PRG": "Prague", "WAW": "Warsaw", "BRU": "Brussels",
    "MUC": "Munich", "BER": "Berlin", "JFK": "New York", "LAX": "Los Angeles", 
    "SFO": "San Francisco", "YYZ": "Toronto", "YVR": "Vancouver", "EWR": "Newark", 
    "ORD": "Chicago", "MIA": "Miami", "IAD": "Washington DC", "DFW": "Dallas", 
    "YUL": "Montreal", "MEX": "Mexico City", "SYD": "Sydney", "MEL": "Melbourne", 
    "BNE": "Brisbane", "PER": "Perth", "AKL": "Auckland", "CHC": "Christchurch", 
    "NAN": "Nadi", "CPT": "Cape Town", "JNB": "Johannesburg", "NBO": "Nairobi", 
    "ADD": "Addis Ababa", "CAI": "Cairo", "MRU": "Mauritius", "SEZ": "Seychelles", 
    "LOS": "Lagos", "CMN": "Casablanca", "GRU": "São Paulo", "GIG": "Rio de Janeiro", 
    "EZE": "Buenos Aires", "BOG": "Bogotá", "SCL": "Santiago", "LIM": "Lima"
}

def get_db_connection():
    """Connects securely to local GCP PostgreSQL database."""
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS")
    )

def setup_database():
    """Ensures the table exists and includes origin tracking & booking link[cite: 1]."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS live_deals (
                flight_number VARCHAR(50) PRIMARY KEY,
                origin VARCHAR(50),
                destination VARCHAR(50),
                price VARCHAR(50),
                date VARCHAR(50),
                airline VARCHAR(100)
            );
        ''')
        
        # Ensure new columns exist for the updated architecture
        cursor.execute('ALTER TABLE live_deals ADD COLUMN IF NOT EXISTS origin VARCHAR(50);')
        cursor.execute('ALTER TABLE live_deals ADD COLUMN IF NOT EXISTS booking_link VARCHAR(500);')
        
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Database schema verified and ready.")
    except Exception as e:
        print(f"❌ Database setup error: {e}")

def search_route(origin_code, dest_code, travel_date):
    """Queries the Travelpayouts API for the cheapest ticket and generates deep links."""
    url = f"https://api.travelpayouts.com/v1/prices/cheap?origin={origin_code}&destination={dest_code}&depart_date={travel_date}&currency=INR"
    
    headers = {
        "x-access-token": TRAVELPAYOUTS_API_TOKEN
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        data = response.json()
        
        if data.get('success') and data.get('data'):
            dest_data = data['data'].get(dest_code)
            if dest_data:
                # Grab the first available deal (usually the cheapest in the payload)
                best_offer = list(dest_data.values())[0]
                
                airline = best_offer.get('airline', 'N/A')
                price = str(best_offer.get('price'))
                flight_num = str(best_offer.get('flight_number', ''))
                full_flight_number = f"{airline}{flight_num}"
                
                # Automatically generate the monetized Aviasales affiliate deep link
                booking_link = f"https://search.aviasales.com/flights/?origin_iata={origin_code}&destination_iata={dest_code}&depart_date={travel_date}&adults=1&children=0&infants=0&trip_class=0&marker={TRAVELPAYOUTS_MARKER}&locale=en"
                
                return {
                    "flight_number": full_flight_number,
                    "origin": origin_code,
                    "destination": dest_code,
                    "price": price,
                    "date": travel_date,
                    "airline": airline,
                    "booking_link": booking_link
                }
    except Exception as e:
        print(f"⚠️ Network exception searching {origin_code} -> {dest_code}: {e}")
        
    return None

def save_deal(deal):
    """Upserts the deal and monetized link into PostgreSQL."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO live_deals (flight_number, origin, destination, price, date, airline, booking_link)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (flight_number) 
            DO UPDATE SET 
                price = EXCLUDED.price, 
                date = EXCLUDED.date, 
                origin = EXCLUDED.origin,
                booking_link = EXCLUDED.booking_link;
        ''', (
            deal['flight_number'], 
            deal['origin'], 
            deal['destination'], 
            deal['price'], 
            deal['date'], 
            deal['airline'],
            deal['booking_link']
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        print(f"💾 Saved Deal: {deal['origin']} ✈️ {deal['destination']} ({deal['flight_number']}) for ₹{deal['price']}")
    except Exception as e:
        print(f"❌ Database insert error: {e}")

def run_deal_hunter():
    print("🚀 Starting Global Outbound Deal Hunter...")
    setup_database()
    
    # Target dates: 30 days and 60 days out[cite: 1]
    dates_to_check = [
        (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
        (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d")
    ]
    
    print(f"\n🛫 Hunting Deals from {len(INDIAN_HUBS)} Indian Hubs to {len(GLOBAL_DESTINATIONS)} Global Destinations...")
    
    for origin_code in INDIAN_HUBS.keys():
        for dest_code in GLOBAL_DESTINATIONS.keys():
            for target_date in dates_to_check:
                deal = search_route(origin_code, dest_code, target_date)
                
                if deal: 
                    save_deal(deal)
                
                # Critical: 1 second delay to avoid hitting API rate limits[cite: 1]
                time.sleep(1)

if __name__ == "__main__":
    run_deal_hunter()
