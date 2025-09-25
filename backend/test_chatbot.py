"""
Test script to demonstrate the Nursing Feedback AI Chatbot functionality
Run this after setting up the environment to test the system
"""

import asyncio
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our services
from services.rag_service import RAGService
from services.chatbot_service import ChatbotService

async def test_chatbot_functionality():
    """
    Test the complete chatbot workflow
    """
    print("🏥 Testing Nursing Feedback AI Chatbot")
    print("=" * 50)
    
    try:
        # Check if OpenAI API key is set
        if not os.getenv("OPENAI_API_KEY"):
            print("❌ Error: OPENAI_API_KEY not found in environment variables")
            print("Please edit .env file and add your OpenAI API key")
            return
        
        # Initialize services
        print("🔧 Initializing RAG service...")
        rag_service = RAGService()
        await rag_service.initialize()
        
        print("🤖 Initializing Chatbot service...")
        chatbot_service = ChatbotService(rag_service)
        
        print("✅ Services initialized successfully!")
        print()
        
        # Test session
        session_id = "test-session-001"
        
        # Simulate feedback for Section 1: Clinical Knowledge Application
        print("📝 Testing Section 1: Clinical Knowledge Application")
        print("-" * 30)
        
        test_message = """
        The student demonstrated excellent understanding of cardiac pathophysiology 
        when caring for a patient with heart failure. They correctly identified 
        signs of fluid overload and understood the rationale behind diuretic therapy. 
        However, they needed guidance on medication timing and drug interactions. 
        They showed good critical thinking when the patient's condition changed 
        and appropriately notified the physician about worsening symptoms.
        """
        
        response1 = await chatbot_service.process_message(
            session_id=session_id,
            message=test_message,
            section_id=1
        )
        
        print(f"AI Response: {response1['response']}")
        print(f"Section Complete: {response1['is_section_complete']}")
        print(f"Next Action: {response1['next_action']}")
        print()
        
        # Test a vague response to see clarification request
        print("📝 Testing clarification request (vague response)")
        print("-" * 30)
        
        vague_message = "The student was okay with communication."
        
        response2 = await chatbot_service.process_message(
            session_id=session_id,
            message=vague_message,
            section_id=3  # Communication section
        )
        
        print(f"AI Response: {response2['response']}")
        print(f"Section Complete: {response2['is_section_complete']}")
        print(f"Next Action: {response2['next_action']}")
        print()
        
        # Test session progress
        print("📊 Testing session progress")
        print("-" * 30)
        
        progress = await chatbot_service.get_session_progress(session_id)
        print(f"Progress: {progress}")
        print()
        
        # Test RAG context retrieval
        print("🔍 Testing RAG context retrieval")
        print("-" * 30)
        
        context = await rag_service.retrieve_relevant_context(
            query="nursing communication skills feedback",
            category="communication",
            top_k=2
        )
        
        print("Retrieved context:")
        for i, doc in enumerate(context):
            print(f"{i+1}. {doc['content'][:100]}...")
        print()
        
        # Clean up test session
        print("🧹 Cleaning up test session...")
        await chatbot_service.reset_session(session_id)
        
        print("✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

async def test_feedback_sections():
    """Test feedback sections configuration"""
    print("📋 Testing Feedback Sections Configuration")
    print("=" * 50)
    
    from config.feedback_sections import FEEDBACK_SECTIONS
    
    for section_id, section in FEEDBACK_SECTIONS.items():
        print(f"Section {section_id}: {section.title}")
        print(f"  Description: {section.description}")
        print(f"  Key Areas: {', '.join(section.key_areas[:2])}...")
        print(f"  Required Elements: {len(section.required_elements)} items")
        print()

def main():
    """Main test function"""
    print("🚀 Starting Nursing Feedback AI Chatbot Tests")
    print()
    
    # Test feedback sections first (no API calls needed)
    asyncio.run(test_feedback_sections())
    
    # Test chatbot functionality (requires API key)
    asyncio.run(test_chatbot_functionality())

if __name__ == "__main__":
    main()