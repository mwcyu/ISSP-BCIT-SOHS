"""
Demo script to showcase the RAG-based Clinical Feedback Helper
Simulates a complete feedback session
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from rag_agent.agent import ClinicalFeedbackAgent
from rag_agent.utils import ReportExporter, format_report_for_display
from rag_agent.config import Config


def print_divider():
    print("\n" + "=" * 80 + "\n")


def simulate_conversation():
    """Simulate a complete feedback session"""
    
    print_divider()
    print("🎓 RAG-BASED CLINICAL FEEDBACK HELPER - DEMO")
    print_divider()
    
    # Check if API key is set
    if not Config.OPENAI_API_KEY:
        print("❌ Error: OPENAI_API_KEY not found in environment")
        print("Please set it in your .env file or environment variables")
        return
    
    print("✅ Configuration validated")
    print(f"📊 Model: {Config.MODEL_NAME}")
    print(f"🔧 Temperature: {Config.TEMPERATURE}")
    print(f"📁 Vector Store: {Config.VECTOR_STORE_PATH}")
    
    # Initialize agent
    print("\n🚀 Initializing agent...")
    agent = ClinicalFeedbackAgent()
    print("✅ Agent initialized with vector store")
    
    # Start session
    print("\n🎬 Starting feedback session...")
    session_id, welcome = agent.start_session()
    
    print_divider()
    print(f"Session ID: {session_id[:8]}...")
    print_divider()
    print(f"🤖 Assistant:\n{welcome}")
    print_divider()
    
    # Simulated conversation for Standard 1: Professional Responsibility
    print("Simulating conversation for Standard 1: Professional Responsibility\n")
    
    # Turn 1: Initial vague feedback
    preceptor_msg_1 = "The student was pretty good with professional responsibility."
    print(f"👤 Preceptor: {preceptor_msg_1}\n")
    response_1 = agent.process_message(preceptor_msg_1)
    print(f"🤖 Assistant:\n{response_1}")
    print_divider()
    
    # Turn 2: More specific with example
    preceptor_msg_2 = """The student consistently checked in with me before performing new procedures, 
    which showed good awareness of their scope. For example, when preparing to insert a catheter for 
    the first time, they asked me to supervise and verify their technique. They also documented everything 
    thoroughly and was honest when they made a small medication calculation error."""
    print(f"👤 Preceptor: {preceptor_msg_2}\n")
    response_2 = agent.process_message(preceptor_msg_2)
    print(f"🤖 Assistant:\n{response_2}")
    print_divider()
    
    # Turn 3: Confirm
    preceptor_msg_3 = "Yes, that looks good!"
    print(f"👤 Preceptor: {preceptor_msg_3}\n")
    response_3 = agent.process_message(preceptor_msg_3)
    print(f"🤖 Assistant:\n{response_3}")
    print_divider()
    
    # Standard 2: Knowledge-Based Practice
    print("Simulating conversation for Standard 2: Knowledge-Based Practice\n")
    
    preceptor_msg_4 = """The student demonstrated strong clinical knowledge. They performed vital signs 
    assessments accurately and could explain the rationale behind abnormal findings. When caring for a 
    post-operative patient with elevated blood pressure, they correctly identified potential causes and 
    suggested appropriate interventions. Their medication administration was safe, though they need to 
    work on their speed and confidence."""
    print(f"👤 Preceptor: {preceptor_msg_4}\n")
    response_4 = agent.process_message(preceptor_msg_4)
    print(f"🤖 Assistant:\n{response_4}")
    print_divider()
    
    # Confirm
    preceptor_msg_5 = "Yes, that's accurate."
    print(f"👤 Preceptor: {preceptor_msg_5}\n")
    response_5 = agent.process_message(preceptor_msg_5)
    print(f"🤖 Assistant:\n{response_5}")
    print_divider()
    
    # Standard 3: Client-Focused Service
    print("Simulating conversation for Standard 3: Client-Focused Service\n")
    
    preceptor_msg_6 = """Great team player! The student communicated effectively with the interdisciplinary 
    team during morning rounds and wasn't afraid to ask the physiotherapist for clarification on mobility 
    restrictions. They prioritized their patient care well, managing time between three patients efficiently. 
    I observed them advocating for a patient who was in pain, promptly notifying me so we could get orders 
    for additional pain management."""
    print(f"👤 Preceptor: {preceptor_msg_6}\n")
    response_6 = agent.process_message(preceptor_msg_6)
    print(f"🤖 Assistant:\n{response_6}")
    print_divider()
    
    # Confirm
    preceptor_msg_7 = "Correct, that captures it well."
    print(f"👤 Preceptor: {preceptor_msg_7}\n")
    response_7 = agent.process_message(preceptor_msg_7)
    print(f"🤖 Assistant:\n{response_7}")
    print_divider()
    
    # Standard 4: Ethical Practice
    print("Simulating conversation for Standard 4: Ethical Practice\n")
    
    preceptor_msg_8 = """Excellent ethical awareness. The student always closed curtains and doors before 
    patient care, spoke quietly when discussing patient information, and never shared details in public areas. 
    They showed cultural sensitivity when caring for a patient with specific religious dietary requirements, 
    taking time to understand and accommodate these needs. When faced with a family member requesting 
    information about another patient, they correctly deferred to me and maintained confidentiality."""
    print(f"👤 Preceptor: {preceptor_msg_8}\n")
    response_8 = agent.process_message(preceptor_msg_8)
    print(f"🤖 Assistant:\n{response_8}")
    print_divider()
    
    # Confirm
    preceptor_msg_9 = "Yes, perfect."
    print(f"👤 Preceptor: {preceptor_msg_9}\n")
    response_9 = agent.process_message(preceptor_msg_9)
    print(f"🤖 Assistant:\n{response_9}")
    print_divider()
    
    # Provide email
    preceptor_msg_10 = "My email is preceptor@healthauthority.ca"
    print(f"👤 Preceptor: {preceptor_msg_10}\n")
    response_10 = agent.process_message(preceptor_msg_10)
    print(f"🤖 Assistant:\n{response_10}")
    print_divider()
    
    # Generate final report
    print("📊 Generating Final Report...\n")
    report = agent.generate_final_report()
    
    # Display report
    print(format_report_for_display(report))
    
    # Export report
    exporter = ReportExporter()
    exported_files = exporter.export_report(report)
    session_files = exporter.export_session(agent.current_session)
    
    print("\n📁 Files Generated:")
    for format_type, filepath in exported_files.items():
        print(f"  ✅ {format_type.upper()}: {filepath}")
    for file_type, filepath in session_files.items():
        print(f"  ✅ {file_type.upper()}: {filepath}")
    
    print_divider()
    print("✨ Demo completed successfully!")
    print_divider()
    
    # Show session statistics
    state = agent.get_session_state()
    print("\n📈 Session Statistics:")
    print(f"  - Session ID: {state['session_id'][:16]}...")
    print(f"  - State: {state['state']}")
    print(f"  - Progress: {state['progress']} standards completed")
    print(f"  - Total conversation turns: {len(agent.current_session.conversation_history)}")
    print_divider()


if __name__ == "__main__":
    try:
        simulate_conversation()
    except KeyboardInterrupt:
        print("\n\n⚠️ Demo interrupted by user")
    except Exception as e:
        print(f"\n❌ Error during demo: {e}")
        import traceback
        traceback.print_exc()
