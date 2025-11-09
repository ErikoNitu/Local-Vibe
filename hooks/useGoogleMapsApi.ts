import { useState, useEffect } from 'react';

// Custom hook to load the Google Maps API script
export const useGoogleMapsApi = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If script is already loaded, do nothing
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Define the authentication error callback
    const handleAuthError = () => {
      const errorMessage = "Autentificarea Google Maps a eșuat. Acest lucru se întâmplă de obicei din cauza unei probleme cu cheia API.";
      console.error(errorMessage, "Consultați https://developers.google.com/maps/documentation/javascript/error-messages#invalid-key-map-error");
      setError(errorMessage);
    };

    // Make it globally available for the Maps script
    (window as any).handleAuthError = handleAuthError;

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      const errorMessage = "Cheia API pentru Google Maps lipsește. Harta nu poate fi afișată.";
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }
    
    // Add the auth_error_callback to the script URL
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=marker&auth_error_callback=handleAuthError`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      const errorMessage = "Scriptul Google Maps nu a putut fi încărcat. Verifică-ți conexiunea la internet.";
      console.error("Failed to load Google Maps script.");
      setError(errorMessage);
    };
    document.head.appendChild(script);

    return () => {
      // Clean up the script and the global callback
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete (window as any).handleAuthError;
    };
  }, []);

  return { isLoaded, error };
};