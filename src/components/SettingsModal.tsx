import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import XIcon from './icons/XIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ease-out`}
      onClick={onClose}
      style={{ animation: 'fadeIn 0.5s ease-out' }}
    >
      <div
        className={`relative rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all duration-500 ease-out transform my-auto ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold">Settings</h2>
            <button
              onClick={onClose}
              className={`rounded-full p-2 transition-all duration-200 hover:scale-110 ${
                isDarkMode ? 'bg-gray-700/50 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
              aria-label="Close"
            >
              <XIcon className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-semibold">
                {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </h3>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isDarkMode ? 'Currently using dark theme' : 'Currently using light theme'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              💡 Theme changes apply across the entire app
            </p>
          </div>
        </div>

        <div className={`p-4 sm:p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`w-full py-2 rounded-lg font-semibold transition-colors ${
              isDarkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
