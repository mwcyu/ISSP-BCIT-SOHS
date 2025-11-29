// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { AuthProvider, ConversationProvider, UIProvider } from "./contexts";
import LiveSessionDocumentPreview from "./features/chat/components/LiveSessionDocumentPreview";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ConversationProvider>
        <UIProvider>
          <App />
          <LiveSessionDocumentPreview />
        </UIProvider>
      </ConversationProvider>
    </AuthProvider>
  </React.StrictMode>
);
