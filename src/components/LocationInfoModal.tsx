import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from '../contexts/LocationContext';
import { reverseGeocodeWithGemini } from '../services/geminiService';
import XIcon from './icons/XIcon';

interface LocationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationInfoModal: React.FC<LocationInfoModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { location } = useLocation();
  const [locationName, setLocationName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && location) {
      setLoading(true);
      reverseGeocodeWithGemini(location.lat, location.lng).then((name) => {
        setLocationName(name);
        setLoading(false);
      });
    }
  }, [isOpen, location]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ease-out`}
      onClick={onClose}
      style={{ animation: 'fadeIn 0.5s ease-out' }}
    >
      <div
        className={`relative rounded-2xl shadow-2xl w-full max-w-md transition-all duration-500 ease-out transform overflow-y-auto max-h-[90vh] my-auto bg-gray-800/60 backdrop-blur-lg border border-white/30 text-white ${
          isDarkMode ? '' : 'bg-white/90 text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        <div className={`p-4 sm:p-6 border-b sticky top-0 backdrop-blur-sm ${isDarkMode ? 'border-gray-700 bg-gray-800/85' : 'border-gray-200 bg-white/85'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold">📍 Your Location</h2>
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

        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <p className={`text-sm sm:text-base font-semibold mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This is your location
            </p>
          </div>
        </div>

        <div className={`p-4 sm:p-6 border-t sticky bottom-0 backdrop-blur-sm ${isDarkMode ? 'border-gray-700 bg-gray-800/85' : 'border-gray-200 bg-white/85'}`}>
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

export default LocationInfoModal;
