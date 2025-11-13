# Standard Button Click Implementation

## Overview

This implementation ensures that when a user clicks on any of the BCCNM Standards buttons, the complete Standard object is sent as JSON to the n8n API.

## What Changed

### 1. **API Client** (`src/api/apiClient.tsx`)

- Added `Standard` type import
- Updated `sendMessageToAI` function to accept optional `standardData` parameter
- Modified payload to include the complete standard object when available

**Before:**

```typescript
body: JSON.stringify({ sessionId, chatInput });
```

**After:**

```typescript
const payload: any = {
  sessionId,
  chatInput: (userMessage ?? "") + promptType,
};

if (standardData) {
  payload.standard = {
    id: standardData.id,
    title: standardData.title,
    subtitle: standardData.subtitle,
    prompt: standardData.prompt,
  };
}

body: JSON.stringify(payload);
```

### 2. **Conversation Context** (`src/contexts/ConversationContext.tsx`)

- Updated `sendStandardPrompt` to accept a `Standard` object instead of strings
- Modified to extract standard number from the standard object
- Pass the complete standard object to the API

**Before:**

```typescript
sendStandardPrompt: (promptType: StandardType, promptLabel?: string) =>
  Promise<void>;
```

**After:**

```typescript
sendStandardPrompt: (standard: Standard) => Promise<void>;
```

### 3. **RightPanel Component** (`src/components/RightPanel.tsx`)

- Updated `onStandardClick` prop to accept `Standard` object
- Modified button click handler to pass the entire standard object

**Before:**

```tsx
onClick={() => onStandardClick?.(standard.prompt)}
```

**After:**

```tsx
onClick={() => onStandardClick?.(standard)}
```

### 4. **App Component** (`src/App.tsx`)

- Updated `handleStandardClick` to accept and pass `Standard` object
- Added `Standard` type import

## JSON Payload Structure

When a standard button is clicked, the n8n webhook receives this JSON structure:

```json
{
  "sessionId": "unique-session-id",
  "chatInput": "standard1",
  "standard": {
    "id": "1",
    "title": "Standard 1",
    "subtitle": "Professional Responsibility and Accountability",
    "prompt": "How can I provide effective feedback on professional responsibility and accountability for nursing learners? Include specific examples and assessment criteria."
  }
}
```

## Standard Objects

### Standard 1

```json
{
  "id": "1",
  "title": "Standard 1",
  "subtitle": "Professional Responsibility and Accountability",
  "prompt": "How can I provide effective feedback on professional responsibility and accountability for nursing learners? Include specific examples and assessment criteria."
}
```

### Standard 2

```json
{
  "id": "2",
  "title": "Standard 2",
  "subtitle": "Knowledge-Based Practice",
  "prompt": "What should I look for when evaluating a nursing learner's knowledge-based practice? How do I provide constructive feedback on clinical skills and evidence-based decision making?"
}
```

### Standard 3

```json
{
  "id": "3",
  "title": "Standard 3",
  "subtitle": "Client-Focused Provision of Service",
  "prompt": "How do I assess and provide feedback on client-focused care? What are key indicators of therapeutic communication and patient advocacy in nursing learners?"
}
```

### Standard 4

```json
{
  "id": "4",
  "title": "Standard 4",
  "subtitle": "Ethical Practice",
  "prompt": "What are the essential elements of ethical practice for nursing learners? How can I provide meaningful feedback on ethical decision-making and professional boundaries?"
}
```

## Testing

To test this implementation:

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Log into the application**

3. **Click on any of the 4 BCCNM Standards buttons**

4. **Check the network tab in browser DevTools:**

   - Look for the POST request to the n8n webhook
   - Inspect the request payload
   - You should see the complete standard object in the JSON

5. **Verify in n8n:**
   - The webhook should receive the `standard` object
   - You can access it in n8n workflow as `{{ $json.standard }}`
   - Individual fields: `{{ $json.standard.id }}`, `{{ $json.standard.title }}`, etc.

## n8n Workflow Integration

In your n8n workflow, you can now access the standard data:

```javascript
// Access the entire standard object
const standard = $input.item.json.standard;

// Access individual fields
const standardId = $input.item.json.standard.id;
const standardTitle = $input.item.json.standard.title;
const standardSubtitle = $input.item.json.standard.subtitle;
const standardPrompt = $input.item.json.standard.prompt;

// Check if standard data exists
if (standard) {
  // Use standard data in your workflow
  console.log(`Processing ${standardTitle}`);
}
```

## Benefits

1. **Complete Context**: n8n receives all information about which standard was clicked
2. **Type Safety**: Strong TypeScript typing throughout the flow
3. **Flexibility**: n8n workflow can make decisions based on standard ID, title, or any other field
4. **Maintainability**: Easy to add more standard metadata in the future
5. **Consistency**: Standardized data structure for all standard interactions

## Notes

- Regular user messages (non-standard clicks) will NOT include the `standard` field in the payload
- The `standard` field is only included when a standard button is clicked
- All existing functionality remains unchanged - only adds additional data to the payload
