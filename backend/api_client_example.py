"""
Example API client for the Nursing Feedback AI Chatbot
This demonstrates how to interact with the backend from a frontend application
"""

import requests
import json
from typing import Dict, Any, Optional

class NursingFeedbackAPI:
    """
    Client class to interact with the Nursing Feedback AI Chatbot API
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        """
        Initialize the API client
        
        Args:
            base_url: The base URL of the API server
        """
        self.base_url = base_url
        self.session = requests.Session()
        
    def get_feedback_sections(self) -> Dict[str, Any]:
        """
        Get all available feedback sections
        
        Returns:
            Dictionary containing all feedback sections
        """
        try:
            response = self.session.get(f"{self.base_url}/api/sections")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Failed to get sections: {str(e)}"}
    
    def send_message(
        self, 
        session_id: str, 
        message: str, 
        section_id: int = 1
    ) -> Dict[str, Any]:
        """
        Send a message to the chatbot
        
        Args:
            session_id: Unique identifier for the conversation session
            message: The message/feedback to send
            section_id: Current feedback section (1-8)
            
        Returns:
            Chatbot response with navigation information
        """
        try:
            payload = {
                "session_id": session_id,
                "message": message,
                "section_id": section_id
            }
            
            response = self.session.post(
                f"{self.base_url}/api/chat",
                json=payload
            )
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            return {
                "error": f"Failed to send message: {str(e)}",
                "response": "Sorry, there was an error processing your message.",
                "current_section": section_id,
                "is_section_complete": False,
                "next_action": "retry"
            }
    
    def get_session_progress(self, session_id: str) -> Dict[str, Any]:
        """
        Get the current progress of a feedback session
        
        Args:
            session_id: The session ID to check
            
        Returns:
            Progress information including completion percentage
        """
        try:
            response = self.session.get(f"{self.base_url}/api/session/{session_id}/progress")
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            return {
                "error": f"Failed to get progress: {str(e)}",
                "session_found": False,
                "progress_percentage": 0.0
            }
    
    def generate_summary(self, session_id: str) -> Dict[str, Any]:
        """
        Generate a comprehensive feedback summary
        
        Args:
            session_id: The session ID to generate summary for
            
        Returns:
            Comprehensive feedback summary with recommendations
        """
        try:
            payload = {"session_id": session_id}
            
            response = self.session.post(
                f"{self.base_url}/api/summary",
                json=payload
            )
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            return {
                "error": f"Failed to generate summary: {str(e)}",
                "summary": "Error generating summary."
            }
    
    def reset_session(self, session_id: str) -> Dict[str, Any]:
        """
        Reset a feedback session
        
        Args:
            session_id: The session ID to reset
            
        Returns:
            Success or error message
        """
        try:
            response = self.session.delete(f"{self.base_url}/api/session/{session_id}")
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            return {"error": f"Failed to reset session: {str(e)}"}

# Example usage and test functions
def example_usage():
    """
    Example of how to use the API client
    """
    print("🏥 Nursing Feedback API Client Example")
    print("=" * 40)
    
    # Initialize API client
    api = NursingFeedbackAPI()
    
    # Test connection and get sections
    print("📋 Getting feedback sections...")
    sections = api.get_feedback_sections()
    
    if "error" not in sections:
        print(f"✅ Found {len(sections.get('sections', []))} feedback sections")
        
        # Display first few sections
        for section in sections.get('sections', [])[:3]:
            print(f"  - Section {section['id']}: {section['title']}")
    else:
        print(f"❌ Error: {sections['error']}")
        return
    
    print()
    
    # Start a feedback session
    session_id = "demo-session-001"
    current_section = 1
    
    print(f"🎯 Starting feedback session: {session_id}")
    
    # Example feedback message
    feedback_message = """
    The student showed strong clinical knowledge when caring for a diabetic patient.
    They correctly calculated insulin dosages and understood the importance of 
    blood glucose monitoring. They demonstrated good understanding of 
    diabetic complications and prevention strategies. However, they needed 
    some guidance on patient education techniques for dietary management.
    """
    
    print("💬 Sending feedback message...")
    response = api.send_message(session_id, feedback_message, current_section)
    
    if "error" not in response:
        print("🤖 AI Response:")
        print(f"   {response['response']}")
        print(f"   Section Complete: {response['is_section_complete']}")
        print(f"   Next Action: {response['next_action']}")
        print(f"   Current Section: {response['current_section']}")
    else:
        print(f"❌ Error: {response['error']}")
    
    print()
    
    # Check progress
    print("📊 Checking session progress...")
    progress = api.get_session_progress(session_id)
    
    if "error" not in progress:
        print(f"   Progress: {progress.get('progress_percentage', 0):.1f}%")
        print(f"   Completed Sections: {progress.get('completed_sections', 0)}/8")
    else:
        print(f"❌ Error: {progress['error']}")
    
    print()
    
    # Test with a vague response
    print("🔍 Testing clarification request (vague response)...")
    vague_response = "The student was fine with communication."
    
    response2 = api.send_message(session_id, vague_response, 3)  # Communication section
    
    if "error" not in response2:
        print("🤖 AI Clarification Request:")
        print(f"   {response2['response']}")
        print(f"   Next Action: {response2['next_action']}")
    else:
        print(f"❌ Error: {response2['error']}")
    
    print()
    
    # Cleanup
    print("🧹 Resetting session...")
    reset_result = api.reset_session(session_id)
    
    if "error" not in reset_result:
        print("✅ Session reset successfully")
    else:
        print(f"❌ Reset error: {reset_result['error']}")

def simulate_complete_session():
    """
    Simulate a complete feedback session through all 8 sections
    """
    print("\n🎯 Simulating Complete Feedback Session")
    print("=" * 40)
    
    api = NursingFeedbackAPI()
    session_id = "complete-demo-session"
    
    # Sample responses for each section
    section_responses = {
        1: "Student demonstrated excellent pathophysiology knowledge and medication understanding with cardiac patients.",
        2: "Patient care skills were strong - good assessment techniques and safety protocol adherence.",
        3: "Communication was therapeutic and professional with patients and families. Good team collaboration.",
        4: "Critical thinking skills evident in patient prioritization and clinical decision-making.",
        5: "Maintained high professional standards and demonstrated good ethical reasoning throughout.",
        6: "Time management was efficient with good task prioritization and organization.",
        7: "Very receptive to feedback and showed initiative in learning new skills.",
        8: "Overall excellent performance with strong readiness for advanced practice."
    }
    
    # Process each section
    for section_id in range(1, 9):
        print(f"\n📝 Processing Section {section_id}...")
        
        response = api.send_message(
            session_id, 
            section_responses[section_id], 
            section_id
        )
        
        if "error" not in response:
            print(f"✅ Section {section_id} processed")
            if response['is_section_complete']:
                print(f"   ✓ Section marked complete")
        else:
            print(f"❌ Section {section_id} error: {response['error']}")
    
    # Generate final summary
    print("\n📄 Generating final summary...")
    summary = api.generate_summary(session_id)
    
    if "error" not in summary:
        print("✅ Summary generated successfully")
        print("\n📋 Summary Preview:")
        summary_text = summary.get('summary', '')
        # Show first 300 characters
        print(f"   {summary_text[:300]}{'...' if len(summary_text) > 300 else ''}")
    else:
        print(f"❌ Summary error: {summary['error']}")
    
    # Final progress check
    print("\n📊 Final progress check...")
    progress = api.get_session_progress(session_id)
    
    if "error" not in progress:
        print(f"   Final Progress: {progress.get('progress_percentage', 0):.1f}%")
    
    # Cleanup
    print("\n🧹 Cleaning up...")
    api.reset_session(session_id)

if __name__ == "__main__":
    print("🚀 Running API Client Examples")
    print("Make sure the backend server is running on http://localhost:8000")
    print()
    
    # Basic usage example
    example_usage()
    
    # Complete session simulation
    simulate_complete_session()
    
    print("\n✅ API Client examples completed!")