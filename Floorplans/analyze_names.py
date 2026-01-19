#!/usr/bin/env python3
"""
Analyze PDF filenames to understand naming patterns across neighborhoods.
"""

import json
import re
from pathlib import Path

# Load manifest
with open("floorplan_manifest.json", "r") as f:
    manifest = json.load(f)

# Categorize filenames
generic_numbered = 0  # Files like "1.pdf", "10.pdf", etc.
descriptive_names = 0  # Files with actual names
neighborhoods_with_names = []
neighborhoods_with_numbers = []

def is_generic_number(filename):
    """Check if filename is just a number."""
    stem = Path(filename).stem
    # Pure numbers, or numbers with parentheses like "(1)"
    return bool(re.match(r'^\(?\d+\)?$', stem))

for neighborhood in manifest["neighborhoods"]:
    has_names = False
    has_numbers = False
    
    for fp in neighborhood["floorplans"]:
        filename = fp["filename"]
        if is_generic_number(filename):
            generic_numbered += 1
            has_numbers = True
        else:
            descriptive_names += 1
            has_names = True
    
    if has_names and not has_numbers:
        neighborhoods_with_names.append((neighborhood["name"], neighborhood["count"]))
    elif has_numbers:
        neighborhoods_with_numbers.append((neighborhood["name"], neighborhood["count"]))

total = generic_numbered + descriptive_names
print("=" * 60)
print("PDF Filename Analysis")
print("=" * 60)
print(f"\nTotal PDFs: {total}")
print(f"  - Generic numbered files (1.pdf, 2.pdf, etc.): {generic_numbered} ({100*generic_numbered//total}%)")
print(f"  - Descriptive named files: {descriptive_names} ({100*descriptive_names//total}%)")

print(f"\nNeighborhoods with descriptive names ({len(neighborhoods_with_names)}):")
for name, count in sorted(neighborhoods_with_names, key=lambda x: -x[1])[:15]:
    print(f"  - {name}: {count} plans")

print(f"\nNeighborhoods with numbered files ({len(neighborhoods_with_numbers)}):")
for name, count in sorted(neighborhoods_with_numbers, key=lambda x: -x[1])[:15]:
    print(f"  - {name}: {count} plans")

# Sample some descriptive names
print("\n" + "=" * 60)
print("Sample descriptive filenames:")
print("=" * 60)
sample_count = 0
for neighborhood in manifest["neighborhoods"]:
    for fp in neighborhood["floorplans"]:
        if not is_generic_number(fp["filename"]):
            print(f"  {neighborhood['name']}: {fp['name']}")
            sample_count += 1
            if sample_count >= 20:
                break
    if sample_count >= 20:
        break
