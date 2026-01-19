#!/usr/bin/env python3
"""
Analyze floor plan images and extract names using pattern matching.
Since most floor plans are scanned images, we'll use the following heuristics:
1. Check if filename already contains a model name
2. Use OCR if available
3. Fall back to descriptive naming based on available metadata
"""

import json
import re
from pathlib import Path

# Load manifest
with open("floorplan_manifest.json", "r") as f:
    manifest = json.load(f)

def clean_name(name):
    """Clean up a floor plan name."""
    # Remove file extensions
    name = re.sub(r'\.(pdf|png|jpg)$', '', name, flags=re.IGNORECASE)
    # Convert dashes/underscores to spaces
    name = re.sub(r'[-_]+', ' ', name)
    # Title case
    name = name.strip().title()
    # Fix common words
    name = re.sub(r'\bIii\b', 'III', name)
    name = re.sub(r'\bIi\b', 'II', name)
    name = re.sub(r'\bIv\b', 'IV', name)
    return name

def is_good_name(name):
    """Check if a name is already descriptive."""
    name = name.strip()
    # Bad: purely numeric, very short, or just "Plan X"
    if re.match(r'^\(?\d+\)?$', name):
        return False
    if len(name) < 3:
        return False
    return True

# Analyze current naming
improved_count = 0
needs_improvement = []

for neighborhood in manifest["neighborhoods"]:
    for fp in neighborhood["floorplans"]:
        current_name = fp["name"]
        filename = fp["filename"]
        
        if is_good_name(current_name):
            # Already has a good name
            improved_count += 1
        else:
            # Needs improvement
            needs_improvement.append({
                "neighborhood": neighborhood["name"],
                "slug": neighborhood["slug"],
                "filename": filename,
                "path": fp["path"]
            })

print(f"Floor plan naming analysis:")
print(f"  - Files with good names: {improved_count}")
print(f"  - Files needing names: {len(needs_improvement)}")
print()

# For files needing names, create a placeholder mapping
# This mapping can be updated with AI-extracted names
name_mapping = {}

for item in needs_improvement[:50]:  # First 50 for manual review
    key = item["path"]
    name_mapping[key] = {
        "original": item["filename"],
        "neighborhood": item["neighborhood"],
        "suggested_name": None,  # To be filled by AI analysis
        "image_path": f"numbered_pdf_images/{item['slug']}_{item['filename'].replace('.pdf', '.png')}"
    }

# Save mapping for AI analysis
with open("name_mapping_sample.json", "w") as f:
    json.dump(name_mapping, f, indent=2)

print(f"Created sample mapping with {len(name_mapping)} items")
print("Review numbered_pdf_images/ and update name_mapping_sample.json with extracted names")
