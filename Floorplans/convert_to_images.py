#!/usr/bin/env python3
"""
Convert sample PDFs to images for AI vision analysis.
"""

import fitz  # PyMuPDF
from pathlib import Path

# Create output directory for sample images
output_dir = Path("sample_images")
output_dir.mkdir(exist_ok=True)

# Sample PDFs with numbered names to test OCR
sample_pdfs = [
    Path("extracted_pdfs/bonita-bay/1.pdf"),
    Path("extracted_pdfs/bonita-bay/10.pdf"),
    Path("extracted_pdfs/bonita-bay/50.pdf"),
    Path("extracted_pdfs/pelican-landing/(1).pdf"),
    Path("extracted_pdfs/pelican-marsh/1.pdf"),
    Path("extracted_pdfs/highland-woods/1.pdf"),
]

print("Converting PDFs to images for AI analysis...\n")

for pdf_path in sample_pdfs:
    if pdf_path.exists():
        doc = fitz.open(pdf_path)
        page = doc[0]  # First page
        
        # Higher resolution for better OCR
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        
        # Save as PNG
        output_name = f"{pdf_path.parent.name}_{pdf_path.stem}.png"
        output_path = output_dir / output_name
        pix.save(output_path)
        
        print(f"Saved: {output_path}")
        print(f"  Size: {pix.width}x{pix.height}")
        
        doc.close()
    else:
        print(f"Not found: {pdf_path}")

print(f"\nImages saved to: {output_dir.absolute()}")
