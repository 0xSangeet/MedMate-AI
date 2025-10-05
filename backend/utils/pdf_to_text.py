import pdfplumber
import os
from tqdm import tqdm

pdf_files = ["data/ch-1-3.pdf", "data/ch-6.pdf"]
output_dir = "data_text"

os.makedirs(output_dir, exist_ok=True)

for pdf_file in pdf_files:
    chapter_name = os.path.splitext(os.path.basename(pdf_file))[0]
    chapter_dir = os.path.join(output_dir, chapter_name)
    os.makedirs(chapter_dir, exist_ok=True)
    
    with pdfplumber.open(pdf_file) as pdf:
        for i, page in enumerate(tqdm(pdf.pages, desc=f"Processing {chapter_name}")):
            text = page.extract_text()
            if text:  # skip empty pages
                out_file = os.path.join(chapter_dir, f"{i+1:02d}.txt")
                with open(out_file, "w", encoding="utf-8") as f:
                    f.write(text)
