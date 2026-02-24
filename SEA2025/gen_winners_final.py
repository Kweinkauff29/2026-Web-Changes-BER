import sys
import re
import json
from collections import defaultdict

# Placeholder for unknown agents
UNKNOWN_AGENT_PIC = "https://www.bonitaspringsesterorealtors.com/wp-content/uploads/2022/10/unknown-agent.png"

# Manual overrides for headshots not found in D1 by name
MANUAL_OVERRIDES = {
    "Zachary Rosen": "https://bonitaspringsesterorealtorsfl.growthzoneapp.com/api/files/download/35559963/?open=true",
    "Michelle Decatur": "https://bonitaesterorealtors.com/wp-content/uploads/2025/02/michelle-decatur.jpg",
    "Teresa Garella": "https://bonitaesterorealtors.com/wp-content/uploads/2025/02/Teresa-Garella-Realtor.jpg",
    "Katrena Meyers": "https://bonitaesterorealtors.com/wp-content/uploads/2025/02/Katrena-Meyers.avif",
    "Michael Jackson": "https://www.bonitaesterorealtors.com/wp-content/uploads/2024/03/Michael-Jackson.jpg",
    "Brad Graves": "https://bonitaesterorealtors.com/wp-content/uploads/2025/02/Brad-Graves-scaled.jpg",
    "Brad Graves PA": "https://bonitaesterorealtors.com/wp-content/uploads/2025/02/Brad-Graves-scaled.jpg",
    "Kris Asquith": "https://bonitaesterorealtors.com/wp-content/uploads/2023/03/Krista-Asquith-1-scaled.jpg",
    "Krista Asquith": "https://bonitaesterorealtors.com/wp-content/uploads/2023/03/Krista-Asquith-1-scaled.jpg"
}

# Load photo mapping from D1 data
photo_lookup = {}
try:
    with open('d1_photos.json', 'r') as f:
        d1_data = json.load(f)
        rows = []
        if isinstance(d1_data, list):
            for entry in d1_data:
                if isinstance(entry, dict) and 'results' in entry:
                    rows.extend(entry['results'])
                elif isinstance(entry, dict):
                    rows.append(entry)
        
        for row in rows:
            fname_raw = row.get('first_name')
            lname_raw = row.get('last_name')
            
            fname = (fname_raw or "").strip().lower()
            lname = (lname_raw or "").strip().lower()
            
            if fname and lname:
                photo_lookup[f"{fname} {lname}"] = row.get('headshot_url')
except Exception as e:
    print(f"Warning: Could not load photo data: {e}", file=sys.stderr)

def parse_line(line):
    parts = line.strip().split('\t')
    if len(parts) < 4:
        return None
    
    first_name = parts[0].strip()
    last_name = parts[1].strip()
    brokerage = parts[2].strip()
    tier = parts[3].strip() # Diamond, Platinum, Gold
    
    # Optional photo URL in column 18
    url_in_data = ""
    if len(parts) > 18:
        url_in_data = parts[18].strip()
        if not url_in_data.startswith('http'):
            url_in_data = ""
            
    return {
        'first_name': first_name,
        'last_name': last_name,
        'brokerage': brokerage,
        'tier': tier.capitalize(),
        'url_in_data': url_in_data
    }

def get_photo_url(winner):
    name = f"{winner['first_name']} {winner['last_name']}"
    
    # 1. Manual Overrides
    if name in MANUAL_OVERRIDES:
        return MANUAL_OVERRIDES[name]
    
    # 2. Check lookup from D1
    name_key = name.lower().strip()
    if name_key in photo_lookup and photo_lookup[name_key]:
        return photo_lookup[name_key]
    
    # 3. Check url_in_data
    if winner['url_in_data']:
        return winner['url_in_data']
    
    # 4. Fallback
    return UNKNOWN_AGENT_PIC

winners_by_tier = defaultdict(lambda: defaultdict(list))

with open('final_proof_data.txt', 'r') as f:
    for line in f:
        winner = parse_line(line)
        if winner:
            winners_by_tier[winner['tier']][winner['brokerage']].append(winner)

tier_order = ['Diamond', 'Platinum', 'Gold']
tier_icons = {
    'Diamond': 'https://www.bonitaesterorealtors.com/wp-content/uploads/2023/03/Diamond-20-million-Sales-or-75-Sides.png',
    'Platinum': 'https://www.bonitaesterorealtors.com/wp-content/uploads/2024/03/Screenshot-2024-03-07-at-9.47.07 AM.png',
    'Gold': 'https://www.bonitaesterorealtors.com/wp-content/uploads/2024/03/Screenshot-2024-03-07-at-9.48.07 AM.png'
}

html_output = []

for tier in tier_order:
    if tier not in winners_by_tier: continue
    
    html_output.append(f'    <div class="tier-section">')
    html_output.append(f'      <img style="display: flex; margin: 60px auto 30px auto; width: 80%; max-width: 450px;" src="{tier_icons[tier]}" alt="{tier} Tier">')
    html_output.append(f'      <div class="brokerages">')
    
    sorted_brokerages = sorted(winners_by_tier[tier].keys())
    for brokerage in sorted_brokerages:
        html_output.append(f'        <div class="sea-brokerage">')
        html_output.append(f'          <h3>{brokerage}</h3>')
        html_output.append(f'          <div class="sea-winners-grid">')
        
        current_winners = sorted(winners_by_tier[tier][brokerage], key=lambda x: (x['last_name'], x['first_name']))
        for w in current_winners:
            photo = get_photo_url(w)
            name = f"{w['first_name']} {w['last_name']}"
            html_output.append(f'          <div class="sea-winner {tier.lower()}">')
            # Added decoding="async" and alt attributes as suggested by user's working example
            html_output.append(f'            <img class="sea-agent-photo" decoding="async" src="{photo}" alt="{name}" width="200" height="200">')
            html_output.append(f'            <h4>{name}</h4>')
            html_output.append(f'          </div>')
        
        html_output.append(f'          </div>')
        html_output.append(f'        </div>')
    
    html_output.append(f'      </div>')
    html_output.append(f'    </div>')

print("\n".join(html_output))
