// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import LiveSessionDocumentPreview from "./components/LiveSessionDocumentPreview";


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <LiveSessionDocumentPreview />

  </React.StrictMode>
);
