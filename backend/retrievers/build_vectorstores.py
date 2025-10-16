import os
import glob
from typing import Dict

from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Path configuration
BASE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(BASE)
DATA_DIR = os.path.join(PROJECT, "data")
PERSIST_ROOT = os.path.join(PROJECT, "vectorstores")

# Knowledge base directory mapping
KNOWLEDGE_DIRS = {
    "standards": os.path.join(DATA_DIR, "Standards of Practice"),
    "improvements": os.path.join(DATA_DIR, "Areas of Concern & Strategies for Improvement"),
}


def _ensure_dirs():
    """Create vectorstore directory if it doesn't exist."""
    os.makedirs(PERSIST_ROOT, exist_ok=True)


def _chunks_from_directory(dir_path: str):
    """
    Load and chunk markdown documents from a directory.
    
    Uses RecursiveCharacterTextSplitter for semantic chunking:
    - chunk_size=1200: Larger chunks for better context
    - chunk_overlap=200: 16% overlap for continuity between chunks
    
    Args:
        dir_path: Path to directory containing markdown files
        
    Returns:
        List of Document objects with chunked content
    """
    # Load all markdown files from directory and subdirectories
    loader = DirectoryLoader(
        dir_path,
        glob="**/*.md",
        loader_cls=UnstructuredMarkdownLoader,
        show_progress=True
    )
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

