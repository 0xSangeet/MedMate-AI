from sentence_transformers import SentenceTransformer
import chromadb

PERSIST_DIR = "chroma_db"
COLLECTION_NAME = "healthcare_chunks"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
TOP_K = 3

_model = None
_collection = None


def _initialize():
    global _model, _collection
    
    if _model is None:
        print("Loading embedding model...")
        _model = SentenceTransformer(EMBEDDING_MODEL)
    
    if _collection is None:
        print("Connecting to ChromaDB...")
        client = chromadb.PersistentClient(path=PERSIST_DIR)
        _collection = client.get_collection(name=COLLECTION_NAME)


def get_relevant_context(question: str, top_k: int = TOP_K) -> list[str]:
    _initialize()
    
    query_embedding = _model.encode(question).tolist()
    
    results = _collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )
    
    return results["documents"][0]


def get_detailed_context(question: str, top_k: int = TOP_K) -> dict:
    _initialize()
    
    query_embedding = _model.encode(question).tolist()
    
    results = _collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )
    
    return {
        'documents': results['documents'][0],
        'metadatas': results['metadatas'][0],
        'distances': results['distances'][0],
        'ids': results['ids'][0]
    }


def format_context_for_llm(question: str, top_k: int = TOP_K) -> str:
    results = get_detailed_context(question, top_k)
    
    context_parts = []
    for i, (doc, metadata, distance) in enumerate(zip(
        results['documents'],
        results['metadatas'],
        results['distances']
    )):
        chapter = metadata.get('chapter', 'Unknown')
        relevance = 1 - distance
        
        context_parts.append(
            f"[Source {i+1} - Chapter: {chapter}, Relevance: {relevance:.2f}]\n{doc}"
        )
    
    return "\n\n".join(context_parts)



if __name__ == "__main__":
    question = "Patient has high fever and cough"
    
    print(f"Query: {question}\n")
    print("="*60)
    
    context_chunks = get_relevant_context(question, top_k=3)
    
    for i, chunk in enumerate(context_chunks, 1):
        print(f"\n--- Chunk {i} ---")
        print(chunk)
        print("-"*60)
    
    print(f"\nRetrieved {len(context_chunks)} relevant chunks")
    
    print("\n" + "="*60)
    print("FORMATTED FOR LLM:")
    print("="*60)
    llm_context = format_context_for_llm(question, top_k=3)
    print(llm_context)
