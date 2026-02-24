import re
import os
import time
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import urllib.parse
import shutil

html_path = "/Users/kevinweinkauff/2026-Web-Changes-BER/SEA2025/2025SEA.html"
output_dir = "/Users/kevinweinkauff/2026-Web-Changes-BER/SEA2025/2025-winners-photos"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Parse HTML for missing images
with open(html_path, "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f, "html.parser")

agents = []
for winner in soup.find_all("div", class_="sea-winner"):
    img = winner.find("img", class_="sea-agent-photo")
    h4 = winner.find("h4")
    
    if img and h4:
        src = img.get("src")
        name = h4.get_text().strip()
        
        # Only process GrowthZone links
        if "growthzoneapp.com" in src:
            # Clean name for filename (remove special chars, spaces to hyphens)
            clean_name = re.sub(r'[^a-zA-Z0-9]', '-', name)
            clean_name = re.sub(r'-+', '-', clean_name).strip('-')
            
            agents.append({
                "name": name,
                "clean_name": clean_name,
                "src": src
            })

print(f"Found {len(agents)} GrowthZone images to download.")

def download_images():
    with sync_playwright() as p:
        # Connect to existing Chrome/Safari profile if possible, or launch new browser
        # We need the user to log in if we launch a fresh one, but let's try to just open a persistent context
        # Actually, Safari cookies are hard to grab via playwright directly on Mac.
        # Let's try to open a Chromium browser with the default user data dir to grab the session
        user_data_dir = os.path.expanduser("~/Library/Application Support/Google/Chrome")
        
        try:
            # Launch persistent context
            browser = p.chromium.launch_persistent_context(
                user_data_dir=user_data_dir,
                headless=False, # Show browser so user can see what's happening
                channel="chrome"
            )
            page = browser.new_page()
            
            # Navigate to GrowthZone dashboard first to ensure cookies are fresh
            print("Navigating to GrowthZone to check session...")
            page.goto("https://bonitaspringsesterorealtorsfl.growthzoneapp.com/ap/Dashboard")
            page.wait_for_load_state("networkidle")
            
            print("Starting downloads...")
            success_count = 0
            
            for index, agent in enumerate(agents):
                filepath = os.path.join(output_dir, f"{agent['clean_name']}.jpg")
                
                # Check if already downloaded
                if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
                    print(f"Skipping {agent['name']}, already exists.")
                    success_count += 1
                    continue
                
                print(f"[{index+1}/{len(agents)}] Downloading for {agent['name']} -> {agent['clean_name']}.jpg")
                
                try:
                    # Navigate directly to the image download URL
                    response = page.goto(agent['src'])
                    
                    if response and response.ok:
                        # Growthzone might serve it inline or as attachment
                        # If inline, we can save the buffer
                        body = response.body()
                        if len(body) > 0:
                            with open(filepath, "wb") as f:
                                f.write(body)
                            print(f"  -> Saved {len(body)} bytes.")
                            success_count += 1
                        else:
                            print(f"  -> Warning: Empty body received.")
                    else:
                        print(f"  -> Failed: Status {response.status if response else 'Unknown'}")
                        
                except Exception as e:
                    print(f"  -> Error downloading: {e}")
                    
                time.sleep(1) # Be nice to the server
                
            print(f"Finished downloading {success_count} out of {len(agents)} images.")
            browser.close()
            
        except Exception as e:
            print(f"Failed to launch Chrome with user data: {e}")
            print("Please ensure Chrome is completely closed before running this script.")

if __name__ == "__main__":
    download_images()
