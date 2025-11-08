import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
  isUsingDeviceLocation: boolean;
}

interface LocationContextType {
  location: UserLocation;
  updateLocation: (location: UserLocation) => void;
  requestDeviceLocation: () => Promise<void>;
  isLocationSet: boolean;
  setLocationSet: (value: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const DEFAULT_LOCATION: UserLocation = {
  lat: 44.4268,
  lng: 26.1025,
  address: 'Bucharest, Romania',
  isUsingDeviceLocation: false,
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserLocation>(() => {
    const saved = localStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });

  const [isLocationSet, setIsLocationSet] = useState<boolean>(() => {
    return localStorage.getItem('locationSetupComplete') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('userLocation', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem('locationSetupComplete', isLocationSet.toString());
  }, [isLocationSet]);

  const updateLocation = (newLocation: UserLocation) => {
    setLocation(newLocation);
  };

  const setLocationSetCallback = (value: boolean) => {
    setIsLocationSet(value);
  };

  const requestDeviceLocation = async () => {
    return new Promise<void>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
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
            const address = data.address?.city || data.address?.town || data.display_name || '';
            
            setLocation({
              lat: latitude,
              lng: longitude,
              address,
              isUsingDeviceLocation: true,
            });
          } catch (error) {
            console.error('Error getting address:', error);
            setLocation({
              lat: latitude,
              lng: longitude,
              isUsingDeviceLocation: true,
            });
          }
          
          resolve();
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        }
      );
    });
  };

  return (
    <LocationContext.Provider value={{ location, updateLocation, requestDeviceLocation, isLocationSet, setLocationSet: setLocationSetCallback }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
