import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

DUFFEL_TOKEN = os.getenv("DUFFEL_ACCESS_TOKEN")

def search_duffel_flights():
    print("🛫 Searching Duffel Airways sandbox...")
    
    url = "https://api.duffel.com/air/offer_requests"
    headers = {
        "Duffel-Version": "v2",
        "Authorization": f"Bearer {DUFFEL_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # We are asking Duffel for a one-way economy flight from LHR to JFK
    payload = {
        "data": {
            "cabin_class": "economy",
            "slices": [
                {
                    "origin": "LHR",
                    "destination": "JFK",
                    "departure_date": "2026-10-15"
                }
            ],
            "passengers": [{"type": "adult"}]
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 201:
        data = response.json()
        offers = data['data']['offers']
        print(f"✅ Success! Found {len(offers)} flight offers.")
        
        # Display the first offer
        first_offer = offers[0]
        price = first_offer['total_amount']
        currency = first_offer['total_currency']
        airline = first_offer['owner']['name'] # In test mode, this will be "Duffel Airways"
        
        print(f"💰 Best Deal: {price} {currency} flying with {airline}")
    else:
        print("❌ Duffel API Error:")
        print(response.json())

if __name__ == "__main__":
    search_duffel_flights()
