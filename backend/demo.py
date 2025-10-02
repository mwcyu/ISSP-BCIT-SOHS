#!/usr/bin/env python3
"""
Demo script for the Clinical Feedback Helper Bot
This shows how to interact with the bot programmatically
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any

class BotDemo:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session_id = None
    
    async def demo_conversation(self):
        """Run a complete demo conversation with the bot"""
        print("🏥 Clinical Feedback Helper Bot Demo")
        print("=" * 50)
        
        async with aiohttp.ClientSession() as session:
            # 1. Start session
            print("\n1. Starting new session...")
            response = await self._make_request(session, "POST", "/api/start")
            if not response:
                return
            
            self.session_id = response.get("session_id")
            print(f"✅ Session started: {self.session_id}")
            print(f"🤖 Bot: {response.get('response', '')[:100]}...")
            
            # 2. Select feedback type
            print("\n2. Selecting feedback type...")
            response = await self._chat(session, "Weekly")
            if not response:
                return
            print(f"🤖 Bot: {response.get('response', '')[:100]}...")
            
            # 3. Provide feedback for first section
            print("\n3. Providing feedback for Clinical Skills section...")
            feedback = """
            The student demonstrated excellent medication administration skills this week. 
            She consistently followed the 5 rights of medication administration, 
            double-checked all dosages with the medication administration record, 
            and verified patient identity using two identifiers before each administration. 
            She explained procedures clearly to patients, showing good communication skills. 
            However, she needs to work on IV insertion technique as she had some difficulty 
            finding veins on her first attempts and required guidance from nursing staff. 
            I recommend she practice more with the IV simulation equipment.
            """
            
            response = await self._chat(session, feedback.strip())
            if not response:
                return
            print(f"🤖 Bot: {response.get('response', '')[:100]}...")
            
            # 4. Continue with more sections (abbreviated for demo)
            sections_feedback = [
                "The student shows good critical thinking when assessing patient conditions. She asks appropriate questions and considers multiple factors when making clinical decisions.",
                "Communication skills are developing well. The student speaks clearly with patients and families, and documents thoroughly in patient charts.",
                "The student demonstrates professional behavior, arrives on time, and follows dress code policies. She takes initiative in learning opportunities.",
                "Organization skills are good overall. The student manages her time well during shifts and prioritizes patient care tasks appropriately.",
                "The student shows initiative by asking questions and seeking out learning opportunities. She engages well with the healthcare team.",
                "Safety practices are excellent. The student always follows proper protocols and reports any concerns immediately to nursing staff.",
                "Overall, this has been a strong week for the student. She continues to develop her clinical skills and professional demeanor."
            ]
            
            for i, feedback in enumerate(sections_feedback, 4):
                print(f"\n{i}. Providing feedback for section {i-2}...")
                response = await self._chat(session, feedback)
                if not response:
                    return
                print(f"🤖 Bot: {response.get('response', '')[:100]}...")
                
                if response.get("next_action") == "complete":
                    print("✅ All sections completed!")
                    break
            
            # 5. Review phase
            print("\n9. Review phase...")
            response = await self._chat(session, "Yes, I'm satisfied with my responses")
            if not response:
                return
            print(f"🤖 Bot: {response.get('response', '')[:100]}...")
            
            # 6. Email collection
            print("\n10. Providing email...")
            response = await self._chat(session, "preceptor@hospital.com")
            if not response:
                return
            print(f"🤖 Bot: {response.get('response', '')[:100]}...")
            
            # 7. Get final summary
            print("\n11. Getting final summary...")
            summary_response = await self._make_request(session, "POST", "/api/summary", {
                "session_id": self.session_id
            })
            if summary_response:
                summary = summary_response.get("summary", "")
                print(f"📄 Final Summary Generated ({len(summary)} characters)")
                print("\nFirst 300 characters of summary:")
                print("-" * 40)
                print(summary[:300] + "...")
                print("-" * 40)
        
        print("\n🎉 Demo completed successfully!")
        print("\nThis demo showed:")
        print("• Starting a session")
        print("• Selecting feedback type (Weekly)")
        print("• Providing detailed feedback for 8 sections")
        print("• Review and confirmation")
        print("• Email collection")
        print("• Final summary generation")
    
    async def _chat(self, session: aiohttp.ClientSession, message: str) -> Dict[Any, Any]:
        """Send a chat message"""
        return await self._make_request(session, "POST", "/api/chat", {
            "session_id": self.session_id,
            "message": message
        })
    
    async def _make_request(self, session: aiohttp.ClientSession, method: str, 
                          endpoint: str, data: Dict = None) -> Dict[Any, Any]:
        """Make an HTTP request to the API"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method == "POST":
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        print(f"❌ Request failed: {response.status}")
                        error_text = await response.text()
                        print(f"Error: {error_text}")
                        return None
            elif method == "GET":
                async with session.get(url) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        print(f"❌ Request failed: {response.status}")
                        return None
        except Exception as e:
            print(f"❌ Connection error: {str(e)}")
            return None

async def check_server():
    """Check if the server is running"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:8000/") as response:
                return response.status == 200
    except:
        return False

async def main():
    """Main demo function"""
    print("Checking if server is running...")
    
    if not await check_server():
        print("❌ Server is not running!")
        print("Please start the server first:")
        print("   python main.py")
        print("\nThen run this demo again:")
        print("   python demo.py")
        return
    
    print("✅ Server is running!")
    
    demo = BotDemo()
    await demo.demo_conversation()

if __name__ == "__main__":
    asyncio.run(main())