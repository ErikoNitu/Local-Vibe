import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from '../contexts/LocationContext';
import SettingsModal from './SettingsModal.tsx';
import PreferencesModal from './PreferencesModal.tsx';
import MyEventsModal from './MyEventsModal.tsx';
import LocationModal from './LocationModal.tsx';
import { AlignCenter } from 'lucide-react';

interface UserMenuProps {
  onEventUpdated?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onEventUpdated }) => {
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
          className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl transition-all duration-300 backdrop-blur-md border border-white/40 shadow-lg hover:shadow-xl ${
            user
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white' 
              : 'bg-white/30 hover:bg-white/40 text-white'
          }`}
          title={user?.email || 'Menu'}
        >
          {user ? (
            <span className="text-sm sm:text-base md:text-lg font-bold">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </span>
          ) : (
            <span className="text-base sm:text-lg">☰</span>
          )}
        </button>

        {isOpen && (
          <div
            className={`absolute right-0 mt-2 w-56 sm:w-64 rounded-xl shadow-2xl z-50 transition-all duration-200 animate-in fade-in max-h-96 overflow-y-auto backdrop-blur-lg border border-white/30 ${
              isDarkMode
                ? 'bg-gray-800/60'
                : 'bg-white/60'
            }`}
          >
            {/* Header - Only shown for logged in users */}
            {user && (
              <div
                className={`px-4 py-3 border-b border-white/10 backdrop-blur-md`}
              >
                <p className={`text-xs sm:text-sm font-semibold text-white truncate`}>
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
              className={`w-full text-left px-4 py-3 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 hover:bg-white/10 text-gray-100 border-b border-white/10 backdrop-blur-md`}
            >
              📍 My Location
            </button>

            {/* My Events - Only for logged users */}
            {user && (
              <button
                onClick={() => {
                  setShowMyEvents(true);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 hover:bg-white/10 text-gray-100 border-b border-white/10 backdrop-blur-md`}
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
              className={`w-full text-left px-4 py-3 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 hover:bg-white/10 text-gray-100 border-b border-white/10 backdrop-blur-md`}
            >
              ⚙️ Preferences
            </button>

            {/* Settings - Available for all users */}
            <button
              onClick={() => {
                setShowSettings(true);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 hover:bg-white/10 text-gray-100 border-b border-white/10 backdrop-blur-md`}
            >
              🎨 Settings
            </button>

            {/* Logout - Only for logged users */}
            {user && (
              <button
                onClick={handleLogout}
                className={`w-full text-left px-4 py-3 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 border-t border-white/10 hover:bg-red-500/20 text-red-400 backdrop-blur-md`}
              >
                🚪 Logout
              </button>
            )}
          </div>
        )}
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <PreferencesModal isOpen={showPreferences} onClose={() => setShowPreferences(false)} />
      <MyEventsModal isOpen={showMyEvents} onClose={() => setShowMyEvents(false)} onEventUpdated={onEventUpdated} />
      <LocationModal isOpen={showLocation} onClose={() => setShowLocation(false)} />
    </>
  );
};

export default UserMenu;
