from graph import create_feedback_graph

# Quick test of the simplified architecture
print("\n" + "="*60)
print("Testing Simplified Clinical Feedback Architecture")
print("="*60 + "\n")

graph = create_feedback_graph()

# Test with sample feedback
test_state = {
    "current_standard": "Professional Responsibility and Accountability",
    "preceptor_feedback": """The student demonstrated excellent clinical judgment when she encountered a patient with deteriorating vital signs. She immediately alerted the charge nurse and followed protocol. However, I noticed she sometimes hesitates to ask questions during medication administration, which concerns me about patient safety.""",
    "context": [],
    "concerns": [],
    "suggestions": "",
    "synthesis": ""
}

print("🔄 Processing feedback through graph...")
result = graph.invoke(test_state)

print("\n" + "-"*60)
print("RESULTS:")
print("-"*60)
print(f"\n📊 Standard: {result['current_standard']}")
print(f"\n🔍 Identified Concerns ({len(result['concerns'])} found):")
for i, concern in enumerate(result['concerns'], 1):
    print(f"   {i}. {concern}")

print(f"\n📝 Retrieved {len(result['context'])} context documents")
print(f"\n💡 Suggestions length: {len(result['suggestions'])} characters")

print("\n" + "-"*60)
print("📋 COIN-FORMAT SYNTHESIS:")
print("-"*60)
print(f"\n{result['synthesis']}\n")

print("=" *60)
print("✅ Test completed successfully!")
print("="*60)
