"""
Process CCOR Name Change Vote Results.
Reads the Excel file, deduplicates votes by First Name + Last Name,
and outputs a JSON file with the vote counts.
"""
from openpyxl import load_workbook
import json
import os

# Configuration
EXCEL_FILE = os.path.join(os.path.dirname(__file__), '..', 'Bonita Springs-Estero REALTORS Form Responses - 45011.xlsx')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), 'vote_data.json')

# Column indices (0-indexed)
COL_FIRST_NAME = 6
COL_LAST_NAME = 7
COL_VOTE = 9  # "Do you approve changing the name to Coconut Coast Organization of REALTORS?"

def process_votes():
    wb = load_workbook(EXCEL_FILE, read_only=True)
    ws = wb.active
    
    # Dictionary to store latest vote for each person
    # Key: (first_name, last_name) -> Value: vote
    votes = {}
    
    row_count = 0
    for row_idx, row in enumerate(ws.rows):
        if row_idx == 0:  # Skip header
            continue
        
        row_count += 1
        cells = [cell.value for cell in row]
        
        first_name = str(cells[COL_FIRST_NAME] or '').strip().lower()
        last_name = str(cells[COL_LAST_NAME] or '').strip().lower()
        vote = str(cells[COL_VOTE] or '').strip().lower()
        
        if not first_name or not last_name:
            continue
        
        key = (first_name, last_name)
        # Always overwrite with latest (later rows are newer)
        votes[key] = vote
    
    wb.close()
    
    # Count votes
    yes_count = 0
    no_count = 0
    
    for vote in votes.values():
        if vote == 'yes':
            yes_count += 1
        elif vote == 'no':
            no_count += 1
    
    total_unique = len(votes)
    result = 'YES' if yes_count > no_count else 'NO'
    
    # Calculate percentages
    yes_pct = round((yes_count / total_unique) * 100, 1) if total_unique > 0 else 0
    no_pct = round((no_count / total_unique) * 100, 1) if total_unique > 0 else 0
    
    output = {
        'yes_count': yes_count,
        'no_count': no_count,
        'total_unique_votes': total_unique,
        'total_raw_responses': row_count,
        'duplicates_removed': row_count - total_unique,
        'yes_percentage': yes_pct,
        'no_percentage': no_pct,
        'result': result
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
    
    print(f"Processed {row_count} raw responses.")
    print(f"Removed {row_count - total_unique} duplicate votes.")
    print(f"Total unique votes: {total_unique}")
    print(f"YES: {yes_count} ({yes_pct}%)")
    print(f"NO: {no_count} ({no_pct}%)")
    print(f"Result: {result}")
    print(f"Output saved to: {OUTPUT_FILE}")

if __name__ == '__main__':
    process_votes()
