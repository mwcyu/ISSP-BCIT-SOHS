"""
Command-line interface for the RAG-based Clinical Feedback Helper
"""
import sys
from pathlib import Path
from .agent import ClinicalFeedbackAgent
from .utils import ReportExporter, format_report_for_display
from .config import Config


def print_separator():
    """Print a visual separator"""
    print("\n" + "=" * 80 + "\n")


def print_assistant(message: str):
    """Print assistant message with formatting"""
    print(f"\n🤖 Assistant: {message}\n")


def print_status(message: str):
    """Print status message"""
    print(f"\n📊 {message}\n")


def main():
    """Main CLI application"""
    
    print_separator()
    print("Clinical Feedback Helper - RAG-based AI Agent")
    print("Using LangChain with Retrieval-Augmented Generation")
    print_separator()
    
    try:
        # Validate configuration
        Config.validate()
        
        # Initialize agent
        print_status("Initializing agent and knowledge base...")
        agent = ClinicalFeedbackAgent()
        
        # Start session
        session_id, welcome = agent.start_session()
        print_status(f"Session started: {session_id[:8]}")
        print_assistant(welcome)
        
        # Main conversation loop
        while True:
            # Get user input
            try:
                user_input = input("You: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\n\nSession interrupted by user.")
                break
            
            if not user_input:
                continue
            
            # Check for special commands
            if user_input.lower() in ['exit', 'quit', 'q']:
                print("\nEnding session...")
                break
            
            if user_input.lower() == 'status':
                state = agent.get_session_state()
                print_status(f"Session State: {state}")
                continue
            
            # Process message
            response = agent.process_message(user_input)
            print_assistant(response)
            
            # Check if session is complete
            if agent.current_session and agent.current_session.is_complete():
                # Check if we have email
                if agent.current_session.preceptor_email:
                    print_status("Session complete! Generating final report...")
                    
                    # Generate report
                    report = agent.generate_final_report()
                    
                    # Export report
                    exporter = ReportExporter()
                    exported_files = exporter.export_report(report)
                    
                    # Export session data
                    session_files = exporter.export_session(agent.current_session)
                    
                    # Display report
                    print("\n")
                    print(format_report_for_display(report))
                    print("\n")
                    
                    print_status("Reports saved:")
                    for format_type, filepath in exported_files.items():
                        print(f"  - {format_type.upper()}: {filepath}")
                    for file_type, filepath in session_files.items():
                        print(f"  - {file_type.upper()}: {filepath}")
                    
                    print(f"\nEmail will be sent to: {agent.current_session.preceptor_email}")
                    print("\nThank you for using the Clinical Feedback Helper!")
                    break
        
    except ValueError as e:
        print(f"\n❌ Configuration Error: {e}")
        print("Please ensure OPENAI_API_KEY is set in your .env file")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
