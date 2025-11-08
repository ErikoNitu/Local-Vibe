import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from '../contexts/LocationContext';
import SettingsModal from './SettingsModal.tsx';
import PreferencesModal from './PreferencesModal.tsx';
import MyEventsModal from './MyEventsModal.tsx';
import LocationModal from './LocationModal.tsx';
import { AlignCenter } from 'lucide-react';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { location } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showMyEvents, setShowMyEvents] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <>
      <div ref={menuRef} className="relative" style={{
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center'
        

      }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 ${
            user
              ? isDarkMode 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-500 hover:bg-purple-600 text-white'
              : isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-400 hover:bg-gray-500 text-white'
          }`}
          title={user?.email || 'Menu'}
        >
          {user ? (
            <span className="text-lg sm:text-xl font-bold">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </span>
          ) : (
            <span className="text-lg sm:text-xl">☰</span>
          )}
        </button>

        {isOpen && (
          <div
            className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-50 transition-all duration-200 animate-in fade-in max-h-96 overflow-y-auto ${
              isDarkMode
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header - Only shown for logged in users */}
            {user && (
              <div
                className={`px-4 py-3 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.email}
                </p>
              </div>
            )}

            {/* Location Button - Available for all users */}
            <button
              onClick={() => {
                setShowLocation(true);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-200 border-b border-gray-700'
                  : 'hover:bg-gray-100 text-gray-900 border-b border-gray-200'
              }`}
            >
              📍 My Location ({location.lat.toFixed(2)}, {location.lng.toFixed(2)})
            </button>

            {/* My Events - Only for logged users */}
            {user && (
              <button
                onClick={() => {
                  setShowMyEvents(true);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                📋 My Events
              </button>
            )}

            {/* Preferences - Available for all users */}
            <button
              onClick={() => {
                setShowPreferences(true);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              ⚙️ Preferences
            </button>

            {/* Settings - Available for all users */}
            <button
              onClick={() => {
                setShowSettings(true);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              🎨 Settings
            </button>

            {/* Logout - Only for logged users */}
            {user && (
              <button
                onClick={handleLogout}
                className={`w-full text-left px-4 py-2 text-sm transition-colors border-t ${
                  isDarkMode
                    ? 'border-gray-700 hover:bg-gray-700 text-red-400'
                    : 'border-gray-200 hover:bg-gray-100 text-red-600'
                }`}
              >
                🚪 Logout
              </button>
            )}
          </div>
        )}
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <PreferencesModal isOpen={showPreferences} onClose={() => setShowPreferences(false)} />
      <MyEventsModal isOpen={showMyEvents} onClose={() => setShowMyEvents(false)} />
      <LocationModal isOpen={showLocation} onClose={() => setShowLocation(false)} />
    </>
  );
};

export default UserMenu;
