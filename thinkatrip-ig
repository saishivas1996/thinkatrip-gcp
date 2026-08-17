import asyncio
import json
import os
import random
import time
import io
import requests
import logging
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont

# PostgreSQL and Google Cloud Storage imports
import psycopg2
from psycopg2.extras import RealDictCursor
from google.cloud import storage

# Import your existing codebase components
from flight_data import FlightData

# Configure clear logging output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ThinkatripSystem")

# =====================================================================
#  1. CLOUD DATABASE MANAGEMENT (POSTGRESQL)
# =====================================================================
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS")
    )

def init_cloud_database():
    """Initializes PostgreSQL tables for advanced data tracking and DM replies."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''CREATE TABLE IF NOT EXISTS history
                        (route_key VARCHAR(255) PRIMARY KEY, posted_at TIMESTAMP, total_price VARCHAR(50))''')
                        
        cursor.execute('''CREATE TABLE IF NOT EXISTS live_deals
                        (flight_number VARCHAR(100) PRIMARY KEY, destination VARCHAR(255), 
                         price VARCHAR(50), date VARCHAR(100), airline VARCHAR(100), raw_json TEXT)''')
                         
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("💾 PostgreSQL database connected and tables initialized.")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")

def is_duplicate_deal(route_key: str) -> bool:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM history WHERE route_key=%s", (route_key,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result is not None
    except Exception as e:
        logger.error(f"Database error during duplicate check: {e}")
        return False

def record_posted_deal(route_key: str, deal: dict):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """INSERT INTO history (route_key, posted_at, total_price) 
               VALUES (%s, %s, %s) 
               ON CONFLICT (route_key) DO UPDATE SET posted_at = EXCLUDED.posted_at""",
            (route_key, datetime.now(), deal["price"])
        )
        
        cursor.execute(
            """INSERT INTO live_deals (flight_number, destination, price, date, airline, raw_json) 
               VALUES (%s, %s, %s, %s, %s, %s)
               ON CONFLICT (flight_number) DO UPDATE SET price = EXCLUDED.price""",
            (deal["flight_number"], deal["dest_name"], deal["price"], deal["date"], deal["airline_name"], json.dumps(deal))
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"📝 Recorded flight {deal['flight_number']} into PostgreSQL lookup registry.")
    except Exception as e:
        logger.error(f"Failed to record deal to database: {e}")

# =====================================================================
#  2. DATA-DRIVEN VIRAL HOOK ENGINE
# =====================================================================
class ViralHookEngine:
    def generate_hook_assets(self, destination_name: str, flight_price: str) -> dict:
        templates = [
            (f"CHEAPER THAN A GOA TRIP?!", f"POV: You found flights + a 3-day itinerary to {destination_name} for just {flight_price} total. Stop sleeping on this!", "Ultra Budget"),
            (f"THE {destination_name.upper()} ESCAPE LOOPHOLE", f"How to see the most premium spots in {destination_name} without draining your savings account. Full breakdown below!", "Premium Hack"),
            (f"AIRLINE PRICE DROP TO {destination_name.upper()}!", f"Secret round-trip price cuts just went live for {flight_price}. Here is your sign to book that long weekend escape.", "Price Drop"),
            (f"STOP SCROLLING!", f"The ultimate 3-day {destination_name} itinerary + flights for only {flight_price} is finally here.", "Direct Hook"),
            (f"DON'T BOOK A DOMESTIC TRIP YET!", f"Before you plan your next long weekend, look at this round-trip deal to {destination_name} for {flight_price}.", "FOMO"),
            (f"ZERO DAYS OFF TAKEN.", f"Leave Friday night, explore {destination_name} for 3 days, and get back Monday. All for {flight_price}!", "Weekend Warrior"),
        ]
        selected = random.choice(templates)
        return {
            "slide_1_headline": selected[0],
            "slide_1_subtext": selected[1],
            "price_tag": flight_price,
            "angle_type": selected[2]
        }

# =====================================================================
#  3. ENHANCED IMAGE GENERATOR (True Glass Transparency + Hook)
# =====================================================================
class FreeCloudImageGenerator:
    def __init__(self):
        self.unsplash_key = os.getenv("UNSPLASH_ACCESS_KEY")
        self.font_dir = os.path.join(os.path.dirname(__file__), "fonts")

    def backup_to_gcp_bucket(self, local_file_path: str, destination_blob_name: str):
        """Uploads a generated image directly to your Google Cloud Storage Bucket using Built-in IAM."""
        bucket_name = os.getenv("GCP_BUCKET_NAME")
        if not bucket_name:
            logger.warning("GCP_BUCKET_NAME not set, skipping permanent bucket backup.")
            return

        try:
            storage_client = storage.Client()
            bucket = storage_client.bucket(bucket_name)
            blob = bucket.blob(f"instagram_archives/{destination_blob_name}")
            blob.upload_from_filename(local_file_path)
            logger.info(f"☁️ Successfully backed up {destination_blob_name} to GCP Bucket!")
        except Exception as e:
            logger.error(f"❌ GCP Bucket Upload Failed: {e}")

    def _cloud_upload(self, local_file_path: str) -> str:
        api_key = os.getenv("IMGBB_API_KEY")
        if not api_key: raise ValueError("Environment variable 'IMGBB_API_KEY' is missing!")
            
        max_retries = 3
        for attempt in range(max_retries):
            try:
                with open(local_file_path, "rb") as image_file:
                    response = requests.post(
                        "https://api.imgbb.com/1/upload", data={"key": api_key}, files={"image": image_file}, timeout=120 
                    )
                    response_json = response.json()
                    if response.status_code == 200 and "data" in response_json:
                        return response_json["data"]["url"]
                    else: raise RuntimeError(f"ImgBB upload failed: {response_json}")
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1: time.sleep(5)
                else: raise e

    def fetch_unsplash_image(self, query):
        if not self.unsplash_key: return self._create_gradient_fallback()
        url = f"https://api.unsplash.com/search/photos?query={query}+landscape+city&orientation=portrait&per_page=1"
        try:
            response = requests.get(url, headers={"Authorization": f"Client-ID {self.unsplash_key}"}, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("results"):
                    img_data = requests.get(data["results"][0]["urls"]["regular"], timeout=10).content
                    return Image.open(io.BytesIO(img_data)).convert("RGBA").resize((1080, 1350))
        except Exception: pass
        return self._create_gradient_fallback()

    def _create_gradient_fallback(self):
        base = Image.new("RGBA", (1080, 1350))
        draw = ImageDraw.Draw(base)
        for y in range(1350):
            r, g, b = int(180 - 40 * (y / 1350)), int(190 - 40 * (y / 1350)), int(200 - 30 * (y / 1350))
            draw.line([(0, y), (1080, y)], fill=(r, g, b, 255))
        return base

    def _get_font(self, font_name, size):
        try: return ImageFont.truetype(os.path.join(self.font_dir, font_name), size)
        except IOError: return ImageFont.load_default()

    def _add_watermark(self, canvas, draw, y_pos=50):
        font_logo = self._get_font("Poppins-Bold.ttf", 35)
        logo_path = os.path.join(os.path.dirname(__file__), "thinkatrip.png")
        text_x = 50
        try:
            if os.path.exists(logo_path):
                logo = Image.open(logo_path).convert("RGBA")
                logo = logo.resize((50, 50), getattr(Image, 'Resampling', Image).LANCZOS)
                canvas.paste(logo, (50, y_pos), logo)
                text_x = 115 
        except Exception: pass
        draw.text((text_x, y_pos + 5), "thinkatrip", fill="#FFFFFF", font=font_logo)

    def _wrap_text(self, text, font, max_width):
        lines = []
        for paragraph in text.split('\n'):
            current_line = []
            for word in paragraph.split(' '):
                test_line = ' '.join(current_line + [word])
                box = font.getbbox(test_line)
                if (box[2] - box[0] if box else 0) <= max_width:
                    current_line.append(word)
                else:
                    if current_line: lines.append(' '.join(current_line))
                    current_line = [word]
            if current_line: lines.append(' '.join(current_line))
        return lines

    def create_base_canvas(self, bg_image):
        overlay = Image.new("RGBA", bg_image.size, (0, 0, 0, 40)) 
        return Image.alpha_composite(bg_image, overlay)

    # --- SLIDE 1: THE COVER DEAL WITH HOOK ADDED ---
    def create_post(self, deal, itinerary=None, save_path=None):
        if not save_path:
            out_dir = os.path.join(os.path.dirname(__file__), "posts")
            os.makedirs(out_dir, exist_ok=True)
            save_path = os.path.join(out_dir, f"{deal['dest_code']}_{deal['origin_code']}_cover.jpg")

        bg_image = self.fetch_unsplash_image(itinerary["bg_queries"][0] if itinerary and itinerary.get("bg_queries") else deal["dest_name"])
        canvas = self.create_base_canvas(bg_image)
        
        shape_overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        shape_draw = ImageDraw.Draw(shape_overlay)
        
        card_rect = [(60, 150), (1020, 1250)]
        shape_draw.rounded_rectangle(card_rect, radius=30, fill=(255, 255, 255, 135))
        canvas = Image.alpha_composite(canvas, shape_overlay)
        
        draw = ImageDraw.Draw(canvas)

        font_pill = self._get_font("Poppins-Bold.ttf", 26)
        font_hook_head = self._get_font("Poppins-Bold.ttf", 46)
        font_hook_sub = self._get_font("Poppins-Medium.ttf", 26)
        font_dest = self._get_font("BebasNeue.ttf", 150)
        font_country = self._get_font("Poppins-Medium.ttf", 35)
        font_route = self._get_font("Poppins-Bold.ttf", 35)
        font_date = self._get_font("Poppins-Bold.ttf", 30)
        font_codes = self._get_font("Poppins-Bold.ttf", 60)
        font_label = self._get_font("Poppins-SemiBold.ttf", 24)
        font_value = self._get_font("Poppins-Bold.ttf", 45)
        font_price = self._get_font("Poppins-Bold.ttf", 60)

        # 1. TOP BAR
        self._add_watermark(canvas, draw, y_pos=50)
        draw.rounded_rectangle([(710, 45), (1020, 105)], radius=15, fill="#4169E1")
        draw.text((735, 58), "LIVE FLIGHT DEALS", fill="#FFFFFF", font=font_pill)

        def draw_centered_text(y, text, font, fill, shadow=False):
            bbox = font.getbbox(text)
            w = bbox[2] - bbox[0]
            x = (1080 - w) / 2
            if shadow:
                for dx, dy in [(-2,0), (2,0), (0,-2), (0,2), (2,2), (-2,-2), (2,-2), (-2,2)]:
                    draw.text((x+dx, y+dy), text, fill="#1B263B", font=font)
            draw.text((x, y), text, fill=fill, font=font)

        # 2. VIRAL HOOK (At the top of the frosted card)
        headline = deal.get("dest_tagline", "AIRLINE PRICE DROP!")
        draw_centered_text(180, headline, font_hook_head, "#E63946")

        subtext = deal.get("dest_subtext", "Secret round-trip price cuts just went live.")
        y_sub = 245
        for line in self._wrap_text(subtext, font_hook_sub, 900):
            draw_centered_text(y_sub, line, font_hook_sub, "#333333")
            y_sub += 35

        # 3. DESTINATION & COUNTRY
        draw_centered_text(y_sub + 30, deal['dest_name'].upper(), font_dest, "#FFFFFF", shadow=True)
        draw_centered_text(y_sub + 170, deal['dest_country'].upper(), font_country, "#555555")

        # 4. ROUTE
        route_str = f"{deal['origin_name']}  ->  {deal['dest_name']}"
        draw_centered_text(y_sub + 220, route_str, font_route, "#1B263B")

        # 5. DATE PILL
        date_str = deal['date']
        date_w = font_date.getbbox(date_str)[2] - font_date.getbbox(date_str)[0]
        date_x1 = (1080 - (date_w + 60)) / 2
        draw.rounded_rectangle([(date_x1, y_sub + 280), (date_x1 + date_w + 60, y_sub + 340)], radius=20, fill="#1B263B")
        draw.text((date_x1 + 30, y_sub + 292), date_str, fill="#FFFFFF", font=font_date)

        # 6. FLIGHT PATH LINE
        y_path = y_sub + 400
        draw.text((150, y_path), deal['origin_code'], fill="#1B263B", font=font_codes)
        dest_code_w = font_codes.getbbox(deal['dest_code'])[2] - font_codes.getbbox(deal['dest_code'])[0]
        draw.text((930 - dest_code_w, y_path), deal['dest_code'], fill="#1B263B", font=font_codes)

        line_y = y_path + 40
        draw.line([(310, line_y), (770, line_y)], fill="#1B263B", width=4)
        draw.ellipse([(295, line_y - 10), (315, line_y + 10)], fill="#FFB703") 
        draw.ellipse([(765, line_y - 10), (785, line_y + 10)], fill="#FFB703")

        # 7. GRID DATA
        y_grid_1 = y_path + 120
        y_grid_2 = y_grid_1 + 130

        draw.text((150, y_grid_1), "AIRLINE", fill="#333333", font=font_label)
        draw.text((150, y_grid_1 + 35), deal['airline_name'], fill="#1B263B", font=font_value)
        draw.text((150, y_grid_2), "DURATION", fill="#333333", font=font_label)
        draw.text((150, y_grid_2 + 35), deal['duration'], fill="#1B263B", font=font_value)

        draw.text((620, y_grid_1), "FLIGHT", fill="#333333", font=font_label)
        draw.text((620, y_grid_1 + 35), deal['flight_number'], fill="#1B263B", font=font_value)
        draw.text((620, y_grid_2), "PRICE", fill="#333333", font=font_label)
        price_w = font_price.getbbox(deal['price'])[2] - font_price.getbbox(deal['price'])[0]
        draw.rounded_rectangle([(620, y_grid_2 + 35), (620 + price_w + 40, y_grid_2 + 115)], radius=15, fill="#E63946")
        draw.text((640, y_grid_2 + 45), deal['price'], fill="#FFFFFF", font=font_price)

        # 8. CTA BUTTON
        cta_str = f"DM {deal['flight_number']} to Book Now"
        cta_w = font_route.getbbox(cta_str)[2] - font_route.getbbox(cta_str)[0]
        cta_x1 = (1080 - (cta_w + 80)) / 2
        draw.rounded_rectangle([(cta_x1, y_grid_2 + 160), (cta_x1 + cta_w + 80, y_grid_2 + 240)], radius=30, fill="#4169E1")
        draw.text((cta_x1 + 40, y_grid_2 + 175), cta_str, fill="#FFFFFF", font=font_route)

        canvas.convert("RGB").save(save_path, "JPEG", quality=95)
        return save_path

    # --- SLIDE 2: THE ITINERARY ---
    def create_itinerary_post(self, deal, itinerary, save_path=None):
        if not save_path:
            out_dir = os.path.join(os.path.dirname(__file__), "posts")
            os.makedirs(out_dir, exist_ok=True)
            save_path = os.path.join(out_dir, f"{deal['dest_code']}_{deal['origin_code']}_itin.jpg")

        bg_image = self.fetch_unsplash_image(itinerary["bg_queries"][1] if itinerary and len(itinerary.get("bg_queries", [])) > 1 else deal["dest_name"])
        canvas = self.create_base_canvas(bg_image)
        
        shape_layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        shape_draw = ImageDraw.Draw(shape_layer)
        y_offset = 270
        for idx, (day_lbl, day_desc) in enumerate(itinerary.get("days", {}).items()):
            shape_draw.rounded_rectangle([(60, y_offset), (1020, y_offset + 210)], radius=15, fill=(20, 24, 40, 150), outline="#38B6FF" if idx == 0 else "#AAAAAA", width=2)
            y_offset += 250
        shape_draw.rounded_rectangle([(60, y_offset), (1020, y_offset + 220)], radius=15, fill=(25, 29, 45, 150), outline="#00FFC4", width=2)
        
        canvas = Image.alpha_composite(canvas, shape_layer)
        draw = ImageDraw.Draw(canvas)

        font_subtitle = self._get_font("Poppins-Bold.ttf", 46)
        font_footer = self._get_font("Poppins-Regular.ttf", 28)
        font_it_body = self._get_font("Poppins-Regular.ttf", 28)
        font_day_tag = self._get_font("BebasNeue.ttf", 34)

        self._add_watermark(canvas, draw, y_pos=50)

        draw.text((60, 140), f"3-DAY {deal['dest_name'].upper()} ITINERARY", fill="#FFDE59", font=font_subtitle)
        draw.text((60, 200), "Featuring authentic recommendations & local tips", fill="#E0E0E0", font=font_footer)

        y_offset = 270
        for idx, (day_lbl, day_desc) in enumerate(itinerary.get("days", {}).items()):
            draw.rounded_rectangle([(100, y_offset + 30), (220, y_offset + 80)], radius=8, fill="#38B6FF" if idx == 0 else "#FF5757" if idx == 1 else "#FFC107")
            draw.text((120, y_offset + 36), day_lbl.upper(), fill="#0F1016", font=font_day_tag)
            
            text_y = y_offset + 100
            for line in self._wrap_text(day_desc, font_it_body, 840):
                draw.text((100, text_y), line, fill="#FFFFFF", font=font_it_body)
                text_y += 38
            y_offset += 250

        draw.text((100, y_offset + 25), "LOCAL TRAVEL INSIGHTS", fill="#00FFC4", font=self._get_font("Poppins-Bold.ttf", 30))
        tips = itinerary.get("local_tips", ["Stay alert for transit schedules."])
        text_y = y_offset + 80
        for line in self._wrap_text(" • ".join(tips[:2]), font_it_body, 840):
            draw.text((100, text_y), line, fill="#E0E0E0", font=font_it_body)
            text_y += 38

        draw.text((60, 1260), "Follow @thinkatrip for daily deals!", fill="#FFDE59", font=font_footer)
        draw.text((950, 1260), "2/3", fill="#A6A6A6", font=font_footer)

        canvas.convert("RGB").save(save_path, "JPEG", quality=95)
        return save_path

    # --- SLIDE 3: HIGHLIGHTS, FOOD & EVENTS ---
    def create_highlights_post(self, deal, itinerary, save_path=None):
        if not save_path:
            out_dir = os.path.join(os.path.dirname(__file__), "posts")
            os.makedirs(out_dir, exist_ok=True)
            save_path = os.path.join(out_dir, f"{deal['dest_code']}_{deal['origin_code']}_highlights.jpg")

        bg_image = self.fetch_unsplash_image(deal["dest_name"])
        canvas = self.create_base_canvas(bg_image)
        
        shape_layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        shape_draw = ImageDraw.Draw(shape_layer)
        y_offset = 250
        shape_draw.rounded_rectangle([(60, y_offset), (1020, y_offset + 220)], radius=15, fill=(20, 24, 40, 150), outline="#FF914D", width=2)
        y_offset += 260
        shape_draw.rounded_rectangle([(60, y_offset), (1020, y_offset + 200)], radius=15, fill=(20, 24, 40, 150), outline="#38B6FF", width=2)
        y_offset += 240
        shape_draw.rounded_rectangle([(60, y_offset), (1020, y_offset + 160)], radius=15, fill=(20, 24, 40, 150), outline="#FF5757", width=2)
        canvas = Image.alpha_composite(canvas, shape_layer)
        draw = ImageDraw.Draw(canvas)

        font_title = self._get_font("Poppins-Bold.ttf", 46)
        font_header = self._get_font("BebasNeue.ttf", 45)
        font_body = self._get_font("Poppins-Regular.ttf", 28)
        font_cta = self._get_font("Poppins-Bold.ttf", 32)
        font_footer = self._get_font("Poppins-Regular.ttf", 28)

        self._add_watermark(canvas, draw, y_pos=50)
        draw.text((60, 140), f"{deal['dest_name'].upper()} HIGHLIGHTS", fill="#FFDE59", font=font_title)
        draw.line([(60, 200), (320, 200)], fill="#38B6FF", width=4)

        y_offset = 250
        draw.text((90, y_offset + 20), "MUST-TRY LOCAL FOODS", fill="#FF914D", font=font_header)
        foods = itinerary.get("foods", ["Local Street Food", "Traditional Desserts"])
        draw.text((90, y_offset + 80), f"• {foods[0]}", fill="#FFFFFF", font=font_body)
        if len(foods) > 1: draw.text((90, y_offset + 125), f"• {foods[1]}", fill="#FFFFFF", font=font_body)
        if len(foods) > 2: draw.text((90, y_offset + 170), f"• {foods[2]}", fill="#FFFFFF", font=font_body)

        y_offset += 260
        draw.text((90, y_offset + 20), "FAMOUS SPOTS & STAYS", fill="#38B6FF", font=font_header)
        spots = itinerary.get("famous_places", ["City Center", "Historic Downtown"])
        draw.text((90, y_offset + 80), f"• Explore: {spots[0]} & {spots[1] if len(spots) > 1 else ''}", fill="#FFFFFF", font=font_body)
        draw.text((90, y_offset + 130), "• Stay: City center for best transit access.", fill="#FFFFFF", font=font_body)

        y_offset += 240
        draw.text((90, y_offset + 20), "NOTABLE EVENTS", fill="#FF5757", font=font_header)
        events = itinerary.get("special_events", ["Check local calendars for festivals!"])
        draw.text((90, y_offset + 80), f"• {events[0]}", fill="#FFFFFF", font=font_body)

        cta_y = 1130
        draw.rectangle([(0, cta_y), (1080, 1350)], fill="#FFDE59") 
        draw.text((220, cta_y + 35), "DOUBLE TAP IF YOU WANT TO GO!", fill="#0F1016", font=font_cta)
        draw.text((330, cta_y + 85), "Follow @thinkatrip for daily deals", fill="#0F1016", font=font_body)
        draw.text((950, 1260), "3/3", fill="#0F1016", font=font_footer)

        canvas.convert("RGB").save(save_path, "JPEG", quality=95)
        return save_path

    # --- UPLOAD METHODS (With Auto-Backup Trigger) ---
    def upload_deal_image(self, deal, itinerary=None):
        file_path = self.create_post(deal, itinerary)
        self.backup_to_gcp_bucket(file_path, os.path.basename(file_path))
        return self._cloud_upload(file_path)

    def upload_itinerary_image(self, deal, itinerary=None):
        file_path = self.create_itinerary_post(deal, itinerary)
        self.backup_to_gcp_bucket(file_path, os.path.basename(file_path))
        return self._cloud_upload(file_path)

    def upload_highlights_image(self, deal, itinerary=None):
        file_path = self.create_highlights_post(deal, itinerary)
        self.backup_to_gcp_bucket(file_path, os.path.basename(file_path))
        return self._cloud_upload(file_path)

# =====================================================================
#  4. LIVE INSTAGRAM API POSTER WITH STATUS POLLING
# =====================================================================
class LiveInstagramPoster:
    def _wait_for_container(self, container_id, access_token):
        """Polls the Instagram API to ensure the image container is fully processed before publishing."""
        print(f"Waiting for media container {container_id} to be ready...")
        status_url = f"https://graph.facebook.com/v19.0/{container_id}"
        # Poll up to 12 times (60 seconds maximum)
        for _ in range(12): 
            res = requests.get(status_url, params={"fields": "status_code", "access_token": access_token}).json()
            status = res.get("status_code", "IN_PROGRESS")
            if status == "FINISHED": return True
            elif status == "ERROR" or status == "EXPIRED": return False
            time.sleep(5)
        return False

    def post_carousel(self, deal, itinerary, image_urls):
        print(f"Uploading {len(image_urls)}-Slide Carousel to Instagram... 📸")
        access_token = os.getenv("IG_ACCESS_TOKEN")
        ig_user_id = os.getenv("IG_USER_ID")
        
        if not access_token or not ig_user_id:
            raise ValueError("Missing IG_ACCESS_TOKEN or IG_USER_ID in .env file! Cannot post to live feed.")

        caption = (
            f"🚫 {deal['dest_tagline']}\n\n"
            f"🔥 INSANE FLIGHT DEAL ALERT! Round-trip flights from {deal['origin_name']} ({deal['origin_code']}) to {deal['dest_name']} ({deal['dest_code']}) are available for just {deal['price']}! 😱\n\n"
            f"📅 Date: {deal['date']}\n"
            f"✈️ Airline: {deal['airline_name']} ({deal['flight_number']})\n\n"
            f"📍 Here is your ultimate 3-Day {deal['dest_name']} Itinerary:\n"
            f"• Day 1: {itinerary['days'].get('Day 1', '')}\n"
            f"• Day 2: {itinerary['days'].get('Day 2', '')}\n"
            f"• Day 3: {itinerary['days'].get('Day 3', '')}\n\n"
            f"🤤 Must-Try Foods: {', '.join(itinerary.get('foods', []))}\n"
            f"🙌 Save this post so you dont lose it, and check out our link in bio to book! 👇\n\n"
            f"{deal.get('hashtags', '#thinkatrip #traveldeals')}"
        )
        base_url = f"https://graph.facebook.com/v19.0/{ig_user_id}"
        try:
            container_ids = []
            
            # Step 1: Create individual slide containers
            for i, url in enumerate(image_urls):
                print(f"Creating Carousel Slide {i+1} container...")
                res = requests.post(f"{base_url}/media", data={"image_url": url, "is_carousel_item": "true", "access_token": access_token}).json()
                container_id = res.get("id")
                if not container_id: raise Exception(f"Failed to create slide {i+1}. Response: {res}")
                
                # Verify image is downloaded by Instagram before continuing
                if not self._wait_for_container(container_id, access_token): raise Exception(f"Slide {i+1} failed.")
                container_ids.append(container_id)
                
            # Step 2: Bundle them into a Carousel Container
            print("Packaging Carousel...")
            res_carousel = requests.post(f"{base_url}/media", data={"media_type": "CAROUSEL", "children": ",".join(container_ids), "caption": caption, "access_token": access_token}).json()
            carousel_id = res_carousel.get("id")
            if not carousel_id: raise Exception(f"Failed to create carousel. Response: {res_carousel}")
            
            # Verify the bundled carousel is completely processed
            if not self._wait_for_container(carousel_id, access_token): raise Exception(f"Carousel failed.")

            # Step 3: Publish to Feed
            print("Publishing to Instagram Feed...")
            res_publish = requests.post(f"{base_url}/media_publish", data={"creation_id": carousel_id, "access_token": access_token}).json()
            post_id = res_publish.get("id")
            if not post_id: raise Exception(f"Failed to publish. Response: {res_publish}")
                
            print(f"Successfully posted Carousel to Instagram Feed! ✅ Post ID: {post_id}")
            return post_id
        except Exception as e:
            print(f"❌ Instagram API Error: {str(e)}")
            raise e

# =====================================================================
#  5. DIRECT EXECUTION SYSTEM
# =====================================================================
def pick_and_validate_flight_deal() -> str:
    fd = FlightData()
    deal = fd.pick_deal()
    route_key = f"{deal['origin_code']}-{deal['dest_code']}-{deal['date']}"
    if is_duplicate_deal(route_key):
        return json.dumps({"status": "aborted", "reason": f"Duplicate tracking match found for route string {route_key}."})
    itinerary = fd.itinerary_for(deal["dest_code"])
    hook_engine = ViralHookEngine()
    viral_hook = hook_engine.generate_hook_assets(deal["dest_name"], deal["price"])
    deal["dest_tagline"] = viral_hook["slide_1_headline"]
    deal["dest_subtext"] = viral_hook["slide_1_subtext"]
    return json.dumps({"status": "success", "route_key": route_key, "deal": deal, "itinerary": itinerary, "viral_hook": viral_hook})

def generate_and_post_to_instagram(deal_and_itin_json_string: str) -> str:
    data = json.loads(deal_and_itin_json_string)
    if data.get("status") == "aborted": return f"Pipeline execution cancelled: {data.get('reason')}"
    deal, itinerary, route_key = data["deal"], data["itinerary"], data["route_key"]
    
    logger.info(f"🎨 Generating 3-Slide Carousel for {deal['dest_name']}...")
    ig = FreeCloudImageGenerator()
    deal_url = ig.upload_deal_image(deal, itinerary)
    itin_url = ig.upload_itinerary_image(deal, itinerary)
    highlights_url = ig.upload_highlights_image(deal, itinerary)
    
    logger.info(f"🔗 Public URLs generated successfully.")
    poster = LiveInstagramPoster()
    post_id = poster.post_carousel(deal=deal, itinerary=itinerary, image_urls=[deal_url, itin_url, highlights_url])
    record_posted_deal(route_key, deal)
    return f"🚀 Success! Instagram Carousel live on feed. Object ID: {post_id}"

async def execute_daily_agent_run():
    logger.info("⏰ Travel Content System awake. Processing automated publication queue...")
    try:
        deal_json_string = pick_and_validate_flight_deal()
        deal_data = json.loads(deal_json_string)
        if deal_data.get("status") == "aborted":
            logger.warning(f"⚠️ Pipeline stopped: {deal_data.get('reason')}")
            return
        result_message = generate_and_post_to_instagram(deal_json_string)
        logger.info(result_message)
    except Exception as e:
        logger.error(f"❌ A critical error occurred in the workflow: {str(e)}")
        raise e
    logger.info("💤 Publication execution cycle finished.")

async def main():
    from dotenv import load_dotenv
    load_dotenv() 
    init_cloud_database()
    await execute_daily_agent_run()

if __name__ == "__main__":
    asyncio.run(main())