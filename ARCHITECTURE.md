# Project Architecture

## Overview
The **Clinical Feedback Helper** is a React-based single-page application (SPA) built with Vite and TypeScript. It uses a **feature-based architecture** to organize code by domain rather than technical layer, making it scalable and maintainable.

## Tech Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (with custom design tokens)
- **State Management**: React Context API
- **Routing**: Conditional rendering (Single View with sub-views)
- **Backend/Services**: 
  - **Supabase**: Access Control and Session Management
  - **n8n**: AI Orchestration via Webhook
- **Utilities**: `jsPDF` for PDF generation

## Directory Structure

```
src/
├── assets/             # Static assets (images, logos)
├── components/         # Shared UI components (Modals, Layouts)
│   ├── layout/         # Structural components (Sidebar, SidebarItem)
│   └── modals/         # Global modals (Settings, Preview, Progress, etc.)
├── contexts/           # Global State Providers
│   ├── AuthContext     # User authentication state & Role management
│   ├── ConversationContext # Chat history, active session, and AI integration
│   └── UIContext       # Modal visibility and UI state
├── features/           # Feature-specific modules
│   ├── access/         # Login and Access Control (AccessPage)
│   ├── admin/          # Administrator Dashboard
│   └── chat/           # Main Chat Interface (RightPanel, ChatArea)
├── hooks/              # Custom React Hooks (useAppInitialization, useSessionSummary)
├── lib/                # Third-party library configurations (Supabase)
├── services/           # API clients (apiClient.tsx for n8n)
├── types/              # TypeScript type definitions
└── utils/              # Helper functions (exportToPdf, session management)
```

## Key Architectural Decisions

### 1. Feature-First Organization
Code is co-located by feature. For example, everything related to the chat interface (components, logic) is found in `src/features/chat`. This reduces context switching and makes the codebase easier to navigate.

### 2. Global State Management
The application uses React Context for global state, avoiding external libraries like Redux for simplicity.
- **`UIContext`**: Manages the state of all modals (Settings, Guidelines, etc.) and the mobile sidebar. This prevents prop drilling for UI controls.
- **`ConversationContext`**: Handles the chat messages, active conversation ID, and communication with the n8n webhook.
- **`AuthContext`**: Manages user roles (`preceptor`, `admin`, `user`) and session persistence.

### 3. AI Integration (n8n)
The application communicates with an AI agent via an **n8n webhook**.
- **Endpoint**: `POST` request to n8n cloud webhook.
- **Payload**: Includes `sessionId`, `chatInput`, and optional `standard` data.
- **Response**: JSON object containing the AI's reply.

### 4. Tailwind Design System
Styling is centralized in `index.css` using CSS variables for theme colors (`--bcit-blue`, `--bcit-gold`). Utility classes are used extensively, with custom abstractions like `.glass-panel` and `.input-field` for repeated patterns.

### 5. Mobile-First Responsiveness
The UI is designed to be fully responsive.
- **Sidebar**: Collapsible on desktop, off-canvas drawer on mobile.
- **Access Page**: Split-screen on desktop, stacked vertical layout on mobile.
- **Chat Input**: Floating design that adapts to screen width.

## Data Flow

1.  **Authentication**: 
    - User enters code in `AccessPage`.
    - Validated via `Supabase` (or local logic).
    - `AuthContext` updates user role and persists to `sessionStorage`.

2.  **Chat Interaction**: 
    - User types message in `RightPanel`.
    - `ConversationContext` calls `sendMessageToAI` in `apiClient`.
    - `apiClient` sends POST request to n8n webhook.
    - Response is received asynchronously and added to the conversation state.

3.  **PDF Export**:
    - User requests summary download.
    - `useSessionSummary` hook fetches data.
    - `exportToPdf` utility generates the PDF document client-side.