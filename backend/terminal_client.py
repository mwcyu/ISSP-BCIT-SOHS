#!/usr/bin/env python3
"""
Simple terminal client for the Clinical Feedback Helper Bot
Run this to chat with the bot directly in your terminal!
"""

import asyncio
import aiohttp
import json
import sys
from typing import Optional
from colorama import init, Fore, Back, Style
import os

# Initialize colorama for Windows compatibility
init(autoreset=True)

class TerminalClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session_id: Optional[str] = None
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def print_bot_message(self, message: str):
        """Print bot message with nice formatting"""
        print(f"\n{Fore.CYAN}🤖 Clinical Feedback Helper:{Style.RESET_ALL}")
        print(f"{Fore.WHITE}{message}{Style.RESET_ALL}")
        print()
    
    def print_user_message(self, message: str):
        """Print user message with nice formatting"""
        print(f"{Fore.GREEN}👤 You: {Fore.YELLOW}{message}{Style.RESET_ALL}")
    
    def print_error(self, message: str):
        """Print error message"""
        print(f"{Fore.RED}❌ Error: {message}{Style.RESET_ALL}")
    
    def print_success(self, message: str):
        """Print success message"""
        print(f"{Fore.GREEN}✅ {message}{Style.RESET_ALL}")
    
    def print_header(self):
        """Print welcome header"""
        print(f"{Fore.MAGENTA}{Style.BRIGHT}")
        print("=" * 80)
        print("🏥 CLINICAL FEEDBACK HELPER - TERMINAL CLIENT")
        print("=" * 80)
        print(f"{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Welcome! This bot helps nursing preceptors provide comprehensive feedback.{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Type 'quit', 'exit', or 'bye' to end the session.{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Type 'help' for commands.{Style.RESET_ALL}")
        print()
    
    async def start_session(self) -> bool:
        """Start a new session with the bot"""
        try:
            async with self.session.post(f"{self.base_url}/api/start") as response:
                if response.status == 200:
                    data = await response.json()
                    self.session_id = data.get("session_id")
                    self.print_bot_message(data.get("response", "Session started!"))
                    return True
                else:
                    error_text = await response.text()
                    self.print_error(f"Failed to start session: {error_text}")
                    return False
        except Exception as e:
            self.print_error(f"Connection error: {str(e)}")
            return False
    
    async def send_message(self, message: str) -> bool:
        """Send a message to the bot"""
        if not self.session_id:
            self.print_error("No active session. Please restart the client.")
            return False
        
        try:
            payload = {
                "session_id": self.session_id,
                "message": message
            }
            
            async with self.session.post(f"{self.base_url}/api/chat", json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    self.print_bot_message(data.get("response", "No response"))
                    
                    # Show progress if available
                    if "current_section" in data:
                        section_num = data["current_section"]
                        if section_num > 0:
                            print(f"{Fore.BLUE}📊 Progress: Section {section_num}/8{Style.RESET_ALL}")
                    
                    # Check if complete
                    if data.get("next_action") == "complete":
                        self.print_success("Feedback collection complete! 🎉")
                        return False  # End conversation
                    
                    return True
                else:
                    error_text = await response.text()
                    self.print_error(f"Message failed: {error_text}")
                    return True
        except Exception as e:
            self.print_error(f"Connection error: {str(e)}")
            return True
    
    async def get_progress(self):
        """Get current session progress"""
        if not self.session_id:
            self.print_error("No active session.")
            return
        
        try:
            async with self.session.get(f"{self.base_url}/api/session/{self.session_id}/progress") as response:
                if response.status == 200:
                    data = await response.json()
                    progress = data.get("progress", {})
                    print(f"{Fore.BLUE}📊 Current Progress:{Style.RESET_ALL}")
                    print(f"   Current Section: {progress.get('current_section', 'Unknown')}")
                    print(f"   Completed Sections: {len(progress.get('completed_sections', []))}")
                    print(f"   Feedback Type: {progress.get('feedback_type', 'Not selected')}")
        except Exception as e:
            self.print_error(f"Could not get progress: {str(e)}")
    
    def show_help(self):
        """Show available commands"""
        print(f"{Fore.YELLOW}Available Commands:{Style.RESET_ALL}")
        print(f"  {Fore.WHITE}help{Style.RESET_ALL}     - Show this help message")
        print(f"  {Fore.WHITE}progress{Style.RESET_ALL} - Show current progress")
        print(f"  {Fore.WHITE}quit{Style.RESET_ALL}     - Exit the client")
        print(f"  {Fore.WHITE}exit{Style.RESET_ALL}     - Exit the client")
        print(f"  {Fore.WHITE}bye{Style.RESET_ALL}      - Exit the client")
        print()
    
    async def run(self):
        """Main conversation loop"""
        self.print_header()
        
        # Check if server is running
        try:
            async with self.session.get(f"{self.base_url}/") as response:
                pass
        except:
            self.print_error("Cannot connect to server!")
            self.print_error("Make sure the backend is running with: python main.py")
            return
        
        # Start session
        if not await self.start_session():
            return
        
        # Main conversation loop
        while True:
            try:
                # Get user input
                user_input = input(f"{Fore.GREEN}👤 You: {Style.RESET_ALL}").strip()
                
                if not user_input:
                    continue
                
                # Check for commands
                if user_input.lower() in ['quit', 'exit', 'bye']:
                    self.print_success("Goodbye! Thank you for using the Clinical Feedback Helper.")
                    break
                elif user_input.lower() == 'help':
                    self.show_help()
                    continue
                elif user_input.lower() == 'progress':
                    await self.get_progress()
                    continue
                
                # Send message to bot
                should_continue = await self.send_message(user_input)
                if not should_continue:
                    break
                    
            except KeyboardInterrupt:
                print(f"\n{Fore.YELLOW}Interrupted by user. Goodbye!{Style.RESET_ALL}")
                break
            except EOFError:
                print(f"\n{Fore.YELLOW}Input ended. Goodbye!{Style.RESET_ALL}")
                break

async def main():
    """Main entry point"""
    # Check if server URL is provided
    server_url = os.getenv("SERVER_URL", "http://localhost:8000")
    
    async with TerminalClient(server_url) as client:
        await client.run()

if __name__ == "__main__":
    # Install required packages if not available
    try:
        import colorama
        import aiohttp
    except ImportError:
        print("Installing required packages...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "colorama", "aiohttp"])
        import colorama
        import aiohttp
    
    # Run the client
    asyncio.run(main())