# LangGraph Modern Patterns (2025)

This document explains the modern LangGraph patterns used in `main_langgraph.py`, based on the official LangGraph documentation as of October 2025.

## Key Modern Patterns

### 1. **State Management with `add_messages` Reducer**

```python
from langgraph.graph.message import add_messages
from typing import Annotated

class FeedbackState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    # ... other fields
```

**Why this is modern:**

- The `add_messages` reducer automatically handles message appending
- No need to manually append to lists in nodes
- Prevents duplicate messages and handles updates by ID
- Official pattern from [LangGraph tutorials](https://langchain-ai.github.io/langgraph/tutorials/get-started/1-build-basic-chatbot/)

### 2. **Nodes Return Dicts (Not Modify State)**

**Old Pattern (deprecated):**

```python
def old_node(state: State) -> State:
    state["field"] = "value"  # Direct modification
    state["messages"].append(msg)  # Manual appending
    return state
```

**Modern Pattern (2025):**

```python
def modern_node(state: State) -> dict:
    """Node returns update dict"""
    return {
        "field": "value",  # LangGraph merges this
        "messages": [msg]  # add_messages handles appending
    }
```

**Benefits:**

- Cleaner, more functional approach
- State updates are explicit and clear
- Reducers (like `add_messages`) handle merging logic
- Easier to test and reason about

### 3. **Using START and END Constants**

**Old Pattern:**

```python
workflow.set_entry_point("first_node")
workflow.set_finish_point("last_node")
```

**Modern Pattern:**

```python
from langgraph.graph import START, END

workflow.add_edge(START, "first_node")
workflow.add_edge("last_node", END)
```

**Why:** More explicit, consistent with graph terminology, and follows official examples.

### 4. **TypedDict State Schema**

```python
from typing_extensions import TypedDict

class State(TypedDict):
    """Explicit schema for graph state"""
    field1: str
    field2: list[str]
    optional_field: Optional[int]
```

**Benefits:**

- Type safety and IDE autocomplete
- Clear documentation of state structure
- Runtime validation with proper tools

### 5. **MemorySaver for Checkpointing**

```python
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)
```

**Features:**

- Automatic conversation persistence
- Thread-based state management
- Enable pause/resume functionality

## Full Example

```python
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage

# 1. Define state with reducer
class State(TypedDict):
    messages: Annotated[list, add_messages]
    user_info: dict

# 2. Create nodes that return dicts
def chatbot(state: State) -> dict:
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

# 3. Build graph with START/END
workflow = StateGraph(State)
workflow.add_node("chatbot", chatbot)
workflow.add_edge(START, "chatbot")
workflow.add_edge("chatbot", END)

# 4. Compile with memory
from langgraph.checkpoint.memory import MemorySaver
app = workflow.compile(checkpointer=MemorySaver())

# 5. Invoke with proper config
config = {"configurable": {"thread_id": "thread_1"}}
result = app.invoke({"messages": [HumanMessage(content="Hi!")]}, config)
```

## Migration from Old Patterns

If you have code using old patterns:

1. **Replace state modification with dict returns**

   - Change `state["field"] = value` to `return {"field": value}`

2. **Use `add_messages` for message lists**

   - Remove manual `state["messages"].append(msg)`
   - Return `{"messages": [msg]}` instead

3. **Update entry/exit points**

   - Replace `set_entry_point()` with `add_edge(START, node)`
   - Replace `set_finish_point()` with `add_edge(node, END)`

4. **Add type annotations**
   - Convert plain dicts to TypedDict
   - Use `Annotated` for fields with reducers

## Resources

- [Official LangGraph Tutorials](https://langchain-ai.github.io/langgraph/tutorials/get-started/1-build-basic-chatbot/)
- [StateGraph Reference](https://langchain-ai.github.io/langgraph/reference/graphs/)
- [add_messages Documentation](https://langchain-ai.github.io/langgraph/reference/graphs/#langgraph.graph.message.add_messages)

## Installation

```bash
pip install -U langgraph langchain-openai langchain-core python-dotenv
```

Current version used: LangGraph 0.6.x (October 2025)
