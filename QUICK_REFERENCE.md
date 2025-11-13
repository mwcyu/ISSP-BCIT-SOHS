# Quick Reference Guide - Restructured Codebase

## 🎯 Context Hooks Cheatsheet

### useAuth()

```tsx
import { useAuth } from "./contexts";

const {
  role, // "preceptor" | "admin" | "user" | null
  isAuthenticated, // boolean
  login, // (role: UserRole) => void
  logout, // () => void
} = useAuth();
```

**Common Use Cases:**

- Check if user is logged in: `if (isAuthenticated) { ... }`
- Get user role: `if (role === "admin") { ... }`
- Log user in: `login("preceptor")`
- Log user out: `logout()`

---

### useConversations()

```tsx
import { useConversations } from "./contexts";

const {
  conversations, // Conversation[]
  activeConversationId, // string | null
  activeConversation, // Conversation | undefined
  currentMessages, // Message[]
  inputValue, // string
  setInputValue, // (value: string) => void
  createNewConversation, // (title?, standard?) => string
  setActiveConversationId, // (id: string | null) => void
  sendMessage, // (message: string) => Promise<void>
  sendStandardPrompt, // (type, label?) => Promise<void>
  clearConversations, // () => void
} = useConversations();
```

**Common Use Cases:**

- Display messages: `currentMessages.map(msg => ...)`
- Send message: `sendMessage(inputValue)`
- Create new chat: `createNewConversation("My Chat")`
- Clear on logout: `clearConversations()`

---

### useUI()

```tsx
import { useUI } from "./contexts";

const {
  modals, // { progress: bool, guidelines: bool, ... }
  leftSidebarCollapsed, // boolean
  currentPage, // "main" | "admin"
  openModal, // (modal: keyof ModalState) => void
  closeModal, // (modal: keyof ModalState) => void
  toggleSidebar, // () => void
  setCurrentPage, // (page: "main" | "admin") => void
} = useUI();
```

**Common Use Cases:**

- Open modal: `openModal("settings")`
- Close modal: `closeModal("settings")`
- Check if open: `if (modals.settings) { ... }`
- Toggle sidebar: `toggleSidebar()`
- Navigate: `setCurrentPage("admin")`

---

## 📦 Type Definitions

### Core Types

```typescript
type UserRole = "preceptor" | "admin" | "user";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  messages: Message[];
  unread?: boolean;
  currentStandard: number | null;
}

interface Standard {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
}

interface ModalState {
  progress: boolean;
  guidelines: boolean;
  privacyPolicy: boolean;
  settings: boolean;
  documentPreview: boolean;
  faq: boolean;
}
```

---

## 🎨 Tailwind CSS Patterns

### Responsive Sizing

```tsx
// Text size
className = "text-sm sm:text-base md:text-lg lg:text-xl";

// Padding
className = "p-2 sm:p-4 md:p-6";

// Grid columns
className = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
```

### Interactive States

```tsx
// Hover effects
className = "hover:bg-blue-600 hover:scale-105";

// Focus states (accessibility)
className =
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

// Active states
className = "active:scale-95 active:bg-blue-700";
```

### Common Component Patterns

```tsx
// Card
className = "bg-white rounded-lg p-4 shadow-sm border border-gray-200";

// Button
className =
  "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors";

// Input
className =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500";
```

### Transitions

```tsx
// Smooth transitions
className = "transition-all duration-200";

// Transform on hover
className = "hover:scale-[1.02] transition-transform";

// Multiple properties
className = "transition-[background-color,transform] duration-300";
```

---

## 🔧 Common Tasks

### Task: Add a New Modal

**1. Add to ModalState type:**

```typescript
// src/types/index.ts
export interface ModalState {
  // ... existing modals
  myNewModal: boolean;
}
```

**2. Update UIContext:**

```typescript
// src/contexts/UIContext.tsx
const [modals, setModals] = useState<ModalState>({
  // ... existing
  myNewModal: false,
});
```

**3. Use in component:**

```tsx
function MyComponent() {
  const { modals, openModal, closeModal } = useUI();

  return (
    <>
      <button onClick={() => openModal("myNewModal")}>Open Modal</button>

      <MyNewModal
        isOpen={modals.myNewModal}
        onClose={() => closeModal("myNewModal")}
      />
    </>
  );
}
```

---

### Task: Add New Message Type

**1. Extend Message type:**

```typescript
// src/types/index.ts
export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot" | "system"; // ← Add "system"
  timestamp: Date;
  type?: "text" | "image" | "file"; // ← Add optional type
}
```

**2. Update message rendering:**

```tsx
// src/components/ChatArea.tsx
const MessageBubble = ({ message }: { message: Message }) => {
  if (message.sender === "system") {
    return <SystemMessage message={message} />;
  }
  // ... existing code
};
```

---

### Task: Add User Preference

**1. Add to UIContext:**

```typescript
// src/contexts/UIContext.tsx
const [preferences, setPreferences] = useState({
  theme: "light",
  fontSize: "medium",
});

const updatePreference = (key: string, value: any) => {
  setPreferences((prev) => ({ ...prev, [key]: value }));
};
```

**2. Use in component:**

```tsx
function SettingsPanel() {
  const { preferences, updatePreference } = useUI();

  return (
    <select
      value={preferences.theme}
      onChange={(e) => updatePreference("theme", e.target.value)}
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

---

## 🐛 Troubleshooting

### "useAuth must be used within AuthProvider"

**Problem:** Component using hook is not wrapped by provider.
**Solution:** Ensure `main.tsx` has all providers:

```tsx
<AuthProvider>
  <ConversationProvider>
    <UIProvider>
      <App />
    </UIProvider>
  </ConversationProvider>
</AuthProvider>
```

---

### Types not updating

**Problem:** TypeScript not recognizing new types.
**Solution:**

1. Save `src/types/index.ts`
2. Restart TypeScript server (VS Code: Cmd/Ctrl + Shift + P → "Restart TS Server")

---

### Context not updating

**Problem:** State change not triggering re-render.
**Solution:**

- Ensure you're calling the state setter function
- Check that component is using the hook
- Verify provider is at correct level in tree

---

## 📁 File Locations Quick Reference

```
Need to find...                    Look in...
─────────────────────────────────────────────────────────
Authentication logic               src/contexts/AuthContext.tsx
Chat/messaging logic               src/contexts/ConversationContext.tsx
UI state (modals, sidebar)         src/contexts/UIContext.tsx
Type definitions                   src/types/index.ts
API calls                          src/api/apiClient.tsx
Utility functions                  src/utils/
Main app component                 src/App.tsx
Entry point                        src/main.tsx
Chat display                       src/components/ChatArea.tsx
Main chat interface                src/components/RightPanel.tsx
Sidebar navigation                 src/components/PermanentSidebar.tsx
```

---

## 🎓 Best Practices

### DO ✅

- Use context hooks for global state
- Keep components small and focused
- Use TypeScript types consistently
- Follow Tailwind responsive patterns
- Test on mobile and desktop

### DON'T ❌

- Pass context directly as props
- Mix local and global state unnecessarily
- Ignore TypeScript errors
- Use inline styles instead of Tailwind
- Forget to handle loading states

---

## 📞 Need Help?

1. **Check ARCHITECTURE.md** for detailed explanations
2. **Review MIGRATION_SUMMARY.md** for what changed
3. **Look at existing components** for examples
4. **Read inline comments** in context files

---

**Happy coding! 🚀**
