import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserPreferences {
  maxDistance: number; // in kilometers
  genrePreferences: string[]; // array of genre strings
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (prefs: UserPreferences) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: UserPreferences = {
  maxDistance: 50, // 50km default
  genrePreferences: ['Music', 'Art', 'Sports', 'Fair', 'Theater', 'Education'], // All genres by default
};

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (prefs: UserPreferences) => {
    setPreferences(prefs);
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};
