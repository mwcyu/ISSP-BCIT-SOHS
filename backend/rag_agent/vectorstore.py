"""
Vector store management for RAG-based retrieval
Uses LangChain's latest patterns for document loading and retrieval
"""
from typing import List, Optional
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .config import Config, BCCNM_STANDARDS
import os


class KnowledgeBase:
    """Manages the vector store for BCCNM standards knowledge"""
    
    def __init__(self, persist_directory: Optional[str] = None):
        self.persist_directory = persist_directory or Config.VECTOR_STORE_PATH
        self.embeddings = OpenAIEmbeddings(
            model=Config.EMBEDDING_MODEL,
            openai_api_key=Config.OPENAI_API_KEY
        )
        self.vectorstore: Optional[Chroma] = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=Config.CHUNK_SIZE,
            chunk_overlap=Config.CHUNK_OVERLAP,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    
    def create_documents(self) -> List[Document]:
        """Create Document objects from BCCNM standards"""
        documents = []
        
        for standard_key, standard_data in BCCNM_STANDARDS.items():
            # Main standard document
            content = f"""
Standard: {standard_data['full_name']}
Order: {standard_data['order']}

Description:
{standard_data['description']}

Key Areas:
{chr(10).join(f"- {area}" for area in standard_data['key_areas'])}

Example Questions for Preceptors:
{chr(10).join(f"- {q}" for q in standard_data['example_questions'])}
"""
            
            doc = Document(
                page_content=content,
                metadata={
                    "standard_key": standard_key,
                    "standard_name": standard_data['name'],
                    "order": standard_data['order'],
                    "type": "standard_overview"
                }
            )
            documents.append(doc)
            
            # Create separate documents for each key area
            for area in standard_data['key_areas']:
                area_doc = Document(
                    page_content=f"{standard_data['full_name']} - {area}\n\n{standard_data['description']}",
                    metadata={
                        "standard_key": standard_key,
                        "standard_name": standard_data['name'],
                        "key_area": area,
                        "type": "key_area"
                    }
                )
                documents.append(area_doc)
        
        return documents
    
    def initialize_vectorstore(self, force_recreate: bool = False) -> Chroma:
        """Initialize or load the vector store"""
        
        # Check if vectorstore already exists
        if os.path.exists(self.persist_directory) and not force_recreate:
            print("Loading existing vector store...")
            self.vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings,
                collection_name=Config.COLLECTION_NAME
            )
        else:
            print("Creating new vector store...")
            documents = self.create_documents()
            
            # Split documents if needed
            split_docs = self.text_splitter.split_documents(documents)
            
            # Create vectorstore
            self.vectorstore = Chroma.from_documents(
                documents=split_docs,
                embedding=self.embeddings,
                persist_directory=self.persist_directory,
                collection_name=Config.COLLECTION_NAME
            )
            
            print(f"Vector store created with {len(split_docs)} documents")
        
        return self.vectorstore
    
    def get_retriever(self, k: int = 3):
        """Get a retriever for the vectorstore"""
        if self.vectorstore is None:
            self.initialize_vectorstore()
        
        return self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )
    
    def retrieve_standard_context(self, standard_key: str, query: str = "") -> List[Document]:
        """Retrieve context for a specific standard"""
        if self.vectorstore is None:
            self.initialize_vectorstore()
        
        # Search with filter for the specific standard
        results = self.vectorstore.similarity_search(
            query=query or BCCNM_STANDARDS[standard_key]['description'],
            k=5,
            filter={"standard_key": standard_key}
        )
        
        return results
    
    def retrieve_context(self, query: str, k: int = 3) -> List[Document]:
        """Retrieve relevant context for a query"""
        if self.vectorstore is None:
            self.initialize_vectorstore()
        
        return self.vectorstore.similarity_search(query=query, k=k)


def format_docs(docs: List[Document]) -> str:
    """Format retrieved documents into a string for the prompt"""
    return "\n\n".join(
        f"[{doc.metadata.get('standard_name', 'Unknown')}]\n{doc.page_content}"
        for doc in docs
    )
