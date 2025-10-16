# retrievers/build_vectorstores.py
import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS

VECTOR_DIR = "vectorstores"
os.makedirs(VECTOR_DIR, exist_ok=True)

def _create_vectorstore(pdf_path, name, embedding):
    """Build a FAISS store from PDF and save it."""
    print(f"Building vectorstore for {name} ...")
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    chunks = splitter.split_documents(docs)

    store = FAISS.from_documents(chunks, embedding)
    save_path = os.path.join(VECTOR_DIR, name)
    store.save_local(save_path)
    print(f"Saved {name} vectorstore to {save_path}")
    return store

def build_or_load_vectorstores():
    """Load cached FAISS vectorstores if available, otherwise build them."""
    embedding = OpenAIEmbeddings(model="text-embedding-3-small")

    pdfs = {
        "standards": "data/Standards of Practice.pdf",
        "improvements": "data/BCIT Nursing Practice Areas of Concern.pdf",
    }

    stores = {}

    for name, path in pdfs.items():
        vector_path = os.path.join(VECTOR_DIR, name)
        index_file = os.path.join(vector_path, "index.faiss")

        if os.path.exists(index_file):
            print(f"Loading existing vectorstore for {name} ...")
            store = FAISS.load_local(vector_path, embedding, allow_dangerous_deserialization=True)
        else:
            store = _create_vectorstore(path, name, embedding)
        stores[name] = store

    return stores
