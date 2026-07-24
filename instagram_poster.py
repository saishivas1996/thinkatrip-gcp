import os
import requests

class InstagramPoster:
    def post_carousel(self, deal, itinerary, image_urls):
        """
        Publishes a multi-slide carousel directly to Instagram using the Graph API.
        """
        print(f"Uploading {len(image_urls)}-Slide Carousel to Instagram... 📸")
        
        access_token = os.getenv("IG_ACCESS_TOKEN")
        ig_user_id = os.getenv("IG_USER_ID")
        
        if not access_token or not ig_user_id:
            raise ValueError("Missing IG_ACCESS_TOKEN or IG_USER_ID in environment variables! Cannot post.")

        # Build the dynamic caption
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
            f"🙌 Save this post so you don't lose it, and check out our link in bio to book! 👇\n\n"
            f"{deal.get('hashtags', '#thinkatrip #traveldeals')}"
        )
        
        base_url = f"https://graph.facebook.com/v19.0/{ig_user_id}"
        
        try:
            container_ids = []
            
            # Step 1: Upload each image to Instagram's hidden server to get an Item ID
            for i, url in enumerate(image_urls):
                print(f"Creating Carousel Slide {i+1} container...")
                res = requests.post(f"{base_url}/media", data={
                    "image_url": url,
                    "is_carousel_item": "true",
                    "access_token": access_token
                }).json()
                
                if "id" not in res:
                    raise Exception(f"Failed to create slide {i+1}. Response: {res}")
                container_ids.append(res["id"])
                
            # Step 2: Bundle the slides into a Carousel Container
            print("Packaging Carousel...")
            res_carousel = requests.post(f"{base_url}/media", data={
                "media_type": "CAROUSEL",
                "children": ",".join(container_ids),
                "caption": caption,
                "access_token": access_token
            }).json()
            
            carousel_id = res_carousel.get("id")
            if not carousel_id:
                raise Exception(f"Failed to create carousel container. Response: {res_carousel}")

            # Step 3: Publish the Carousel to the Live Feed
            print("Publishing to Instagram Feed...")
            res_publish = requests.post(f"{base_url}/media_publish", data={
                "creation_id": carousel_id,
                "access_token": access_token
            }).json()
            
            post_id = res_publish.get("id")
            if not post_id:
                raise Exception(f"Failed to publish carousel. Response: {res_publish}")
                
            print(f"Successfully posted Carousel to Instagram Feed! ✅ Post ID: {post_id}")
            return post_id
            
        except Exception as e:
            print(f"❌ Instagram API Error: {str(e)}")
            raise e
