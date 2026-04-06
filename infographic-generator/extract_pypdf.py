import fitz

def extract_pdf(pdf_path, out_path):
    print(f"Extracting {pdf_path}...")
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Done extracting {pdf_path}")

extract_pdf("February 2026 BonitaEstero.pdf", "bonita.txt")
extract_pdf("February 2026 NaplesFort Myers.pdf", "naples.txt")
