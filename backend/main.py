from graph import create_feedback_graph

def main():
    g = create_feedback_graph()
    state = {}

    current_node = "intro_node"

    while current_node:
        node_output = g.run(state)
        print("\nBOT:", node_output["message"])

        current_node = node_output.get("next")
        state.update(node_output)

        if current_node == "feedback_node":
            user_input = input("\nPreceptor: ")
            state["preceptor_feedback"] = user_input
        elif current_node == "suggestion_node":
            state["suggestion"] = node_output["message"]

    print("\nSession complete. Thank you for using the Clinical Feedback Helper!")

if __name__ == "__main__":
    main()
