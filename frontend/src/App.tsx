import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatInterface from './components/ChatInterface.tsx';
import ProgressBar from './components/ProgressBar.tsx';
import { FeedbackSection } from './types';
import { ChatbotService } from './services/api';

function App() {
  const [feedbackSections, setFeedbackSections] = useState<FeedbackSection[]>([]);
  const [sessionId] = useState(() => ChatbotService.generateSessionId());

  useEffect(() => {
    const loadSections = async () => {
      try {
        const sections = await ChatbotService.getFeedbackSections();
        setFeedbackSections(sections);
      } catch (error) {
        console.error('Failed to load feedback sections:', error);
      }
    };

    loadSections();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🏥 Nursing Feedback AI Chatbot
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Comprehensive feedback collection for nursing students
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Session: {sessionId.slice(-8)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <ProgressBar 
                    sections={feedbackSections} 
                    sessionId={sessionId}
                  />
                </div>
                <div className="lg:col-span-3">
                  <ChatInterface 
                    sessionId={sessionId}
                    sections={feedbackSections}
                  />
                </div>
              </div>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;