import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePreferences } from '../contexts/PreferencesContext';
import XIcon from './icons/XIcon';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_GENRES = ['Muzică', 'Artă', 'Sport', 'Târg', 'Teatru', 'Educație'];

const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { preferences, updatePreferences } = usePreferences();
  const [maxDistance, setMaxDistance] = useState(preferences.maxDistance);
  const [selectedGenres, setSelectedGenres] = useState(preferences.genrePreferences);

  if (!isOpen) return null;

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = () => {
    updatePreferences({
      maxDistance,
      genrePreferences: selectedGenres,
    });
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ease-out`}
      onClick={onClose}
      style={{ animation: 'fadeIn 0.5s ease-out' }}
    >
      <div
        className={`relative rounded-2xl shadow-2xl w-full max-w-md transition-all duration-500 ease-out transform overflow-y-auto max-h-[90vh] my-auto backdrop-blur-md border border-white/30 ${
          isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        <div className={`p-4 sm:p-6 border-b sticky top-0 backdrop-blur-sm ${isDarkMode ? 'border-gray-700 bg-gray-800/85' : 'border-gray-200 bg-white/85'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold">Preferences</h2>
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
          {/* Distance Preference */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-3">📍 Maximum Distance</h3>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="200"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: isDarkMode
                    ? `linear-gradient(to right, #9333ea 0%, #9333ea ${(maxDistance / 200) * 100}%, #374151 ${(maxDistance / 200) * 100}%, #374151 100%)`
                    : `linear-gradient(to right, #a855f7 0%, #a855f7 ${(maxDistance / 200) * 100}%, #e5e7eb ${(maxDistance / 200) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <span className={`text-sm sm:text-base font-semibold min-w-16 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {maxDistance} km
              </span>
            </div>
            <p className={`text-xs sm:text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Show events within {maxDistance} km from your location
            </p>
          </div>

          {/* Genre Preferences */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-3">🎭 Event Genres</h3>
            <div className="space-y-2">
              {AVAILABLE_GENRES.map((genre) => (
                <label
                  key={genre}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => handleToggleGenre(genre)}
                    className="w-4 h-4 rounded accent-purple-600"
                  />
                  <span className="text-sm sm:text-base">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              💡 Selected genres will be highlighted and prioritized on the map
            </p>
          </div>
        </div>

        <div className={`p-4 sm:p-6 border-t sticky bottom-0 backdrop-blur-sm ${isDarkMode ? 'border-gray-700 bg-gray-800/85' : 'border-gray-200 bg-white/85'}`}>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;
