#!/usr/bin/env python3
"""
Create a batch processing list for AI analysis of floor plan images.
Groups images by neighborhood for efficient processing.
"""

import json
from pathlib import Path
from collections import defaultdict

# Configuration
IMAGES_DIR = Path("numbered_pdf_images")
OUTPUT_FILE = Path("images_to_analyze.json")

def main():
    # Get all images
    images = list(IMAGES_DIR.glob("*.png"))
    print(f"Found {len(images)} images to analyze")
    
    # Group by neighborhood
    by_neighborhood = defaultdict(list)
    for img in images:
        # Format: neighborhood-slug_number.png
        parts = img.stem.rsplit("_", 1)
        if len(parts) == 2:
            neighborhood_slug, number = parts
            by_neighborhood[neighborhood_slug].append({
                "filename": img.name,
                "number": number,
                "path": str(img.absolute())
            })
    
    # Sort each neighborhood's images by number
    for slug in by_neighborhood:
        by_neighborhood[slug].sort(key=lambda x: (len(x["number"]), x["number"]))
    
    # Create analysis batches
    batches = []
    total = 0
    
    for slug in sorted(by_neighborhood.keys()):
        imgs = by_neighborhood[slug]
        total += len(imgs)
        batches.append({
            "neighborhood": slug,
            "count": len(imgs),
            "images": imgs
        })
    
    # Save for reference
    output = {
        "total_images": total,
        "total_neighborhoods": len(batches),
        "neighborhoods": batches
    }
    
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nBatch summary saved to: {OUTPUT_FILE}")
    print(f"\nNeighborhoods with most images:")
    for batch in sorted(batches, key=lambda x: -x["count"])[:10]:
        print(f"  - {batch['neighborhood']}: {batch['count']} images")

if __name__ == "__main__":
    main()
