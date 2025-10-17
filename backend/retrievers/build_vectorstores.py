# retrievers/build_vectorstores.py
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

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    chunks = splitter.split_documents(docs)

    # Create Chroma vectorstore with persistence
    persist_directory = os.path.join(VECTOR_DIR, name)
    store = Chroma.from_documents(
        documents=chunks,
        embedding=embedding,
        persist_directory=persist_directory,
        collection_name=name
    )
    print(f"Saved {name} vectorstore to {persist_directory}")
    return store

def build_or_load_vectorstores():
    """Load cached Chroma vectorstores if available, otherwise build them."""
    embedding = OpenAIEmbeddings(model="text-embedding-3-small")

    pdfs = {
        "standards": "data/Standards of Practice.pdf",
        "improvements": "data/BCIT Nursing Practice Areas of Concern.pdf",
    }

    stores = {}

    for name, path in pdfs.items():
        persist_directory = os.path.join(VECTOR_DIR, name)

        # Check if the Chroma database already exists
        if os.path.exists(persist_directory) and os.path.exists(os.path.join(persist_directory, "chroma.sqlite3")):
            print(f"Loading existing vectorstore for {name} ...")
            store = Chroma(
                persist_directory=persist_directory,
                embedding_function=embedding,
                collection_name=name
            )
        else:
            store = _create_vectorstore(path, name, embedding)
        stores[name] = store

    return stores
