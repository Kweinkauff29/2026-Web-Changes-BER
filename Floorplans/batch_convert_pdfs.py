#!/usr/bin/env python3
"""
Batch convert numbered PDF floor plans to images for AI analysis.
Process only PDFs with generic numbered names.
"""

import fitz  # PyMuPDF
import json
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import time

# Configuration
OUTPUT_DIR = Path("numbered_pdf_images")
MANIFEST_FILE = Path("floorplan_manifest.json")
MAX_IMAGES_PER_BATCH = 50  # Process in batches to track progress

def is_generic_number(filename):
    """Check if filename is just a number."""
    stem = Path(filename).stem
    return bool(re.match(r'^\(?\d+\)?$', stem))

def convert_pdf_to_image(pdf_path, output_path):
    """Convert first page of PDF to image."""
    try:
        doc = fitz.open(pdf_path)
        page = doc[0]
        
        # Scale for readable text (2x resolution)
        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
        pix.save(output_path)
        
        doc.close()
        return True
    except Exception as e:
        print(f"Error: {pdf_path}: {e}")
        return False

def main():
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Load manifest
    with open(MANIFEST_FILE, "r") as f:
        manifest = json.load(f)
    
    # Find all numbered PDFs
    numbered_pdfs = []
    for neighborhood in manifest["neighborhoods"]:
        neighborhood_slug = neighborhood["slug"]
        
        for fp in neighborhood["floorplans"]:
            if is_generic_number(fp["filename"]):
                pdf_path = Path("extracted_pdfs") / fp["path"]
                output_name = f"{neighborhood_slug}_{fp['filename'].replace('.pdf', '.png')}"
                output_path = OUTPUT_DIR / output_name
                
                if not output_path.exists():  # Skip already converted
                    numbered_pdfs.append({
                        "pdf_path": pdf_path,
                        "output_path": output_path,
                        "neighborhood": neighborhood["name"],
                        "original_name": fp["filename"],
                        "manifest_path": fp["path"]
                    })
    
    print(f"Found {len(numbered_pdfs)} numbered PDFs to convert")
    print(f"Output directory: {OUTPUT_DIR.absolute()}")
    print()
    
    # Process in batches
    batch_num = 0
    processed = 0
    start_time = time.time()
    
    for i in range(0, len(numbered_pdfs), MAX_IMAGES_PER_BATCH):
        batch = numbered_pdfs[i:i + MAX_IMAGES_PER_BATCH]
        batch_num += 1
        
        print(f"Batch {batch_num}: Processing {len(batch)} PDFs...")
        
        for item in batch:
            if convert_pdf_to_image(item["pdf_path"], item["output_path"]):
                processed += 1
        
        elapsed = time.time() - start_time
        rate = processed / elapsed if elapsed > 0 else 0
        remaining = len(numbered_pdfs) - i - len(batch)
        eta = remaining / rate if rate > 0 else 0
        
        print(f"  Progress: {processed}/{len(numbered_pdfs)} ({100*processed//len(numbered_pdfs)}%)")
        print(f"  ETA: {eta:.0f}s")
        print()
    
    print(f"Done! Converted {processed} PDFs to images in {time.time() - start_time:.1f}s")
    print(f"Images saved to: {OUTPUT_DIR.absolute()}")

if __name__ == "__main__":
    main()
