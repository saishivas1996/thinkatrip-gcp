import random
from datetime import datetime, timedelta

ITINERARY_DATA = {
    "DXB": {
        "city": "Dubai", "country": "UAE", "emoji": "🇦🇪",
        "tagline": "Skyline, desert and luxury nights",
        "bg_queries": ["Burj Khalifa Dubai", "Dubai skyline", "Palm Jumeirah"],
        "famous_places": ["Burj Khalifa", "Palm Jumeirah", "Dubai Mall", "Dubai Marina"],
        "foods": ["Shawarma", "Luqaimat", "Machboos", "Kunafa"],
        "special_events": ["Dubai Shopping Festival", "Dubai Food Festival"],
        "must_watch": ["Dubai Fountain Show", "Desert sunset safari", "Marina dhow cruise"],
        "local_tips": ["Best season Oct to Mar", "Use metro and Nol card", "Dress modestly in old Dubai"],
        "days": {
            "Day 1": "Burj Khalifa, Dubai Mall and Fountain Show.",
            "Day 2": "Palm Jumeirah, Marina walk and dhow dinner cruise.",
            "Day 3": "Desert safari, camel ride and evening cultural show.",
        },
        "hashtags": ["#Dubai", "#VisitDubai", "#BurjKhalifa", "#DubaiTravel"],
    },
    "SIN": {
        "city": "Singapore", "country": "Singapore", "emoji": "🇸🇬",
        "tagline": "Clean city, gardens and skyline views",
        "bg_queries": ["Marina Bay Sands", "Gardens by the Bay", "Singapore skyline"],
        "famous_places": ["Marina Bay Sands", "Gardens by the Bay", "Sentosa", "Merlion Park"],
        "foods": ["Chilli Crab", "Chicken Rice", "Laksa", "Kaya Toast"],
        "special_events": ["Singapore Grand Prix", "Chinese New Year Chinatown"],
        "must_watch": ["Spectra light show", "Garden Rhapsody", "Night Safari"],
        "local_tips": ["Use MRT and EZ Link", "Hawker centres are best value", "Carry light clothes for humidity"],
        "days": {
            "Day 1": "Marina Bay Sands, Merlion and Gardens by the Bay.",
            "Day 2": "Sentosa attractions, beach time and cable car ride.",
            "Day 3": "Chinatown food trail and Clarke Quay at night.",
        },
        "hashtags": ["#Singapore", "#MarinaBaySands", "#Sentosa", "#SingaporeTravel"],
    },
    "BKK": {
        "city": "Bangkok", "country": "Thailand", "emoji": "🇹🇭",
        "tagline": "Temples, markets and nonstop street food",
        "bg_queries": ["Wat Arun Bangkok", "Grand Palace Bangkok", "Bangkok temple"],
        "famous_places": ["Grand Palace", "Wat Arun", "Wat Pho", "Chatuchak Market"],
        "foods": ["Pad Thai", "Tom Yum", "Mango Sticky Rice", "Green Curry"],
        "special_events": ["Songkran Festival", "Loy Krathong"],
        "must_watch": ["Chao Phraya sunset cruise", "Floating market ride", "Sky bar sunset"],
        "local_tips": ["Use BTS to skip traffic", "Bargain in markets", "Best season Nov to Feb"],
        "days": {
            "Day 1": "Grand Palace, Wat Pho and river cruise.",
            "Day 2": "Chatuchak Market and local street food hopping.",
            "Day 3": "Wat Arun, floating market and rooftop sunset.",
        },
        "hashtags": ["#Bangkok", "#WatArun", "#ThailandTravel", "#BangkokFood"],
    },
    "KTM": {
        "city": "Kathmandu", "country": "Nepal", "emoji": "🇳🇵",
        "tagline": "Temples, heritage squares and Himalayan vibes",
        "bg_queries": ["Boudhanath Stupa", "Pashupatinath", "Kathmandu temple"],
        "famous_places": ["Pashupatinath", "Boudhanath", "Swayambhunath", "Bhaktapur Square"],
        "foods": ["Momo", "Dal Bhat", "Thukpa", "Sel Roti"],
        "special_events": ["Indra Jatra", "Dashain Festival"],
        "must_watch": ["Pashupatinath aarti", "Nagarkot sunrise", "Everest scenic flight"],
        "local_tips": ["Best in Oct to Nov", "Carry cash for local markets", "Start early for temple visits"],
        "days": {
            "Day 1": "Pashupatinath, Boudhanath and Thamel streets.",
            "Day 2": "Swayambhunath and Patan heritage walk.",
            "Day 3": "Nagarkot sunrise and Bhaktapur square visit.",
        },
        "hashtags": ["#Kathmandu", "#Nepal", "#Boudhanath", "#VisitNepal"],
    },
    "KUL": {
        "city": "Kuala Lumpur", "country": "Malaysia", "emoji": "🇲🇾",
        "tagline": "Twin towers, caves and food streets",
        "bg_queries": ["Petronas Twin Towers", "Batu Caves", "Kuala Lumpur skyline"],
        "famous_places": ["Petronas Towers", "Batu Caves", "KL Tower", "Bukit Bintang"],
        "foods": ["Nasi Lemak", "Roti Canai", "Satay", "Cendol"],
        "special_events": ["Thaipusam", "Malaysia Day"],
        "must_watch": ["Petronas night lights", "Jalan Alor food street", "KL Tower sky box"],
        "local_tips": ["Use Grab for cheaper rides", "Best season May to Jul", "Dress modestly at Batu Caves"],
        "days": {
            "Day 1": "Petronas Towers, KLCC Park and city lights.",
            "Day 2": "Batu Caves and Little India food stops.",
            "Day 3": "Jalan Alor, Bukit Bintang and KL Tower views.",
        },
        "hashtags": ["#KualaLumpur", "#Petronas", "#MalaysiaTravel", "#BatuCaves"],
    },
    "DPS": {
        "city": "Bali", "country": "Indonesia", "emoji": "🇮🇩",
        "tagline": "Beaches, temples and tropical sunsets",
        "bg_queries": ["Tanah Lot Bali", "Uluwatu Temple", "Bali rice terrace"],
        "famous_places": ["Tanah Lot", "Uluwatu Temple", "Ubud", "Tegallalang"],
        "foods": ["Nasi Goreng", "Babi Guling", "Sate Lilit", "Pisang Goreng"],
        "special_events": ["Nyepi", "Bali Arts Festival"],
        "must_watch": ["Kecak fire dance", "Tanah Lot sunset", "Mount Batur sunrise"],
        "local_tips": ["Best season Apr to Oct", "Carry cash in local areas", "Wear sarong at temples"],
        "days": {
            "Day 1": "Seminyak beach and Tanah Lot sunset.",
            "Day 2": "Ubud, rice terraces and monkey forest.",
            "Day 3": "Uluwatu cliffs and Kecak dance show.",
        },
        "hashtags": ["#Bali", "#VisitBali", "#TanahLot", "#BaliTravel"],
    },
    "IST": {
        "city": "Istanbul", "country": "Turkey", "emoji": "🇹🇷",
        "tagline": "Mosques, bazaars and Bosphorus sunsets",
        "bg_queries": ["Hagia Sophia", "Blue Mosque Istanbul", "Bosphorus skyline"],
        "famous_places": ["Hagia Sophia", "Blue Mosque", "Grand Bazaar", "Galata Tower"],
        "foods": ["Baklava", "Doner Kebab", "Borek", "Simit"],
        "special_events": ["Tulip Festival", "Istanbul Music Festival"],
        "must_watch": ["Bosphorus cruise", "Whirling dervish show", "Galata sunset view"],
        "local_tips": ["Get Istanbulkart", "Dress modestly for mosques", "Best in Apr to Jun"],
        "days": {
            "Day 1": "Hagia Sophia, Blue Mosque and Topkapi area.",
            "Day 2": "Grand Bazaar, Spice Market and Bosphorus cruise.",
            "Day 3": "Galata Tower and evening cultural show.",
        },
        "hashtags": ["#Istanbul", "#HagiaSophia", "#TurkeyTravel", "#BlueMosque"],
    },
    "CMB": {
        "city": "Colombo", "country": "Sri Lanka", "emoji": "🇱🇰",
        "tagline": "Coastal city with culture and tea-country escapes",
        "bg_queries": ["Galle Face Green", "Sri Lanka temple", "Sigiriya"],
        "famous_places": ["Galle Face Green", "Gangaramaya", "Kandy", "Sigiriya"],
        "foods": ["Kottu Roti", "Hoppers", "Rice and Curry", "Watalappan"],
        "special_events": ["Vesak Festival", "Esala Perahera"],
        "must_watch": ["Galle Face sunset", "Tea train ride", "Sigiriya sunrise"],
        "local_tips": ["Use tuk tuk for short rides", "Food can be spicy", "Best west coast season Dec to Mar"],
        "days": {
            "Day 1": "Galle Face, Colombo Fort and temple visit.",
            "Day 2": "Kandy and Temple of the Tooth visit.",
            "Day 3": "Sigiriya sunrise and scenic tea country stop.",
        },
        "hashtags": ["#SriLanka", "#Colombo", "#Sigiriya", "#VisitSriLanka"],
    },
    "HKG": {
        "city": "Hong Kong", "country": "China", "emoji": "🇭🇰",
        "tagline": "Harbour lights, peaks and neon markets",
        "bg_queries": ["Victoria Peak Hong Kong", "Hong Kong skyline", "Big Buddha Hong Kong"],
        "famous_places": ["Victoria Peak", "Star Ferry", "Big Buddha", "Temple Street"],
        "foods": ["Dim Sum", "Egg Waffles", "Milk Tea", "Wonton Noodles"],
        "special_events": ["Dragon Boat Festival", "Mid Autumn Lantern Festival"],
        "must_watch": ["Symphony of Lights", "Peak Tram view", "Star Ferry sunset"],
        "local_tips": ["Use Octopus card", "Queue properly everywhere", "Best season Oct to Dec"],
        "days": {
            "Day 1": "Peak Tram, skyline views and Star Ferry.",
            "Day 2": "Temple Street market and local food trail.",
            "Day 3": "Big Buddha and Ngong Ping cable car.",
        },
        "hashtags": ["#HongKong", "#VictoriaPeak", "#DimSum", "#VisitHongKong"],
    },
    "DOH": {
        "city": "Doha", "country": "Qatar", "emoji": "🇶🇦",
        "tagline": "Souqs, museums and desert adventures",
        "bg_queries": ["Souq Waqif", "Doha skyline", "Museum of Islamic Art Doha"],
        "famous_places": ["Souq Waqif", "Museum of Islamic Art", "The Pearl", "Katara"],
        "foods": ["Machboos", "Luqaimat", "Harees", "Balaleet"],
        "special_events": ["Qatar National Day", "Qatar Food Festival"],
        "must_watch": ["Corniche sunset", "Desert dune drive", "Dhow dinner cruise"],
        "local_tips": ["Dress modestly", "Metro is excellent", "Best season Nov to Mar"],
        "days": {
            "Day 1": "Souq Waqif, Corniche and The Pearl.",
            "Day 2": "Museum of Islamic Art and Katara village.",
            "Day 3": "Desert safari, camel ride and dune sunset.",
        },
        "hashtags": ["#Doha", "#VisitQatar", "#SouqWaqif", "#QatarTravel"],
    },
    "AUH": {
        "city": "Abu Dhabi", "country": "UAE", "emoji": "🇦🇪",
        "tagline": "Grand mosque, art and island fun",
        "bg_queries": ["Sheikh Zayed Grand Mosque", "Abu Dhabi skyline", "Louvre Abu Dhabi"],
        "famous_places": ["Sheikh Zayed Mosque", "Louvre Abu Dhabi", "Yas Island", "Corniche"],
        "foods": ["Harees", "Machboos", "Luqaimat", "Shawarma"],
        "special_events": ["Abu Dhabi Grand Prix", "National Day UAE"],
        "must_watch": ["Mosque night lights", "Ferrari World", "Mangrove kayaking"],
        "local_tips": ["Best season Nov to Mar", "Dress conservatively", "Less crowded than Dubai"],
        "days": {
            "Day 1": "Grand Mosque, Corniche and Emirates Palace.",
            "Day 2": "Yas Island and Ferrari World thrills.",
            "Day 3": "Louvre Abu Dhabi and evening desert safari.",
        },
        "hashtags": ["#AbuDhabi", "#VisitAbuDhabi", "#YasIsland", "#UAETravel"],
    },
    "LON": {
        "city": "London", "country": "UK", "emoji": "🇬🇧",
        "tagline": "Royal landmarks, museums and markets",
        "bg_queries": ["Tower Bridge London", "Big Ben London", "London skyline"],
        "famous_places": ["Big Ben", "Tower Bridge", "Buckingham Palace", "British Museum"],
        "foods": ["Fish and Chips", "Afternoon Tea", "Pie and Mash", "Sticky Toffee Pudding"],
        "special_events": ["Notting Hill Carnival", "Trooping the Colour"],
        "must_watch": ["Thames sunset cruise", "West End musical", "Changing of the Guard"],
        "local_tips": ["Use Oyster card", "Most museums are free", "Stand right on escalators"],
        "days": {
            "Day 1": "Big Ben, Westminster and Tower Bridge walk.",
            "Day 2": "British Museum, Covent Garden and West End.",
            "Day 3": "Notting Hill, Camden and Hyde Park.",
        },
        "hashtags": ["#London", "#BigBen", "#TowerBridge", "#VisitLondon"],
    },
    "PAR": {
        "city": "Paris", "country": "France", "emoji": "🇫🇷",
        "tagline": "Romance, art and sparkling nights",
        "bg_queries": ["Eiffel Tower Paris", "Paris skyline", "Louvre Paris"],
        "famous_places": ["Eiffel Tower", "Louvre", "Notre Dame", "Montmartre"],
        "foods": ["Croissant", "Macarons", "Crepes", "Creme Brulee"],
        "special_events": ["Bastille Day", "Paris Fashion Week"],
        "must_watch": ["Eiffel twinkle lights", "Seine evening cruise", "Moulin Rouge"],
        "local_tips": ["Use metro for everywhere", "Say bonjour first", "Best season Apr to Jun"],
        "days": {
            "Day 1": "Eiffel Tower, Seine cruise and Champs Elysees.",
            "Day 2": "Louvre, Notre Dame and riverside walk.",
            "Day 3": "Montmartre, Sacre Coeur and evening cabaret.",
        },
        "hashtags": ["#Paris", "#EiffelTower", "#Louvre", "#VisitParis"],
    },
    "NYC": {
        "city": "New York", "country": "USA", "emoji": "🇺🇸",
        "tagline": "Skyline icons, parks and late nights",
        "bg_queries": ["Times Square", "New York skyline", "Statue of Liberty"],
        "famous_places": ["Times Square", "Central Park", "Statue of Liberty", "Brooklyn Bridge"],
        "foods": ["New York Pizza", "Bagel", "Cheesecake", "Pastrami Sandwich"],
        "special_events": ["Times Square New Year", "Macy Parade"],
        "must_watch": ["Broadway show", "Brooklyn Bridge sunset", "One World view"],
        "local_tips": ["Use subway card", "Walk a lot", "Best season Apr to Jun"],
        "days": {
            "Day 1": "Times Square, Central Park and city lights.",
            "Day 2": "Statue of Liberty and Brooklyn Bridge walk.",
            "Day 3": "Museum stop and Broadway night show.",
        },
        "hashtags": ["#NYC", "#NewYork", "#TimesSquare", "#VisitNYC"],
    },
    "SYD": {
        "city": "Sydney", "country": "Australia", "emoji": "🇦🇺",
        "tagline": "Harbour views, beaches and bright skies",
        "bg_queries": ["Sydney Opera House", "Harbour Bridge Sydney", "Bondi Beach"],
        "famous_places": ["Opera House", "Harbour Bridge", "Bondi Beach", "Blue Mountains"],
        "foods": ["Meat Pie", "Lamington", "Pavlova", "Oysters"],
        "special_events": ["Vivid Sydney", "Sydney New Year Fireworks"],
        "must_watch": ["Opera House show", "BridgeClimb", "Bondi to Coogee walk"],
        "local_tips": ["Use Opal card", "Sunscreen is essential", "Best season Sep to Nov"],
        "days": {
            "Day 1": "Opera House, Circular Quay and harbour walk.",
            "Day 2": "Bondi beach and coastal trail to Coogee.",
            "Day 3": "Blue Mountains and scenic lookout visit.",
        },
        "hashtags": ["#Sydney", "#OperaHouse", "#BondiBeach", "#VisitSydney"],
    },
    "MNL": {
        "city": "Manila", "country": "Philippines", "emoji": "🇵🇭",
        "tagline": "Historic streets, food and famous sunsets",
        "bg_queries": ["Intramuros Manila", "Manila Bay sunset", "Fort Santiago"],
        "famous_places": ["Intramuros", "Fort Santiago", "Rizal Park", "Manila Bay"],
        "foods": ["Adobo", "Halo Halo", "Lechon", "Sinigang"],
        "special_events": ["Chinese New Year Binondo", "Independence Day Parade"],
        "must_watch": ["Manila Bay sunset", "Binondo food walk", "Intramuros kalesa ride"],
        "local_tips": ["Use Grab for rides", "Traffic is heavy", "Best season Dec to May"],
        "days": {
            "Day 1": "Intramuros, Fort Santiago and Rizal Park.",
            "Day 2": "Tagaytay viewpoint and Taal volcano views.",
            "Day 3": "Mall of Asia and Manila Bay sunset dinner.",
        },
        "hashtags": ["#Manila", "#Intramuros", "#PhilippinesTravel", "#VisitPhilippines"],
    },
    "BWA": {
        "city": "Bhairahawa / Lumbini", "country": "Nepal", "emoji": "🇳🇵",
        "tagline": "Sacred Buddhist heritage and peaceful scenery",
        "bg_queries": ["Lumbini Maya Devi Temple", "Lumbini Sacred Garden", "World Peace Pagoda Nepal"],
        "famous_places": ["Lumbini Garden", "Maya Devi Temple", "Ashoka Pillar", "World Peace Pagoda"],
        "foods": ["Momo", "Dal Bhat", "Sel Roti", "Gundruk Soup"],
        "special_events": ["Buddha Jayanti", "Lumbini Buddhist Festival"],
        "must_watch": ["Lumbini sunrise walk", "Monastery zone visit", "Pokhara extension trip"],
        "local_tips": ["Keep silence in sacred zone", "Cycle inside Lumbini area", "Best season Oct to Apr"],
        "days": {
            "Day 1": "Lumbini Garden, Maya Devi Temple and Ashoka Pillar.",
            "Day 2": "Monastery zone and World Peace Pagoda.",
            "Day 3": "Pokhara side trip or peaceful garden morning.",
        },
        "hashtags": ["#Lumbini", "#Nepal", "#Buddha", "#VisitNepal"],
    },
}


def build_hashtags(dest_code: str, deal: dict = None, max_tags: int = 18) -> str:
    itin = ITINERARY_DATA.get(dest_code, {})
    tags = list(itin.get("hashtags", []))
    general = ["#Thinkatrip", "#FlightDeals", "#TravelDeals", "#TravelGram", "#BudgetTravel"]
    if deal:
        origin = deal.get("origin_name", "").replace(" ", "")
        city = itin.get("city", dest_code).replace(" ", "")
        if origin and city:
            tags.append(f"#{origin}To{city}")
    out = []
    seen = set()
    for tag in tags + general:
        low = tag.lower()
        if low not in seen:
            seen.add(low)
            out.append(tag)
    return " ".join(out[:max_tags])


class FlightData:
    def __init__(self):
        self._airports = {
            "COK": ("Kochi", "India"),
            "BLR": ("Bengaluru", "India"),
            "MAA": ("Chennai", "India"),
            "HYD": ("Hyderabad", "India"),
            "BOM": ("Mumbai", "India"),
            "DEL": ("Delhi", "India"),
            "GOI": ("Goa", "India"),
            "CCU": ("Kolkata", "India"),
        }
        self._destinations = list(ITINERARY_DATA.keys())
        self._airlines = [
            "IndiGo", "Air India", "Vistara", "Singapore Airlines",
            "Thai Airways", "Emirates", "Qatar Airways", "AirAsia"
        ]

    def pick_deal(self) -> dict:
        origin_code = random.choice(list(self._airports.keys()))
        dest_code = random.choice(self._destinations)
        origin_name, _ = self._airports[origin_code]
        itin = ITINERARY_DATA[dest_code]
        date = (datetime.now() + timedelta(days=random.randint(2, 45))).strftime("%d %b %Y")
        actual_price = random.randint(8999, 38999)
        airline = random.choice(self._airlines)
        flight_no = airline.split()[0][:2].upper() + str(random.randint(101, 989))
        deal = {
            "origin_code": origin_code,
            "origin_name": origin_name,
            "dest_code": dest_code,
            "dest_name": itin["city"],
            "dest_country": itin["country"],
            "date": date,
            "duration": random.choice(["4h 15m", "5h 05m", "6h 20m", "7h 10m", "8h 00m"]),
            "airline_name": airline,
            "flight_number": flight_no,
            "actual_price": actual_price,
            "price": f"₹{actual_price:,}",
        }
        deal["hashtags"] = build_hashtags(dest_code, deal)
        return deal

    def itinerary_for(self, dest_code: str) -> dict:
        return ITINERARY_DATA.get(dest_code, {
            "city": dest_code,
            "country": "",
            "emoji": "🌍",
            "tagline": "Travel more, spend less",
            "bg_queries": [f"{dest_code} landmark"],
            "famous_places": [],
            "foods": [],
            "special_events": [],
            "must_watch": [],
            "local_tips": [],
            "days": {
                "Day 1": "Explore the city center and top landmarks.",
                "Day 2": "Try local food and enjoy the best viewpoints.",
                "Day 3": "Visit cultural spots and relax before return.",
            },
            "hashtags": [],
        })