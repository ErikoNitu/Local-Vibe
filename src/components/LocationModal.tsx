import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from '../contexts/LocationContext';
import XIcon from './icons/XIcon';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { location, updateLocation, requestDeviceLocation } = useLocation();
  const [manualAddress, setManualAddress] = useState(location.address || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!isOpen) return null;

  const handleUseDeviceLocation = async () => {
    setLoading(true);
    setError('');
    try {
      await requestDeviceLocation();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to get device location');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async (query: string) => {
    setManualAddress(query);
    
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  };

  const handleSelectLocation = async (suggestion: any) => {
    const address = suggestion.display_name;
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    setManualAddress(address);
    updateLocation({ lat, lng, address, isUsingDeviceLocation: false });
    setShowSuggestions(false);
    setSuggestions([]);
  };  const handleManualSubmit = async () => {
    if (!manualAddress.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the first suggestion if available, otherwise geocode the address
      if (suggestions.length > 0) {
        handleSelectLocation(suggestions[0]);
      } else {
        // Geocode the manual address entry
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddress)}&format=json`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const results = await response.json();

        if (results.length === 0) {
          setError('Address not found. Please try another location.');
          setLoading(false);
          return;
        }

        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        updateLocation({ lat, lng, address: manualAddress, isUsingDeviceLocation: false });
        onClose();
      }
    } catch (err) {
      setError('Failed to geocode address. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-xl sm:text-2xl font-bold">📍 My Location</h2>
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
          {/* Current Location Display */}
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Current Location
            </p>
            <p className="text-sm sm:text-base mt-1">
              {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
            </p>
            {location.isUsingDeviceLocation && (
              <p className="text-xs text-green-400 mt-1">✓ Using device location</p>
            )}
          </div>

          {/* Device Location Button */}
          <button
            onClick={handleUseDeviceLocation}
            disabled={loading}
            className={`w-full py-2 px-3 rounded-lg font-semibold transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white'
            }`}
          >
            {loading ? '⏳ Getting Location...' : '📱 Use My Device Location'}
          </button>

          {error && (
            <div className={`p-2 rounded text-sm ${isDarkMode ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
              {error}
            </div>
          )}

          {/* OR Divider */}
          <div className="relative">
            <div className={`absolute inset-0 flex items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
              <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}>
                OR
              </span>
            </div>
          </div>

          {/* Manual Location Input */}
          <div className="space-y-3">
            <div className="relative">
              <label className={`block text-xs sm:text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Search by Address
              </label>
              <input
                type="text"
                placeholder="Search location..."
                value={manualAddress}
                onChange={(e) => handleLocationSearch(e.target.value)}
                onFocus={() => manualAddress.length >= 2 && setShowSuggestions(true)}
                className={`w-full p-2 rounded-lg text-sm ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                }`}>
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(suggestion)}
                      className={`w-full text-left p-2 text-xs sm:text-sm border-b last:border-b-0 transition-colors ${
                        isDarkMode
                          ? 'hover:bg-gray-600 text-gray-200 border-gray-600'
                          : 'hover:bg-gray-100 text-gray-900 border-gray-200'
                      }`}
                    >
                      📍 {suggestion.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
              onClick={handleManualSubmit}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
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

export default LocationModal;
