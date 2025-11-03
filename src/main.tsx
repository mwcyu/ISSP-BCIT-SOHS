// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import LiveSessionDocumentPreview from "./components/LiveSessionDocumentPreview";
import SessionSummaryWriterTestButton from "./components/SessionSummaryWriterTestButton";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <LiveSessionDocumentPreview />
    <SessionSummaryWriterTestButton />
  </React.StrictMode>
);
