# LangGraph Quick Reference (2025)

## Basic Setup

```python
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
```

## Define State

```python
class State(TypedDict):
    # Messages with automatic appending
    messages: Annotated[list, add_messages]

    # Regular fields (overwrite on update)
    counter: int
    data: dict

    # Optional fields
    optional_field: Optional[str]
```

## Create Nodes

```python
def my_node(state: State) -> dict:
    """Nodes return update dicts"""
    return {
        "messages": [AIMessage(content="Hello!")],
        "counter": state["counter"] + 1
    }
```

## Build Graph

```python
# 1. Create graph
workflow = StateGraph(State)

# 2. Add nodes
workflow.add_node("node1", my_node)
workflow.add_node("node2", another_node)

# 3. Add edges
workflow.add_edge(START, "node1")
workflow.add_edge("node1", "node2")
workflow.add_edge("node2", END)

# 4. Compile
app = workflow.compile(checkpointer=MemorySaver())
```

## Conditional Routing

```python
def router(state: State) -> str:
    """Return next node name"""
    if state["counter"] > 5:
        return "node_a"
    else:
        return "node_b"

workflow.add_conditional_edges(
    "source_node",
    router,
    {
        "node_a": "node_a",
        "node_b": "node_b"
    }
)
```

## Invoke Graph

```python
# Single invocation
result = app.invoke(
    {"messages": [HumanMessage(content="Hi!")]},
    config={"configurable": {"thread_id": "1"}}
)

# Streaming
for event in app.stream(input_data, config):
    print(event)
```

## Common Patterns

### Messages List

```python
class State(TypedDict):
    messages: Annotated[list, add_messages]

# In node:
return {"messages": [AIMessage(content="Hi")]}
# Automatically appends to existing messages
```

### Custom Reducer

```python
def my_reducer(existing: list, new: int) -> list:
    """Custom merge logic"""
    return existing + [new]

class State(TypedDict):
    items: Annotated[list, my_reducer]
```

### Multiple Updates

```python
def node(state: State) -> dict:
    return {
        "field1": "value1",
        "field2": "value2",
        "messages": [msg]
    }
```

## Best Practices

1. **Use `add_messages` for message lists**
2. **Return dicts from nodes (don't mutate state)**
3. **Use START/END constants**
4. **Define state with TypedDict**
5. **Use MemorySaver for persistence**
6. **Keep nodes focused (single responsibility)**
7. **Use routing functions for conditional logic**

## Quick Comparison

| Old Pattern                     | Modern Pattern               |
| ------------------------------- | ---------------------------- |
| `state["messages"].append(msg)` | `return {"messages": [msg]}` |
| `set_entry_point("node")`       | `add_edge(START, "node")`    |
| `state["field"] = value`        | `return {"field": value}`    |
| Plain dict state                | `TypedDict` state            |

## Debugging

```python
# Visualize graph
from IPython.display import Image
Image(app.get_graph().draw_mermaid_png())

# Get state at any point
state = app.get_state(config)
print(state.values)
```

## Common Errors

### ❌ Mutating state directly

```python
def node(state):
    state["field"] = "value"  # Don't do this!
    return state
```

### ✅ Return update dict

```python
def node(state):
    return {"field": "value"}  # Do this!
```

### ❌ Manual message appending

```python
state["messages"].append(msg)  # Don't do this!
```

### ✅ Use add_messages

```python
return {"messages": [msg]}  # Do this!
```

## Resources

- [Official Docs](https://langchain-ai.github.io/langgraph/)
- [Tutorials](https://langchain-ai.github.io/langgraph/tutorials/get-started/1-build-basic-chatbot/)
- [API Reference](https://langchain-ai.github.io/langgraph/reference/graphs/)
