import os
import sqlite3
import json
import requests
import psycopg2
import time
from fastapi import FastAPI, Request, Response, Query
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configuration from your existing .env file
ACCESS_TOKEN = os.getenv("IG_ACCESS_TOKEN")
IG_USER_ID = os.getenv("IG_USER_ID")
VERIFY_TOKEN = "thinkatrip_secret_token_123" # You invent this token for Meta security check

# Database connection logic matching agent_main.py
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS")
    )

def lookup_flight(flight_number: str):
    """Queries the PostgreSQL database for flight details matching the user's message."""
    clean_code = flight_number.strip().upper()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT destination, price, date, airline FROM live_deals WHERE flight_number = %s", 
            (clean_code,)
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except Exception as e:
        print(f"Database error: {e}")
        return None

# --- Meta API Helper Functions ---

def send_instagram_dm(recipient_id: str, text_message: str):
    """Sends a private text DM."""
    url = f"https://graph.facebook.com/v19.0/{IG_USER_ID}/messages"
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": text_message},
        "access_token": ACCESS_TOKEN
    }
    requests.post(url, json=payload)

def like_comment(comment_id: str):
    """Likes a public comment."""
    url = f"https://graph.facebook.com/v19.0/{comment_id}"
    requests.post(url, data={"access_token": ACCESS_TOKEN, "user_likes": "true"})

def reply_public_comment(comment_id: str, text_message: str):
    """Replies publicly to a comment."""
    url = f"https://graph.facebook.com/v19.0/{comment_id}/replies"
    requests.post(url, data={"message": text_message, "access_token": ACCESS_TOKEN})


# --- Webhook Endpoint Structure ---

@app.get("/webhook")
def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    """Handles initial verification handshake from Meta."""
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        print("✅ Webhook verified by Meta!")
        return Response(content=hub_challenge, media_type="text/plain")
    return Response(content="Verification failed", status_code=403)

@app.post("/webhook")
async def handle_incoming_events(request: Request):
    """Handles real-time comments and direct DMs."""
    data = await request.json()
    
    if data.get("object") != "instagram":
        return {"status": "ignored"}

    for entry in data.get("entry", []):
        
        # Scenario 1: User Direct Messages (DMs) Us
        if "messaging" in entry:
            for messaging_event in entry["messaging"]:
                sender_id = messaging_event.get("sender", {}).get("id")
                message_text = messaging_event.get("message", {}).get("text", "")
                
                if not message_text or not sender_id: continue
                    
                print(f"📩 Incoming DM from {sender_id}: '{message_text}'")
                
                # Treat message text as a flight number lookup
                flight_deal = lookup_flight(message_text)
                
                if flight_deal:
                    dest, price, date, airline = flight_deal
                    reply = (
                        f"✈️ Booking details for {message_text}:\n\n"
                        f"📍 {dest}\n"
                        f"🛫 {airline}\n"
                        f"📅 Travel: {date}\n"
                        f"💰 Round-Trip: {price}\n\n"
                        f"🔗 Seal this rate via the link in our bio! 👇"
                    )
                else:
                    reply = (
                        "Hey from thinkatrip!\n\n"
                        "Just type any active flight number shown on our feed posts (e.g., VI298).\n\n"
                        "I'll instantly send you the booking link! 🗺️"
                    )
                
                send_instagram_dm(sender_id, reply)

        # Scenario 2: User Comments on a Post
        elif "changes" in entry:
            for change_event in entry["changes"]:
                if change_event.get("field") == "comments":
                    comment_value = change_event.get("value", {})
                    comment_id = comment_value.get("id")
                    comment_text = comment_value.get("text", "").lower()
                    
                    # Essential step: Get the ID of the person who commented
                    user_info = comment_value.get("from", {})
                    user_ig_sid = user_info.get("id") # Specific Instagram Scoped ID

                    if not comment_id or not user_ig_sid or not user_ig_sid:
                        continue
                        
                    print(f"💬 Incoming Comment on {change_event['id']}: '{comment_text}' from SID {user_ig_sid}")

                    # Determine if this is a request for info
                    triggers = ["dm", "details", "info", "cost", "price", "how much", "book"]
                    if any(trigger in comment_text for trigger in triggers):
                        
                        # 1. Engage Publicly (Boost Algorithm)
                        like_comment(comment_id)
                        public_reply = "Check your DMs! I just sent the details over! ✈️"
                        reply_public_comment(comment_id, public_reply)
                        
                        # 2. Engage Privately (Provide Value)
                        private_greet = (
                            "👋 Thanks for your comment on thinkatrip!\n\n"
                            "Just type the specific Flight Number you saw on that post (like VI298) "
                            "right here in this DM.\n\n"
                            "I'll instantly reply with the direct booking link! let's travel! 🗺️"
                        )
                        send_instagram_dm(user_ig_sid, private_greet)
                        
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
