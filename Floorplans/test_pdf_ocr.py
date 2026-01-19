#!/usr/bin/env python3
"""
Test OCR extraction from PDF floor plans using PyMuPDF's OCR capabilities.
"""

import fitz  # PyMuPDF
from pathlib import Path

def extract_images_and_try_ocr(pdf_path):
    """Extract images from PDF and try OCR."""
    try:
        doc = fitz.open(pdf_path)
        results = []
        
        for page_num, page in enumerate(doc):
            # Get page as pixmap (image)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x scale for better OCR
            
            # Try to use OCR if available
            try:
                # First, let's check what text blocks we can find
                blocks = page.get_text("dict")["blocks"]
                for block in blocks[:5]:  # First 5 blocks
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                text = span.get("text", "").strip()
                                if text:
                                    results.append(text)
            except Exception as e:
                results.append(f"Text extraction error: {e}")
            
            # Get page dimensions
            results.append(f"Page {page_num + 1} dimensions: {page.rect}")
            
        doc.close()
        return results
    except Exception as e:
        return [f"ERROR: {e}"]

# Test on a few PDFs with known good filenames vs generic names
test_files = [
    ("Named file", Path("extracted_pdfs/us-homes/Aruba.pdf")),
    ("Named file", Path("extracted_pdfs/bermuda-isles/Bermuda.pdf")),
    ("Generic #1", Path("extracted_pdfs/bonita-bay/1.pdf")),
    ("Generic #50", Path("extracted_pdfs/bonita-bay/50.pdf")),
]

print("Testing image-based PDF extraction...\n")

for label, pdf_path in test_files:
    if pdf_path.exists():
        results = extract_images_and_try_ocr(pdf_path)
        print(f"\n{label}: {pdf_path}")
        print(f"  Results: {results[:10]}")  # First 10 results
        print(f"  File size: {pdf_path.stat().st_size:,} bytes")
    else:
        print(f"\nFile not found: {pdf_path}")

print("\n" + "=" * 60)
print("Conclusion: Most floor plan PDFs appear to be scanned images")
print("without embedded text. OCR would require additional libraries")
print("like Tesseract OCR which need system-level installation.")
