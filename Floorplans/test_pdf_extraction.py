#!/usr/bin/env python3
"""
Test PDF text extraction on sample floor plan files.
"""

import fitz  # PyMuPDF
from pathlib import Path
import re

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        return f"ERROR: {e}"

def find_floor_plan_name(text, filename):
    """Try to identify the floor plan name from extracted text."""
    if not text or text.startswith("ERROR"):
        return None
    
    # Split into lines and look for potential names
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # Common patterns to find floor plan names
    patterns = [
        r'^The\s+(\w+[\w\s\-\']+)',  # "The Aberdeen" style
        r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*$',  # Title case names
        r'Model:\s*(.+)',  # "Model: XYZ"
        r'Floor Plan:\s*(.+)',  # "Floor Plan: XYZ"
        r'Plan(?:\s+#?\d+)?:\s*(.+)',  # "Plan: XYZ" or "Plan #123: XYZ"
    ]
    
    # Check first 10 lines for potential names
    for line in lines[:10]:
        for pattern in patterns:
            match = re.match(pattern, line)
            if match:
                name = match.group(1).strip()
                if len(name) > 2 and len(name) < 60:
                    return name
    
    # If no pattern matched, return the first substantial line
    for line in lines[:5]:
        if len(line) > 3 and len(line) < 50 and not any(c.isdigit() for c in line[:3]):
            # Check it's not just a company/address
            if not any(word in line.lower() for word in ['inc', 'llc', 'corp', 'address', 'phone', 'fax']):
                return line
    
    return None

# Test on sample PDFs from different neighborhoods
test_files = [
    Path("extracted_pdfs/us-homes/Aruba.pdf"),
    Path("extracted_pdfs/us-homes/The-Aberdeen-V.pdf"),
    Path("extracted_pdfs/us-homes/The-Acacia.pdf"),
    Path("extracted_pdfs/bermuda-isles/Anguilla.pdf"),
    Path("extracted_pdfs/bonita-bay/1.pdf"),
    Path("extracted_pdfs/bonita-bay/10.pdf"),
    Path("extracted_pdfs/pelican-landing/1.pdf"),
    Path("extracted_pdfs/the-brooks/1.pdf"),
]

print("Testing PDF text extraction...\n")
print("=" * 80)

for pdf_path in test_files:
    if pdf_path.exists():
        text = extract_text_from_pdf(pdf_path)
        suggested_name = find_floor_plan_name(text, pdf_path.name)
        
        print(f"\nFile: {pdf_path}")
        print(f"Current name: {pdf_path.stem}")
        print(f"Suggested name: {suggested_name}")
        print(f"Text preview (first 300 chars):")
        print("-" * 40)
        print(text[:300] if text else "(no text)")
        print("-" * 40)
    else:
        print(f"\nFile not found: {pdf_path}")

print("\n" + "=" * 80)
print("Done testing.")
