import os
import random
import io
import requests
from PIL import Image, ImageDraw, ImageFont

class ImageGenerator:
    def __init__(self, unsplash_access_key="", travel_api_key=""):
        # Automatically fetch from environment variables if not provided
        self.unsplash_key = unsplash_access_key or os.getenv("UNSPLASH_ACCESS_KEY")
        self.travel_api_key = travel_api_key or os.getenv("TRAVEL_API_KEY")
        
        if not self.unsplash_key:
            print("⚠️ Warning: UNSPLASH_ACCESS_KEY is missing. Images will fallback to dark mode.")
            
        self.font_dir = os.path.join(os.path.dirname(__file__), "fonts")

    def get_trendy_hook(self, destination, days=3):
        hooks = [
            f"Stop Scrolling! 🛑\nThe Ultimate {days}-Day\n{destination} Itinerary.",
            f"You're doing {destination}\nwrong if you haven't\nseen this. 🤫",
            f"POV: You found the\nperfect {days}-day escape\nto {destination}. ✈️",
            f"Read this before you\nbook your next trip\nto {destination}! 🚨",
            f"Is {destination} on your\nbucket list? Here is\nyour sign to GO. ✨"
        ]
        return random.choice(hooks)

    def fetch_unsplash_image(self, query):
        """Fetches a high-res travel image from Unsplash based on the destination."""
        print(f"Fetching background image from Unsplash for: {query}...")
        if not self.unsplash_key:
            print("Unsplash Access Key missing. Using fallback color.")
            return Image.new("RGBA", (1080, 1350), color="#121212")
        
        url = f"https://api.unsplash.com/search/photos?query={query}+travel&orientation=portrait&per_page=1"
        headers = {"Authorization": f"Client-ID {self.unsplash_key}"}
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            data = response.json()
            if data.get("results"):
                img_url = data["results"][0]["urls"]["regular"]
                img_data = requests.get(img_url, timeout=10).content
                img = Image.open(io.BytesIO(img_data)).convert("RGBA")
                return img.resize((1080, 1350))
        except Exception as e:
            print(f"Failed to fetch image from Unsplash ({e}). Using dark fallback.")
        
        return Image.new("RGBA", (1080, 1350), color="#121212")

    def fetch_destination_data(self, destination):
        """Fetches travel details (hotels, food, spots)."""
        print(f"Fetching local recommendations for {destination}...")
        # Placeholder mock data framework
        return {
            "hotels": [
                {"name": "Luxury Ocean Resort", "rating": "4.9/5", "vibe": "Beachfront & Spa Resort"},
                {"name": "The Boutique Stay", "rating": "4.8/5", "vibe": "City Center & Modern Design"}
            ],
            "foods": [
                {"dish": "Authentic Seafood Platter", "spot": "Coastal Catch", "rating": "4.7/5"},
                {"dish": "Woodfired Artisan Pizza", "spot": "The Rustic Oven", "rating": "4.8/5"}
            ],
            "events": [
                {"name": "Sunset Beach Festival", "location": "RK Beach", "date": "Upcoming Weekend"},
                {"name": "Heritage Exploration Walk", "location": "Old Town Steps", "date": "Daily at 5 PM"}
            ]
        }

    def _get_font(self, font_name, size):
        """Safely loads a font from the fonts directory or falls back to system default."""
        font_path = os.path.join(self.font_dir, font_name)
        try:
            return ImageFont.truetype(font_path, size)
        except IOError:
            return ImageFont.load_default()

    def create_base_canvas(self, bg_image):
        """Applies a high-contrast dark overlay to background images for premium legibility."""
        overlay = Image.new("RGBA", bg_image.size, (0, 0, 0, 165)) # ~65% opacity
        return Image.alpha_composite(bg_image, overlay)

    def draw_footer_and_branding(self, draw, current_slide, total_slides):
        """Draws standard brand recognition layers on every slide."""
        font_body = self._get_font("Poppins-Regular.ttf", 32)
        font_section = self._get_font("Poppins-SemiBold.ttf", 40)
        
        draw.text((50, 1260), "Save this for your next trip! 📌", fill="#A6A6A6", font=font_body)
        draw.text((880, 1260), f"{current_slide}/{total_slides}", fill="#A6A6A6", font=font_body)
        draw.text((50, 50), "@think_a_trip", fill="#FFDE59", font=font_section)

    def generate_carousel(self, destination, output_folder="carousel_output"):
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
            
        data = self.fetch_destination_data(destination)
        bg_image = self.fetch_unsplash_image(destination)
        
        total_slides = 4
        
        # ----------------------------------------------------
        # SLIDE 1: THE DYNAMIC HOOK COVER
        # ----------------------------------------------------
        slide1 = self.create_base_canvas(bg_image)
        draw1 = ImageDraw.Draw(slide1)
        hook_text = self.get_trendy_hook(destination)
        
        font_hook = self._get_font("Montserrat-Bold.ttf", 65)
        draw1.text((50, 450), hook_text, fill="#FFFFFF", font=font_hook, spacing=20)
        # Accent underline highlight
        draw1.line([(50, 780), (350, 780)], fill="#FFDE59", width=6)
        
        self.draw_footer_and_branding(draw1, 1, total_slides)
        slide1.convert("RGB").save(os.path.exists(output_folder) and f"{output_folder}/slide_1_cover.png" or "slide_1_cover.png")

        # ----------------------------------------------------
        # SLIDE 2: WHERE TO STAY
        # ----------------------------------------------------
        slide2 = self.create_base_canvas(bg_image)
        draw2 = ImageDraw.Draw(slide2)
        
        font_sec = self._get_font("Montserrat-Bold.ttf", 50)
        font_b = self._get_font("Montserrat-Regular.ttf", 36)
        font_s = self._get_font("Montserrat-Italic.ttf", 28)
        
        draw2.text((50, 200), "🏨 TOP RATED STAYS", fill="#38B6FF", font=font_sec)
        y = 350
        for hotel in data["hotels"]:
            draw2.text((70, y), f"• {hotel['name']}  ⭐ {hotel['rating']}", fill="#FFFFFF", font=font_b)
            draw2.text((100, y + 50), f"👉 {hotel['vibe']}", fill="#E0E0E0", font=font_s)
            y += 180
            
        self.draw_footer_and_branding(draw2, 2, total_slides)
        slide2.convert("RGB").save(f"{output_folder}/slide_2_stays.png")

        # ----------------------------------------------------
        # SLIDE 3: MUST-TRY FOODS
        # ----------------------------------------------------
        slide3 = self.create_base_canvas(bg_image)
        draw3 = ImageDraw.Draw(slide3)
        
        draw3.text((50, 200), "🤤 MUST-TRY FOOD HOTSPOTS", fill="#FF914D", font=font_sec)
        y = 350
        for food in data["foods"]:
            draw3.text((70, y), f"• {food['dish']}", fill="#FFFFFF", font=font_b)
            draw3.text((100, y + 50), f"📍 {food['spot']} (Rated {food['rating']})", fill="#E0E0E0", font=font_s)
            y += 180
            
        self.draw_footer_and_branding(draw3, 3, total_slides)
        slide3.convert("RGB").save(f"{output_folder}/slide_3_foods.png")

        # ----------------------------------------------------
        # SLIDE 4: SPOTS & EVENTS
        # ----------------------------------------------------
        slide4 = self.create_base_canvas(bg_image)
        draw4 = ImageDraw.Draw(slide4)
        
        draw4.text((50, 200), "📍 FAMOUS LOCAL EVENTS", fill="#FF5757", font=font_sec)
        y = 350
        for event in data["events"]:
            draw4.text((70, y), f"• {event['name']}", fill="#FFFFFF", font=font_b)
            draw4.text((100, y + 50), f"🗓️ {event['date']} | {event['location']}", fill="#E0E0E0", font=font_s)
            y += 180
            
        self.draw_footer_and_branding(draw4, 4, total_slides)
        slide4.convert("RGB").save(f"{output_folder}/slide_4_events.png")
        
        print(f"All 4 carousel slides saved successfully to standard output directory: '{output_folder}/'")

    def _create_gradient_fallback(self):
        """Creates a beautiful neon gradient backdrop if Unsplash API is offline."""
        base = Image.new("RGBA", (1080, 1350))
        draw = ImageDraw.Draw(base)
        for y in range(1350):
            # Rich transition from dark carbon to midnight indigo
            r = int(12 + (30 - 12) * (y / 1350))
            g = int(14 + (20 - 14) * (y / 1350))
            b = int(28 + (42 - 28) * (y / 1350))
            draw.line([(0, y), (1080, y)], fill=(r, g, b, 255))
        return base

    def create_post(self, deal, itinerary=None, save_path=None):
        """Generates a highly-converting visual cover slide (Slide 1) for the flight deal."""
        if not save_path:
            out_dir = os.path.join(os.path.dirname(__file__), "posts")
            os.makedirs(out_dir, exist_ok=True)
            formatted_date = deal["date"].replace(" ", "_")
            save_path = os.path.join(out_dir, f"{deal['dest_code']}_{deal['origin_code']}_{formatted_date}.jpg")

        # Fetch background image
        bg_image = None
        if itinerary and itinerary.get("bg_queries"):
            bg_image = self.fetch_unsplash_image(itinerary["bg_queries"][0])
        else:
            bg_image = self.fetch_unsplash_image(deal["dest_name"])

        # If Unsplash is missing or Solid default color was used, use gradient fallback
        if not self.unsplash_key:
            bg_image = self._create_gradient_fallback()

        canvas = self.create_base_canvas(bg_image)
        draw = ImageDraw.Draw(canvas)

        # Draw header branding & slide layout
        font_logo = self._get_font("Poppins-Bold.ttf", 38)
        font_footer = self._get_font("Poppins-Regular.ttf", 28)
        
        # Header branding
        draw.text((60, 60), "THINKATRIP", fill="#FFFFF0", font=font_logo)
        draw.text((60, 105), "Daily Micro-Cations ✈️", fill="#AAAAAA", font=font_footer)

        # Route Badge (Round-rect container)
        route_text = f"{deal['origin_code']}  ➔  {deal['dest_code']}"
        font_route = self._get_font("BebasNeue.ttf", 45)
        # Calculate text bbox size to dynamically dimension container
        bbox = font_route.getbbox(route_text)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        
        badge_padding_x = 24
        badge_padding_y = 10
        badge_left = 60
        badge_top = 180
        badge_right = badge_left + tw + badge_padding_x * 2
        badge_bottom = badge_top + th + badge_padding_y * 2
        
        draw.rounded_rectangle(
            [(badge_left, badge_top), (badge_right, badge_bottom)],
            radius=15,
            fill="#FFDE59"
        )
        draw.text((badge_left + badge_padding_x, badge_top + badge_padding_y - 2), route_text, fill="#0F1016", font=font_route)

        # The Headline / Hook Block
        headline = deal.get("dest_tagline", "STOP PAYING ₹40K FOR GOA! 🚫")
        font_head = self._get_font("Poppins-Bold.ttf", 62)
        
        def wrap_text(text, font, max_width):
            lines = []
            for paragraph in text.split('\n'):
                words = paragraph.split(' ')
                current_line = []
                for word in words:
                    test_line = ' '.join(current_line + [word])
                    box = font.getbbox(test_line)
                    w = box[2] - box[0] if box else 0
                    if w <= max_width:
                        current_line.append(word)
                    else:
                        if current_line:
                            lines.append(' '.join(current_line))
                            current_line = [word]
                        else:
                            lines.append(word)
                if current_line:
                    lines.append(' '.join(current_line))
            return lines

        wrapped_headline_lines = wrap_text(headline, font_head, 960)
        
        # Let's draw headline starting at y = 300
        y_curr = 300
        # Draw a stylish yellow left-border bar
        draw.rectangle([(60, y_curr), (72, y_curr + len(wrapped_headline_lines) * 75 - 10)], fill="#FF5757")
        
        for line in wrapped_headline_lines:
            draw.text((90, y_curr), line, fill="#FFFFFF", font=font_head)
            y_curr += 76

        # Subtext / POV paragraph
        subtext = "POV: You discovered a pocket-friendly international escape. 🗺️ Flights included!"
        if itinerary:
            subtext = f"POV: You found a 3-Day International trip to {deal['dest_name']} for way cheaper than a domestic holiday. Flights included! 👇"
            
        font_sub = self._get_font("Poppins-Medium.ttf", 32)
        wrapped_sub_lines = wrap_text(subtext, font_sub, 940)
        
        y_sub = y_curr + 40
        for line in wrapped_sub_lines:
            draw.text((60, y_sub), line, fill="#E0E0E0", font=font_sub)
            y_sub += 45

        # Massive Price Badge Block
        price_val = deal["price"]
        font_price = self._get_font("BebasNeue.ttf", 130)
        font_lbl = self._get_font("Poppins-Regular.ttf", 26)
        
        # Prepare card background
        card_t = y_sub + 60
        card_b = card_t + 220
        draw.rounded_rectangle(
            [(60, card_t), (1020, card_b)],
            radius=20,
            fill=(20, 24, 40, 195),
            outline="#FFDE59",
            width=2
        )
        
        # Draw Price Label left-aligned inside container
        draw.text((100, card_t + 35), "ROUND-TRIP FLIGHT PRICE", fill="#E0E0E0", font=font_lbl)
        draw.text((100, card_t + 70), price_val, fill="#FFDE59", font=font_price)
        
        # Brand logo / flight badge on the right inside container
        draw.rounded_rectangle(
            [(660, card_t + 45), (960, card_t + 175)],
            radius=15,
            fill="#FF5757"
        )
        font_btn = self._get_font("Poppins-Bold.ttf", 30)
        draw.text((700, card_t + 65), "BOOK NOW", fill="#FFFFFF", font=font_btn)
        draw.text((700, card_t + 115), f"{deal['airline_name']} Flight", fill="#FFFFF0", font=font_lbl)

        # Draw footer branding & slide indicators
        draw.text((60, 1260), "Save this for your next trip! 📌", fill="#A6A6A6", font=font_footer)
        draw.text((950, 1260), "1/2", fill="#A6A6A6", font=font_footer)

        canvas.convert("RGB").save(save_path, "JPEG", quality=95)
        print(f"Cover post successfully generated at: '{save_path}'")
        return save_path

    def create_itinerary_post(self, deal, itinerary, save_path=None):
        """Generates the premium multi-day itinerary detail page (Slide 2)."""
        if not save_path:
            out_dir = os.path.join(os.path.dirname(__file__), "posts")
            os.makedirs(out_dir, exist_ok=True)
            formatted_date = deal["date"].replace(" ", "_")
            save_path = os.path.join(out_dir, f"{deal['dest_code']}_{deal['origin_code']}_{formatted_date}_itin.jpg")

        # Fetch Unsplash using search queries
        bg_image = None
        if itinerary and itinerary.get("bg_queries") and len(itinerary["bg_queries"]) > 1:
            bg_image = self.fetch_unsplash_image(itinerary["bg_queries"][1])
        else:
            bg_image = self.fetch_unsplash_image(deal["dest_name"])

        if not self.unsplash_key:
            bg_image = self._create_gradient_fallback()

        canvas = self.create_base_canvas(bg_image)
        draw = ImageDraw.Draw(canvas)

        # Draw Header
        font_logo = self._get_font("Poppins-Bold.ttf", 36)
        font_footer = self._get_font("Poppins-Regular.ttf", 28)
        font_subtitle = self._get_font("Poppins-Bold.ttf", 46)

        draw.text((60, 60), f"3-DAY {deal['dest_name'].upper()} ITINERARY", fill="#FFDE59", font=font_subtitle)
        draw.text((60, 120), f"Featuring authentic recommendations & local tips {itinerary.get('emoji', '✈️')}", fill="#E0E0E0", font=font_footer)

        # Generate Cards for Days 1, 2, 3
        days = itinerary.get("days", {})
        font_day_tag = self._get_font("BebasNeue.ttf", 34)
        font_it_body = self._get_font("Poppins-Regular.ttf", 28)
        
        y_offset = 200
        for idx, (day_lbl, day_desc) in enumerate(days.items()):
            # Card background mapping
            card_top = y_offset
            card_bottom = card_top + 210
            
            draw.rounded_rectangle(
                [(60, card_top), (1020, card_bottom)],
                radius=15,
                fill=(20, 24, 40, 195),
                outline="#38B6FF" if idx == 0 else "#AAAAAA",
                width=1
            )
            
            # DAY Badge
            draw.rounded_rectangle(
                [(100, card_top + 30), (220, card_top + 80)],
                radius=8,
                fill="#38B6FF" if idx == 0 else "#FF5757" if idx == 1 else "#FFC107"
            )
            draw.text((120, card_top + 36), day_lbl.upper(), fill="#0F1016", font=font_day_tag)
            
            # Wrap schedule text
            def wrap_text(text, font, max_width):
                lines = []
                for paragraph in text.split('\n'):
                    words = paragraph.split(' ')
                    current_line = []
                    for word in words:
                        test_line = ' '.join(current_line + [word])
                        box = font.getbbox(test_line)
                        w = box[2] - box[0] if box else 0
                        if w <= max_width:
                            current_line.append(word)
                        else:
                            if current_line:
                                lines.append(' '.join(current_line))
                                current_line = [word]
                            else:
                                lines.append(word)
                    if current_line:
                        lines.append(' '.join(current_line))
                return lines

            lines = wrap_text(day_desc, font_it_body, 840)
            text_y = card_top + 100
            for line in lines:
                draw.text((100, text_y), line, fill="#FFFFFF", font=font_it_body)
                text_y += 38
                
            y_offset += 250

        # Draw Quick Tips Card on the remaining lower area
        tips_top = y_offset
        tips_bottom = tips_top + 220
        draw.rounded_rectangle(
            [(60, tips_top), (1020, tips_bottom)],
            radius=15,
            fill=(25, 29, 45, 210),
            outline="#00FFC4",
            width=1
        )
        
        font_tip_title = self._get_font("Poppins-Bold.ttf", 30)
        draw.text((100, tips_top + 25), "💡 LOCAL TRAVEL INSIGHTS", fill="#00FFC4", font=font_tip_title)
        
        tips = itinerary.get("local_tips", [])
        tip_str = " • ".join(tips[:2]) if tips else "Stay alert for transit schedules and book local metro passes."
        lines = wrap_text(tip_str, font_it_body, 840)
        text_y = tips_top + 80
        for line in lines:
            draw.text((100, text_y), line, fill="#E0E0E0", font=font_it_body)
            text_y += 38

        # Footer branding
        draw.text((60, 1260), "Save this for your next trip! 📌", fill="#A6A6A6", font=font_footer)
        draw.text((950, 1260), "2/2", fill="#A6A6A6", font=font_footer)

        canvas.convert("RGB").save(save_path, "JPEG", quality=95)
        print(f"Itinerary post successfully generated at: '{save_path}'")
        return save_path
    def create_highlights_post(self, deal, itinerary, save_path=None):
        """Generates a 3rd slide highlighting foods, famous spots, and an IG Call-to-Action."""
        if not save_path:
            out_dir = os.path.join(os.path.dirname(__file__), "posts")
            os.makedirs(out_dir, exist_ok=True)
            formatted_date = deal["date"].replace(" ", "_")
            save_path = os.path.join(out_dir, f"{deal['dest_code']}_{deal['origin_code']}_{formatted_date}_highlights.jpg")

        bg_image = self.fetch_unsplash_image(deal["dest_name"]) if not itinerary.get("bg_queries") else self.fetch_unsplash_image(itinerary["bg_queries"][0])
        if not self.unsplash_key:
            bg_image = self._create_gradient_fallback()

        canvas = self.create_base_canvas(bg_image)
        draw = ImageDraw.Draw(canvas)

        font_title = self._get_font("Poppins-Bold.ttf", 46)
        font_header = self._get_font("BebasNeue.ttf", 40)
        font_body = self._get_font("Poppins-Regular.ttf", 28)
        font_cta = self._get_font("Poppins-Bold.ttf", 32)

        # Main Title
        draw.text((60, 60), f"📍 {deal['dest_name'].upper()} HIGHLIGHTS", fill="#FFDE59", font=font_title)
        draw.line([(60, 120), (300, 120)], fill="#38B6FF", width=4)

        y_offset = 170

        # Section 1: Must Try Foods
        draw.rounded_rectangle([(60, y_offset), (1020, y_offset + 200)], radius=15, fill=(20, 24, 40, 195), outline="#FF914D", width=2)
        draw.text((90, y_offset + 20), "🤤 MUST-TRY LOCAL FOODS", fill="#FF914D", font=font_header)
        foods = itinerary.get("foods", ["Local Street Food", "Traditional Desserts"])
        draw.text((90, y_offset + 80), f"• {foods[0]}\n• {foods[1] if len(foods) > 1 else ''}\n• {foods[2] if len(foods) > 2 else ''}", fill="#FFFFFF", font=font_body, spacing=10)

        y_offset += 240

        # Section 2: Famous Spots & Hotels
        draw.rounded_rectangle([(60, y_offset), (1020, y_offset + 200)], radius=15, fill=(20, 24, 40, 195), outline="#38B6FF", width=2)
        draw.text((90, y_offset + 20), "📸 FAMOUS SPOTS & STAYS", fill="#38B6FF", font=font_header)
        spots = itinerary.get("famous_places", ["City Center", "Historic Downtown"])
        hotels = itinerary.get("hotels", ["Stay near the main transit hub", "Boutique stays in the city center"]) # Fallback if hotels are missing
        draw.text((90, y_offset + 80), f"• Explore: {spots[0]} & {spots[1] if len(spots) > 1 else ''}\n• Stay: {hotels[0]}", fill="#FFFFFF", font=font_body, spacing=10)

        y_offset += 240
        
        # Section 3: Special Events
        draw.rounded_rectangle([(60, y_offset), (1020, y_offset + 160)], radius=15, fill=(20, 24, 40, 195), outline="#FF5757", width=2)
        draw.text((90, y_offset + 20), "🎉 NOTABLE EVENTS", fill="#FF5757", font=font_header)
        events = itinerary.get("special_events", ["Check local calendars for festivals!"])
        draw.text((90, y_offset + 80), f"• {events[0]}", fill="#FFFFFF", font=font_body)

        # Massive Instagram Call To Action (Bottom of Image)
        cta_y = 1150
        draw.rectangle([(0, cta_y), (1080, 1350)], fill="#FFDE59") # Bright yellow footer
        draw.text((250, cta_y + 40), "DOUBLE TAP IF YOU WANT TO GO! ❤️", fill="#0F1016", font=font_cta)
        draw.text((320, cta_y + 90), "Follow @think_a_trip for daily deals", fill="#0F1016", font=font_body)

        canvas.convert("RGB").save(save_path, "JPEG", quality=95)
        print(f"Highlights post successfully generated at: '{save_path}'")
        return save_path

    def upload_highlights_image(self, deal, itinerary=None, save_path=None):
        path = self.create_highlights_post(deal, itinerary, save_path)
        return self._cloud_upload(path)

# --- Testing Execution Configuration ---
if __name__ == "__main__":
    # Insert your Unsplash Developer Access Key here to enable automated image fetching
    generator = ImageGenerator()
    generator.generate_carousel("Visakhapatnam")