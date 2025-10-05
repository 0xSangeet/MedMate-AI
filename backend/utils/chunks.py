import os

output_dir = "data_text"

def chunk_text(text, max_words=300, overlap=100):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + max_words, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += max_words - overlap
    return chunks

chunked_dir = "data_chunks"
os.makedirs(chunked_dir, exist_ok=True)

for chapter_dir in os.listdir(output_dir):
    chapter_path = os.path.join(output_dir, chapter_dir)
    out_chapter_path = os.path.join(chunked_dir, chapter_dir)
    os.makedirs(out_chapter_path, exist_ok=True)
    
    for txt_file in os.listdir(chapter_path):
        txt_path = os.path.join(chapter_path, txt_file)
        with open(txt_path, "r", encoding="utf-8") as f:
            text = f.read()
        chunks = chunk_text(text)
        
        for j, chunk in enumerate(chunks):
            out_file = os.path.join(out_chapter_path, f"{txt_file[:-4]}_chunk{j+1:02d}.txt")
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(chunk)
