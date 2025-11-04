import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

VECTOR_DIR = "vectorstores"
os.makedirs(VECTOR_DIR, exist_ok=True)

def _create_vectorstore(pdf_path, name, embedding):
    """Build a Chroma store from PDF and persist it."""
    print(f"Building vectorstore for {name} ...")
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    
    # RecursiveCharacterTextSplitter follows LangChain best practices
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=200
    )
    return splitter.split_documents(docs)


def build_or_load_vectorstores() -> Dict[str, Chroma]:
    """
    Create or load persistent Chroma vectorstores for knowledge bases.
    
    Implements caching pattern from LangChain RAG docs:
    - Checks for existing vectorstore on disk
    - Loads from disk if available (fast startup)
    - Builds from markdown files if not cached (first run only)
    
    Uses OpenAI text-embedding-3-small model:
    - 1536 dimensions
    - High quality, cost-effective
    - Per LangChain embedding recommendations
    
    Returns:
        Dictionary mapping collection name to Chroma vectorstore instance
    """
    _ensure_dirs()
    
    # Initialize embeddings (follows LangChain docs pattern)
    embed = OpenAIEmbeddings(model="text-embedding-3-small")

    stores: Dict[str, Chroma] = {}
    
    for name, dir_path in KNOWLEDGE_DIRS.items():
        persist_dir = os.path.join(PERSIST_ROOT, name)
        
        # Check if vectorstore already exists (caching optimization)
        exists = os.path.isdir(persist_dir) and any(os.scandir(persist_dir))
        
        if exists:
            # Load existing vectorstore (fast path)
            print(f"✅ Loading cached vectorstore: {name}")
            store = Chroma(
                collection_name=name,
                persist_directory=persist_dir,
                embedding_function=embed,
            )
        else:
            # Build new vectorstore from markdown files (first run only)
            print(f"🔨 Building vectorstore from markdown files: {name}")
            chunks = _chunks_from_directory(dir_path)
            print(f"   Loaded {len(chunks)} chunks")
            
            # Chroma.from_documents pattern from LangChain docs
            store = Chroma.from_documents(
                documents=chunks,
                embedding=embed,
                collection_name=name,
                persist_directory=persist_dir,
            )
            print(f"✅ Vectorstore built and persisted: {name}")
        
        stores[name] = store
    
    return stores

