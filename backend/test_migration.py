#!/usr/bin/env python3
"""
Simple test to verify imports and basic structure without requiring API keys
"""

import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all imports work correctly"""
    print("Testing imports...")
    
    try:
        # Test LangChain v1 imports
        from langchain_openai import ChatOpenAI, OpenAIEmbeddings
        from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
        from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from langchain_core.documents import Document
        print("✅ LangChain v1 imports successful")
        
        # Test other core imports
        from services.chatbot_service import ChatbotService, SessionState
        print("✅ ChatbotService imports successful")
        
        from services.rag_service import RAGService
        print("✅ RAGService imports successful")
        
        from config.feedback_sections import FEEDBACK_SECTIONS
        print("✅ Config imports successful")
        
        print(f"\n✅ All imports successful!")
        print(f"✅ LangChain v1 syntax migration complete!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("\nTo install dependencies, run:")
        print("  pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_structure():
    """Test basic structure of services"""
    print("\nTesting service structure...")
    
    try:
        from services.chatbot_service import ChatbotService
        from services.rag_service import RAGService
        
        # Check if ChatbotService has the required methods
        required_methods = ['process_message', 'generate_final_summary', 'get_session_progress', 'reset_session']
        for method in required_methods:
            if not hasattr(ChatbotService, method):
                print(f"❌ ChatbotService missing method: {method}")
                return False
        print("✅ ChatbotService has all required methods")
        
        # Check if RAGService has the required methods
        required_methods = ['initialize', 'retrieve_relevant_context']
        for method in required_methods:
            if not hasattr(RAGService, method):
                print(f"❌ RAGService missing method: {method}")
                return False
        print("✅ RAGService has all required methods")
        
        return True
        
    except Exception as e:
        print(f"❌ Structure test error: {e}")
        return False

def main():
    """Main test runner"""
    print("=" * 60)
    print("🧪 LangChain v1 Migration Verification Test")
    print("=" * 60)
    print()
    
    # Run tests
    import_success = test_imports()
    structure_success = test_structure() if import_success else False
    
    print("\n" + "=" * 60)
    if import_success and structure_success:
        print("✅ All tests passed!")
        print("\nYour setup is ready for LangChain v1!")
        print("\nTo test the bot:")
        print("  1. Set up your .env file with OPENAI_API_KEY")
        print("  2. Run: python cli_repl.py")
        print("=" * 60)
        return 0
    else:
        print("❌ Some tests failed")
        print("\nPlease install dependencies and try again:")
        print("  pip install -r requirements.txt")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
