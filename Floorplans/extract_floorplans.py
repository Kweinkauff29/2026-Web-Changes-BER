#!/usr/bin/env python3
"""
Extract PDF floorplans from neighborhood zip files and generate a manifest.
"""

import os
import json
import zipfile
import re
from pathlib import Path

# Configuration
SOURCE_DIR = Path("Bonita Springs Floor Plans/Bonita Springs Floor Plans")
OUTPUT_DIR = Path("extracted_pdfs")
MANIFEST_FILE = Path("floorplan_manifest.json")

def slugify(text):
    """Convert text to URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text

def clean_filename(filename):
    """Clean up PDF filename for display."""
    name = Path(filename).stem
    # Remove common suffixes and clean up
    name = re.sub(r'-copy\d*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'[-_]', ' ', name)
    name = name.title()
    return name

def extract_zips():
    """Extract all PDFs from neighborhood zip files."""
    neighborhoods = []
    
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Process each zip file in the source directory
    for item in sorted(SOURCE_DIR.iterdir()):
        if item.suffix.lower() == '.zip':
            neighborhood_name = item.stem
            
            # Skip duplicate files
            if '(1)' in neighborhood_name:
                continue
                
            slug = slugify(neighborhood_name)
            neighborhood_output = OUTPUT_DIR / slug
            neighborhood_output.mkdir(exist_ok=True)
            
            floorplans = []
            
            try:
                with zipfile.ZipFile(item, 'r') as zf:
                    for member in zf.namelist():
                        if member.lower().endswith('.pdf') and not member.startswith('__MACOSX'):
                            # Extract the file
                            filename = Path(member).name
                            output_path = neighborhood_output / filename
                            
                            # Extract with proper handling
                            with zf.open(member) as source:
                                with open(output_path, 'wb') as target:
                                    target.write(source.read())
                            
                            floorplans.append({
                                "name": clean_filename(filename),
                                "filename": filename,
                                "path": f"{slug}/{filename}"
                            })
                
                if floorplans:
                    neighborhoods.append({
                        "name": neighborhood_name,
                        "slug": slug,
                        "count": len(floorplans),
                        "floorplans": sorted(floorplans, key=lambda x: x['name'])
                    })
                    print(f"✓ {neighborhood_name}: {len(floorplans)} floorplans")
                    
            except zipfile.BadZipFile:
                print(f"✗ {neighborhood_name}: Bad zip file")
        
        elif item.is_dir():
            # Handle already-extracted folders like "US HOMES"
            slug = slugify(item.name)
            neighborhood_output = OUTPUT_DIR / slug
            neighborhood_output.mkdir(exist_ok=True)
            
            floorplans = []
            
            for pdf in item.glob('*.pdf'):
                # Copy the PDF
                output_path = neighborhood_output / pdf.name
                if not output_path.exists():
                    output_path.write_bytes(pdf.read_bytes())
                
                floorplans.append({
                    "name": clean_filename(pdf.name),
                    "filename": pdf.name,
                    "path": f"{slug}/{pdf.name}"
                })
            
            if floorplans:
                neighborhoods.append({
                    "name": item.name,
                    "slug": slug,
                    "count": len(floorplans),
                    "floorplans": sorted(floorplans, key=lambda x: x['name'])
                })
                print(f"✓ {item.name}: {len(floorplans)} floorplans (folder)")
    
    # Sort neighborhoods alphabetically
    neighborhoods.sort(key=lambda x: x['name'])
    
    # Calculate totals
    total_floorplans = sum(n['count'] for n in neighborhoods)
    
    # Generate manifest
    manifest = {
        "generated": "2026-01-19",
        "totalNeighborhoods": len(neighborhoods),
        "totalFloorplans": total_floorplans,
        "neighborhoods": neighborhoods
    }
    
    with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"Total: {len(neighborhoods)} neighborhoods, {total_floorplans} floorplans")
    print(f"Manifest saved to: {MANIFEST_FILE}")
    print(f"PDFs extracted to: {OUTPUT_DIR}")

if __name__ == "__main__":
    os.chdir(Path(__file__).parent)
    extract_zips()
