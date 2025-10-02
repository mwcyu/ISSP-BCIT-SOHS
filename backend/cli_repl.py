#!/usr/bin/env python3
"""
Simple CLI REPL for testing the AI chatbot directly in the terminal.
This version uses LangChain v1 syntax and provides a direct interface to the chatbot.
"""

import os
import sys
import asyncio
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

# Add the parent directory to the path so we can import services
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.chatbot_service import ChatbotService
from services.rag_service import RAGService
from config.feedback_sections import FEEDBACK_SECTIONS

# Load environment variables
load_dotenv()

class SimpleCLI:
    """Simple CLI interface for testing the chatbot"""
    
    def __init__(self):
        self.rag_service: Optional[RAGService] = None
        self.chatbot_service: Optional[ChatbotService] = None
        self.session_id = f"cli_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.current_section = 1
    
    async def initialize(self):
        """Initialize the services"""
        print("🤖 Initializing AI Agent...")
        print("=" * 60)
        
        # Check for API key
        if not os.getenv("OPENAI_API_KEY"):
            print("❌ ERROR: OPENAI_API_KEY not found in environment!")
            print("Please set your OpenAI API key in a .env file or environment variable.")
            return False
        
        try:
            # Initialize RAG service
            print("📚 Loading RAG service...")
            self.rag_service = RAGService()
            await self.rag_service.initialize()
            
            # Initialize Chatbot service
            print("🧠 Loading Chatbot service...")
            self.chatbot_service = ChatbotService(self.rag_service)
            
            print("✅ Initialization complete!")
            print("=" * 60)
            return True
        except Exception as e:
            print(f"❌ ERROR during initialization: {str(e)}")
            return False
    
    def show_welcome(self):
        """Show welcome message"""
        print("\n" + "=" * 60)
        print("🏥 NURSING FEEDBACK AI CHATBOT - CLI REPL")
        print("=" * 60)
        print("\nWelcome! This bot helps nursing preceptors provide")
        print("comprehensive feedback to nursing students.")
        print("\nCommands:")
        print("  - Type your feedback naturally")
        print("  - 'sections' - Show all feedback sections")
        print("  - 'progress' - Show current progress")
        print("  - 'quit' or 'exit' - Exit the REPL")
        print("  - 'help' - Show this help message")
        print("\n" + "=" * 60)
    
    def show_sections(self):
        """Display all feedback sections"""
        print("\n📋 Feedback Sections:")
        print("-" * 60)
        for section_id, section in FEEDBACK_SECTIONS.items():
            status = "✅" if section_id < self.current_section else "⏳"
            print(f"{status} Section {section_id}: {section.title}")
            print(f"   {section.description}")
        print("-" * 60)
    
    async def show_progress(self):
        """Show current progress"""
        if not self.chatbot_service:
            print("❌ Chatbot not initialized")
            return
        
        progress = await self.chatbot_service.get_session_progress(self.session_id)
        print("\n📊 Current Progress:")
        print("-" * 60)
        print(f"Current Section: {progress['current_section']}/{progress['total_sections']}")
        print(f"Completed Sections: {progress['completed_sections']}")
        print(f"Progress: {progress['progress_percentage']:.1f}%")
        print("-" * 60)
    
    async def process_input(self, user_input: str) -> bool:
        """
        Process user input and get chatbot response
        Returns: True to continue, False to exit
        """
        if not user_input.strip():
            return True
        
        # Handle commands
        command = user_input.lower().strip()
        if command in ['quit', 'exit', 'bye']:
            return False
        elif command == 'help':
            self.show_welcome()
            return True
        elif command == 'sections':
            self.show_sections()
            return True
        elif command == 'progress':
            await self.show_progress()
            return True
        
        # Process as regular message
        try:
            print("\n🤖 Bot: Processing...", end="\r")
            
            response = await self.chatbot_service.process_message(
                session_id=self.session_id,
                message=user_input,
                section_id=self.current_section
            )
            
            # Clear processing message
            print(" " * 40, end="\r")
            
            # Show bot response
            print(f"\n🤖 Bot: {response['response']}")
            
            # Update current section if moved to next
            self.current_section = response['current_section']
            
            # Show progress indicator
            if response['is_section_complete']:
                print(f"\n✅ Section {self.current_section - 1} completed!")
            
            if response['next_action'] == 'complete':
                print("\n🎉 All sections completed!")
                print("Generating final summary...")
                summary = await self.chatbot_service.generate_final_summary(self.session_id)
                print(f"\n📝 Final Summary:\n{summary['summary']}")
                return False
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            return True
    
    async def run(self):
        """Main REPL loop"""
        if not await self.initialize():
            return
        
        self.show_welcome()
        
        # Start the conversation
        print("\n🤖 Bot: Hi! I'm here to help you provide feedback for your nursing student.")
        print("Let's start with the first section: Clinical Knowledge Application.")
        print("Tell me about how the student applied their theoretical knowledge in clinical settings.")
        
        # Main loop
        while True:
            try:
                user_input = input("\n👤 You: ").strip()
                
                should_continue = await self.process_input(user_input)
                if not should_continue:
                    print("\n👋 Thank you for using the Clinical Feedback Helper!")
                    print("Session ID:", self.session_id)
                    break
                    
            except KeyboardInterrupt:
                print("\n\n👋 Interrupted. Goodbye!")
                break
            except EOFError:
                print("\n\n👋 Input ended. Goodbye!")
                break

async def main():
    """Entry point"""
    cli = SimpleCLI()
    await cli.run()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
        sys.exit(0)
