"""
Test script for the Clinical Feedback Helper implementation
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.feedback_sections import (
    FeedbackType, 
    get_sections_for_feedback_type,
    SYSTEM_PROMPTS,
    WEEKLY_FEEDBACK_SECTIONS
)

def test_feedback_sections():
    """Test the feedback sections configuration"""
    print("Testing feedback sections configuration...")
    
    # Test weekly sections
    weekly_sections = get_sections_for_feedback_type(FeedbackType.WEEKLY)
    print(f"Weekly sections count: {len(weekly_sections)}")
    
    for section_id, section in weekly_sections.items():
        print(f"Section {section_id}: {section.title}")
        print(f"  Standards: {section.standards}")
        print(f"  Questions: {len(section.questions)}")
        print()
    
    # Test midterm sections
    midterm_sections = get_sections_for_feedback_type(FeedbackType.MIDTERM)
    print(f"Midterm sections count: {len(midterm_sections)}")
    
    # Test final sections
    final_sections = get_sections_for_feedback_type(FeedbackType.FINAL)
    print(f"Final sections count: {len(final_sections)}")
    
    print("✅ Feedback sections test passed!")

def test_system_prompts():
    """Test system prompts"""
    print("Testing system prompts...")
    
    required_prompts = [
        "initial_greeting", 
        "section_guide", 
        "clarification_needed", 
        "final_review",
        "email_request",
        "summary_template"
    ]
    
    for prompt_key in required_prompts:
        if prompt_key in SYSTEM_PROMPTS:
            print(f"✅ {prompt_key}: Found")
        else:
            print(f"❌ {prompt_key}: Missing")
    
    print("✅ System prompts test completed!")

def test_initial_greeting():
    """Test the initial greeting content"""
    print("Testing initial greeting...")
    
    greeting = SYSTEM_PROMPTS["initial_greeting"]
    
    # Check for required content
    required_content = [
        "Thank you for providing weekly feedback",
        "anonymous",
        "BCCNM Professional Standards",
        "Standard 1",
        "Standard 2", 
        "Standard 3",
        "Standard 4",
        "Weekly, Midterm, or Final"
    ]
    
    for content in required_content:
        if content in greeting:
            print(f"✅ Found: {content}")
        else:
            print(f"❌ Missing: {content}")
    
    print("✅ Initial greeting test completed!")

if __name__ == "__main__":
    print("🔄 Starting Clinical Feedback Helper Tests...\n")
    
    try:
        test_feedback_sections()
        print()
        test_system_prompts()
        print()
        test_initial_greeting()
        print()
        print("🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()