import os
from sentence_transformers import SentenceTransformer
import chromadb
from tqdm import tqdm

CHUNK_DIR = "data_chunks"      
PERSIST_DIR = "chroma_db"      
COLLECTION_NAME = "healthcare_chunks"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

print("Loading embedding model...")
model = SentenceTransformer(EMBEDDING_MODEL)

print("Initializing persistent ChromaDB...")
client = chromadb.PersistentClient(path=PERSIST_DIR)

collection = client.get_or_create_collection(name=COLLECTION_NAME)

print("Processing chunks and adding to ChromaDB...")
for chapter in os.listdir(CHUNK_DIR):
    chapter_path = os.path.join(CHUNK_DIR, chapter)
    
    if not os.path.isdir(chapter_path):
        continue
    
    for chunk_file in tqdm(os.listdir(chapter_path), desc=f"Processing {chapter}"):
        chunk_path = os.path.join(chapter_path, chunk_file)
        
        if not os.path.isfile(chunk_path):
            continue
            
        with open(chunk_path, "r", encoding="utf-8") as f:
            text = f.read()
        
        embedding = model.encode(text).tolist()
        
        chunk_id = f"{chapter}_{chunk_file}"
        
        collection.add(
            documents=[text],
            metadatas=[{"chapter": chapter, "file": chunk_file}],
            ids=[chunk_id],
            embeddings=[embedding]
        )

print(f"All chunks added and automatically persisted in '{PERSIST_DIR}'!")
