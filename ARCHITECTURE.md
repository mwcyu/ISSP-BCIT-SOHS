# Project Architecture

## Overview
The **Clinical Feedback Helper** is a React-based single-page application (SPA) built with Vite and TypeScript. It uses a **feature-based architecture** to organize code by domain rather than technical layer, making it scalable and maintainable.

## Tech Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (with custom design tokens)
- **State Management**: React Context API
- **Routing**: Conditional rendering (Single View with sub-views)
- **Backend/Services**: Supabase (Access Control)

## Directory Structure

```
src/
├── assets/             # Static assets (images, logos)
├── components/         # Shared UI components (Modals, Layouts)
│   ├── layout/         # Structural components (Sidebar, Header)
│   └── modals/         # Global modals (Settings, Preview, etc.)
├── contexts/           # Global State Providers
│   ├── AuthContext     # User authentication state
│   ├── ConversationContext # Chat history and active session
│   └── UIContext       # Modal visibility and UI state
├── features/           # Feature-specific modules
│   ├── access/         # Login and Access Control (AccessPage)
│   ├── admin/          # Administrator Dashboard
│   └── chat/           # Main Chat Interface (RightPanel)
├── hooks/              # Custom React Hooks
├── lib/                # Third-party library configurations (Supabase, Firebase)
├── services/           # API clients and service layers
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Key Architectural Decisions

### 1. Feature-First Organization
Code is co-located by feature. For example, everything related to the chat interface (components, logic) is found in `src/features/chat`. This reduces context switching and makes the codebase easier to navigate.

### 2. Global State Management
The application uses React Context for global state, avoiding external libraries like Redux for simplicity.
- **`UIContext`**: Manages the state of all modals (Settings, Guidelines, etc.) and the mobile sidebar. This prevents prop drilling for UI controls.
- **`ConversationContext`**: Handles the chat messages, active conversation ID, and streaming logic.

### 3. Tailwind Design System
Styling is centralized in `index.css` using CSS variables for theme colors (`--bcit-blue`, `--bcit-gold`). Utility classes are used extensively, with custom abstractions like `.glass-panel` and `.input-field` for repeated patterns.

### 4. Mobile-First Responsiveness
The UI is designed to be fully responsive.
- **Sidebar**: Collapsible on desktop, off-canvas drawer on mobile.
- **Access Page**: Split-screen on desktop, stacked vertical layout on mobile.
- **Chat Input**: Floating design that adapts to screen width.

## Data Flow
1.  **Authentication**: User enters code in `AccessPage` -> Validated via `Supabase` -> `AuthContext` updates user role.
2.  **Chat**: User types message in `RightPanel` -> `ConversationContext` handles API call -> Response streams back to UI.
3.  **Navigation**: `Sidebar` updates current view state in `App.tsx` (or via Context) to switch between Chat, History, and Admin views.
