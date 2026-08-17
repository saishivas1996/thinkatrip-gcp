import os
import time
import requests
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

DUFFEL_TOKEN = os.getenv("DUFFEL_ACCESS_TOKEN")

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
    # Southeast & East Asia
    "DPS": "Bali", "HKT": "Phuket", "BKK": "Bangkok", "SIN": "Singapore", 
    "KUL": "Kuala Lumpur", "SGN": "Ho Chi Minh City", "HAN": "Hanoi", 
    "MNL": "Manila", "NRT": "Tokyo (Narita)", "HND": "Tokyo (Haneda)", 
    "KIX": "Osaka", "ICN": "Seoul", "TPE": "Taipei", "HKG": "Hong Kong",
    "PNH": "Phnom Penh", "CMB": "Colombo", "MLE": "Maldives", "KTM": "Kathmandu",
    
    # Middle East
    "DXB": "Dubai", "DOH": "Doha", "AUH": "Abu Dhabi", "SHJ": "Sharjah",
    "MCT": "Muscat", "KWI": "Kuwait City", "BAH": "Bahrain", "RUH": "Riyadh",
    "JED": "Jeddah", "AMM": "Amman",

    # Europe
    "LHR": "London (Heathrow)", "CDG": "Paris", "AMS": "Amsterdam", "FRA": "Frankfurt",
    "MAD": "Madrid", "BCN": "Barcelona", "FCO": "Rome", "MXP": "Milan",
    "ZRH": "Zurich", "VIE": "Vienna", "CPH": "Copenhagen", "ARN": "Stockholm",
    "OSL": "Oslo", "DUB": "Dublin", "LIS": "Lisbon", "ATH": "Athens",
    "IST": "Istanbul", "PRG": "Prague", "WAW": "Warsaw", "BRU": "Brussels",
    "MUC": "Munich", "BER": "Berlin",

    # North & Central America
    "JFK": "New York", "LAX": "Los Angeles", "SFO": "San Francisco", 
    "YYZ": "Toronto", "YVR": "Vancouver", "EWR": "Newark", "ORD": "Chicago",
    "MIA": "Miami", "IAD": "Washington DC", "DFW": "Dallas", 
    "YUL": "Montreal", "MEX": "Mexico City",

    # Oceania
    "SYD": "Sydney", "MEL": "Melbourne", "BNE": "Brisbane", "PER": "Perth",
    "AKL": "Auckland", "CHC": "Christchurch", "NAN": "Nadi",

    # Africa & Indian Ocean
    "CPT": "Cape Town", "JNB": "Johannesburg", "NBO": "Nairobi", 
    "ADD": "Addis Ababa", "CAI": "Cairo", "MRU": "Mauritius", 
    "SEZ": "Seychelles", "LOS": "Lagos", "CMN": "Casablanca",

    # South America
    "GRU": "São Paulo", "GIG": "Rio de Janeiro", "EZE": "Buenos Aires", 
    "BOG": "Bogotá", "SCL": "Santiago", "LIM": "Lima"
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
    """Ensures the table exists and includes origin tracking."""
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
        
        cursor.execute('''
            ALTER TABLE live_deals ADD COLUMN IF NOT EXISTS origin VARCHAR(50);
        ''')
        
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Database schema verified and ready.")
    except Exception as e:
        print(f"❌ Database setup error: {e}")

def search_route(origin_code, dest_code, travel_date):
    """Queries the Duffel API for the cheapest economy ticket on a given route."""
    url = "https://api.duffel.com/air/offer_requests"
    headers = {
        "Duffel-Version": "v2",
        "Authorization": f"Bearer {DUFFEL_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "data": {
            "cabin_class": "economy",
            "slices": [{"origin": origin_code, "destination": dest_code, "departure_date": travel_date}],
            "passengers": [{"type": "adult"}]
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 201:
            offers = response.json().get('data', {}).get('offers', [])
            if offers:
                offers.sort(key=lambda x: float(x['total_amount']))
                best_offer = offers[0]
                
                airline = best_offer['owner']['name']
                price = f"{best_offer['total_amount']} {best_offer['total_currency']}"
                
                segment = best_offer['slices'][0]['segments'][0]
                marketing_carrier = segment['marketing_carrier']['iata_code']
                flight_num = segment['marketing_carrier_flight_number']
                full_flight_number = f"{marketing_carrier}{flight_num}"
                
                return {
                    "flight_number": full_flight_number,
                    "origin": origin_code,
                    "destination": dest_code,
                    "price": price,
                    "date": travel_date,
                    "airline": airline
                }
    except Exception as e:
        print(f"⚠️ Network exception searching {origin_code} -> {dest_code}: {e}")
        
    return None

def save_deal(deal):
    """Upserts the deal into PostgreSQL."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO live_deals (flight_number, origin, destination, price, date, airline)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (flight_number) 
            DO UPDATE SET price = EXCLUDED.price, date = EXCLUDED.date, origin = EXCLUDED.origin;
        ''', (
            deal['flight_number'], 
            deal['origin'], 
            deal['destination'], 
            deal['price'], 
            deal['date'], 
            deal['airline']
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        print(f"💾 Saved Deal: {deal['origin']} ✈️ {deal['destination']} ({deal['flight_number']}) for {deal['price']}")
    except Exception as e:
        print(f"❌ Database insert error: {e}")

def run_deal_hunter():
    print("🚀 Starting Global Outbound Deal Hunter...")
    setup_database()
    
    # Target dates: 30 days and 60 days out for varied deal discovery
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
                
                # Critical: 1 second delay to avoid hitting Duffel API rate limits
                time.sleep(1)

if __name__ == "__main__":
    run_deal_hunter()
