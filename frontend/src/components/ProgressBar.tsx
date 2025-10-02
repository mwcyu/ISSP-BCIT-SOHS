import { useState, useEffect } from 'react';
import { CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { FeedbackSection, SessionProgress } from '../types';
import { ChatbotService } from '../services/api';

interface ProgressBarProps {
  sections: FeedbackSection[];
  sessionId: string;
}

const ProgressBar = ({ sections, sessionId }: ProgressBarProps) => {
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progressData = await ChatbotService.getSessionProgress(sessionId);
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
        // Initialize default progress if API fails
        setProgress({
          session_id: sessionId,
          current_section: 1,
          completed_sections: [],
          progress_percentage: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchProgress();
      // Poll for progress updates every 10 seconds
      const interval = setInterval(fetchProgress, 10000);
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  const resetSession = async () => {
    try {
      await ChatbotService.resetSession(sessionId);
      setProgress({
        session_id: sessionId,
        current_section: 1,
        completed_sections: [],
        progress_percentage: 0
      });
      // Reload the page to start fresh
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset session:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Feedback Progress</h3>
        <div className="mt-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(progress?.progress_percentage || 0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress?.progress_percentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Section List */}
      <div className="p-4 space-y-2">
        {sections.map((section) => {
          const isCompleted = progress?.completed_sections.includes(section.id);
          const isCurrent = progress?.current_section === section.id;
          
          return (
            <div
              key={section.id}
              className={`p-3 rounded-lg border-2 transition-all ${
                isCompleted
                  ? 'bg-success-50 border-success-200'
                  : isCurrent
                  ? 'bg-primary-50 border-primary-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  ) : isCurrent ? (
                    <ChevronRight className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${
                    isCompleted
                      ? 'text-success-800'
                      : isCurrent
                      ? 'text-primary-800'
                      : 'text-gray-600'
                  }`}>
                    {section.id}. {section.title}
                  </h4>
                  <p className={`text-xs mt-1 ${
                    isCompleted
                      ? 'text-success-600'
                      : isCurrent
                      ? 'text-primary-600'
                      : 'text-gray-500'
                  }`}>
                    {section.description}
                  </p>
                  
                  {/* Key Areas for current section */}
                  {isCurrent && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-primary-700 mb-1">
                        Key Areas:
                      </p>
                      <ul className="text-xs text-primary-600 space-y-0.5">
                        {section.key_areas.slice(0, 3).map((area, index) => (
                          <li key={index} className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-primary-400 rounded-full"></span>
                            <span>{area}</span>
                          </li>
                        ))}
                        {section.key_areas.length > 3 && (
                          <li className="text-primary-500">
                            +{section.key_areas.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={resetSession}
          className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          🔄 Reset Session
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Session: {sessionId.slice(-8)}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;