import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

# Configuration
CREATOMATE_API_KEY = os.getenv("CREATOMATE_API_KEY")
TEMPLATE_ID = "469c4751-af59-4e5d-a90d-3a440972b458" # Paste your Creatomate Template ID here
IG_ACCESS_TOKEN = os.getenv("IG_ACCESS_TOKEN")
IG_USER_ID = os.getenv("IG_USER_ID")

def render_promo_reel():
    print("🎬 Sending promo data to Creatomate Cloud...")
    
    # 1. Trigger the cloud render via API
    # 1. Trigger the cloud render via API (Upgraded Multi-Scene Version)
    response = requests.post(
        'https://api.creatomate.com/v1/renders',
        headers={
            'Authorization': f'Bearer {CREATOMATE_API_KEY}',
            'Content-Type': 'application/json',
        },
        json={
            'template_id': TEMPLATE_ID,
            'modifications': {
                # We are overriding the single text element with a 3-scene composition
                'Promo_Text': {
                    "type": "composition",
                    "elements": [
                        {
                            "type": "text",
                            "text": "Stop paying full price\nfor flights. 🚫✈️",
                            "time": "0 s",
                            "duration": "3 s",
                            "width": "85vw", 
                            "wrap_text": True,
                            "x": "50%",
                            "y": "50%",
                            "enter": {"type": "fade", "duration": "0.5s"},
                            "exit": {"type": "fade", "duration": "0.5s"}
                        },
                        {
                            "type": "text",
                            "text": "We scan live data to find\ninsane round-trip price drops. 📉",
                            "time": "3 s",
                            "duration": "4 s",
                            "width": "85vw",
                            "wrap_text": True,
                            "x": "50%",
                            "y": "50%",
                            "enter": {"type": "fade", "duration": "0.5s"},
                            "exit": {"type": "fade", "duration": "0.5s"}
                        },
                        {
                            "type": "text",
                            "text": "Comment any flight code\nto get the direct link! 💬\n\nFollow @thinkatrip 🌍",
                            "time": "7 s",
                            "duration": "5 s",
                            "width": "85vw",
                            "wrap_text": True,
                            "x": "50%",
                            "y": "50%",
                            "enter": {"type": "fade", "duration": "0.5s"},
                            "exit": {"type": "fade", "duration": "0.5s"}
                        }
                    ]
                }
            }
        }
    )
    
    render_data = response.json()
    render_id = render_data[0]['id']
    
    # 2. Poll the server until the MP4 is ready
    print("⏳ Waiting for cloud servers to generate the MP4...")
    while True:
        status_res = requests.get(
            f"https://api.creatomate.com/v1/renders/{render_id}",
            headers={'Authorization': f'Bearer {CREATOMATE_API_KEY}'}
        ).json()
        
        if status_res['status'] == 'succeeded':
            print(f"✅ Reel Generated Successfully: {status_res['url']}")
            return status_res['url']
        elif status_res['status'] == 'failed':
            print(f"\n❌ CREATOMATE RENDER FAILED. Error details:")
            print(status_res.get("error_message", status_res))
            raise Exception("Cloud video rendering failed.")
            
        time.sleep(3)

def publish_to_instagram(video_url):
    base_url = f"https://graph.facebook.com/v19.0/{IG_USER_ID}"
    
    # The caption explains the exact value of following the page
    caption = (
        "Stop overpaying for your weekend getaways. 🚫✈️\n\n"
        "At think a trip, we scan live flight data daily to find insane round-trip price drops. "
        "Just comment the flight code on any post, and our bot DMs you the direct booking link instantly. 💬\n\n"
        "Hit follow so you never miss the next flight drop! 🌍👇\n\n"
        "#travelhacks #flightdeals #budgettravel #explore"
    )
    
    print("📱 Uploading Reel container to Instagram...")
    res = requests.post(f"{base_url}/media", data={
        "media_type": "REELS",
        "video_url": video_url,
        "caption": caption,
        "access_token": IG_ACCESS_TOKEN
    }).json()
    
    container_id = res.get("id")
    if not container_id:
        raise Exception(f"Failed to create Reel container: {res}")
    
    print("⏳ Waiting for Meta to process the HD video...")
    status_url = f"https://graph.facebook.com/v19.0/{container_id}"
    while True:
        status = requests.get(status_url, params={"fields": "status_code", "access_token": IG_ACCESS_TOKEN}).json()
        if status.get("status_code") == "FINISHED":
            break
        elif status.get("status_code") in ["ERROR", "EXPIRED"]:
            raise Exception("Meta failed to process the video container.")
        time.sleep(5)
        
    print("🚀 Publishing directly to Feed & Reels Tab...")
    publish_res = requests.post(f"{base_url}/media_publish", data={
        "creation_id": container_id,
        "access_token": IG_ACCESS_TOKEN
    }).json()
    
    print(f"✅ Success! Your brand intro Reel is now live. Post ID: {publish_res.get('id')}")

if __name__ == "__main__":
    generated_video_url = render_promo_reel()
    publish_to_instagram(generated_video_url)
