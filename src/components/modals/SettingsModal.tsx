import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [textSize, setTextSize] = useState('Medium');
  const [darkMode, setDarkMode] = useState(false);

  if (!isOpen) return null;

  const textSizeOptions = ['Small', 'Medium', 'Large'];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-bcit-blue">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Text Size Setting */}
            <div className="space-y-3">
              <h3 className="font-bold text-bcit-blue">Text Size</h3>
              <div className="space-y-2">
                {textSizeOptions.map((size) => (
                  <label key={size} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="textSize"
                      value={size}
                      checked={textSize === size}
                      onChange={(e) => setTextSize(e.target.value)}
                      className="w-4 h-4 text-bcit-blue focus:ring-bcit-blue border-gray-300"
                    />
                    <span className="text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dark Mode Setting */}
            <div className="space-y-3">
              <h3 className="font-bold text-bcit-blue">Appearance</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-bcit-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bcit-blue"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-bcit-blue text-white rounded-lg hover:bg-bcit-dark transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}