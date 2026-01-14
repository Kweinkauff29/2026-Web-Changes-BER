import pandas as pd
import os

file_path = r"C:\Users\Kevin\2026-Web-Changes-BER\Closed Sales (2).xlsx"

try:
    # Read the excel file with no header to see raw layout
    df = pd.read_excel(file_path, header=None)
    
    print("--- First 15 Rows of Data ---")
    print(df.head(15).to_string())
    
    print("\n--- detailed inspection of row 1 (potential header) ---")
    # visual inspection of what might be the header row
    # usually it's row index 1 or 2
    for i in range(15):
        row = df.iloc[i].tolist()
        # print first 10 cols
        print(f"Row {i}: {row[:10]}")

except Exception as e:
    print(f"Error reading excel: {e}")
