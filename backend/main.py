from graph import create_feedback_graph

STANDARDS = [
    "Professional Responsibility and Accountability",
    "Knowledge-Based Practice",
    "Client-Focused Service",
    "Ethical Practice",
]

def main():
    """
    Simplified main loop using the new linear workflow.
    """
    print("\n" + "="*60)
    print("Clinical Feedback Assistant")
    print("BCCNM Standards-Based Feedback Tool")
    print("="*60 + "\n")
    
    graph = create_feedback_graph()
    
    # Store all feedback summaries for final report
    all_summaries = []

    # Loop through each standard
    for std in STANDARDS:
        print(f"\n{'='*60}")
        print(f"Standard: {std}")
        print("="*60)
        
        # Get preceptor's feedback
        print(f"\nPlease share your observations about the student's performance")
        print(f"related to '{std}':")
        print("(Type your feedback and press Enter twice when done)\n")
        
        feedback_lines = []
        while True:
            line = input()
            if line == "" and feedback_lines:
                break
            if line != "":
                feedback_lines.append(line)
        
        preceptor_feedback = "\n".join(feedback_lines)
        
        if not preceptor_feedback.strip():
            print("\n⚠️  No feedback provided. Skipping this standard.")
            continue
        
        # Process through graph
        print("\n🔄 Processing feedback...")
        result = graph.invoke({
            "current_standard": std,
            "preceptor_feedback": preceptor_feedback,
            "context": [],
            "concerns": [],
            "suggestions": "",
            "synthesis": ""
        })
        
        # Display results
        print("\n" + "-"*60)
        print("📋 ANALYSIS RESULTS")
        print("-"*60)
        
        if result["concerns"]:
            print("\n🔍 Identified Concerns/Areas for Improvement:")
            for i, concern in enumerate(result["concerns"], 1):
                print(f"   {i}. {concern}")
        else:
            print("\n✅ No specific concerns identified - positive feedback!")
        
        print("\n" + "-"*60)
        print("📝 COIN-FORMAT SUMMARY")
        print("-"*60)
        print(f"\n{result['synthesis']}\n")
        
        # Confirm with preceptor
        confirm = input("Does this summary look correct? (y/n): ").strip().lower()
        
        if confirm == "y":
            all_summaries.append({
                "standard": std,
                "summary": result["synthesis"]
            })
            print("✅ Summary confirmed and saved.")
        else:
            print("❌ Summary not saved. Please provide feedback again for this standard.")
            continue

    # Generate final report
    if all_summaries:
        print("\n" + "="*60)
        print("FINAL FEEDBACK REPORT")
        print("="*60 + "\n")
        
        for item in all_summaries:
            print(f"\n{'─'*60}")
            print(f"📌 {item['standard']}")
            print("─"*60)
            print(f"{item['summary']}\n")
        
        print("\n" + "="*60)
        print("Thank you for using the Clinical Feedback Assistant!")
        print("="*60)
    else:
        print("\n⚠️  No feedback summaries were confirmed.")

if __name__ == "__main__":
    main()