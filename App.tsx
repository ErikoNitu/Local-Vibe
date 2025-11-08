import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Event, Filters, PriceFilter, DateFilter } from './types';
import { fetchMockEvents } from './services/geminiService';
import FilterBar from './components/FilterBar';
import EventCard from './components/EventCard';
import AddEventModal from './components/AddEventModal';
import PlusIcon from './components/icons/PlusIcon';
import GoogleMap from './components/GoogleMap';

// Custom hook to load the Google Maps API script
const useGoogleMapsApi = () => {
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
    const apiKey = "AIzaSyCBrNcJl1w8xPbjAn4balJB_DIIKx0-qdU";

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


const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    price: PriceFilter.All,
    date: DateFilter.All,
    search: '',
  });

  const { isLoaded: isMapsApiLoaded, error: mapError } = useGoogleMapsApi();

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingEvents(true);
      const fetchedEvents = await fetchMockEvents();
      setEvents(fetchedEvents);
      setIsLoadingEvents(false);
    };
    loadEvents();
  }, []);

  const handleFilterChange = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      const searchMatch = event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                          event.description.toLowerCase().includes(filters.search.toLowerCase());

      // Price filter
      const priceMatch = filters.price === PriceFilter.All ||
                         (filters.price === PriceFilter.Free && event.isFree) ||
                         (filters.price === PriceFilter.Paid && !event.isFree);

      // Date filter
      const now = new Date();
      const eventDate = new Date(event.date);
      let dateMatch = true;

      if (filters.date !== DateFilter.All) {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        
        switch (filters.date) {
            case DateFilter.ThisWeek:
                dateMatch = eventDate >= startOfWeek && eventDate <= endOfWeek;
                break;
            case DateFilter.NextWeek:
                const startOfNextWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
                const endOfNextWeek = new Date(endOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
                dateMatch = eventDate >= startOfNextWeek && eventDate <= endOfNextWeek;
                break;
            case DateFilter.ThisWeekend:
                const weekendStart = 5 - startOfWeek.getDay(); // Friday
                const weekendEnd = 6 - startOfWeek.getDay(); // Saturday
                const startOfWeekend = new Date(startOfWeek.getTime() + weekendStart * 24 * 60 * 60 * 1000);
                const endOfWeekend = new Date(startOfWeek.getTime() + weekendEnd * 24 * 60 * 60 * 1000);
                dateMatch = eventDate >= startOfWeekend && eventDate <= endOfWeekend;
                break;
        }
      }

      return searchMatch && priceMatch && dateMatch;
    });
  }, [events, filters]);
  
  const handleAddEvent = (newEventData: Omit<Event, 'id' | 'position' | 'imageUrl'>) => {
    const newEvent: Event = {
        ...newEventData,
        id: `user-${Date.now()}`,
        position: {
            // Random position around Bucharest center
            lat: 44.43 + (Math.random() - 0.5) * 0.1,
            lng: 26.10 + (Math.random() - 0.5) * 0.1,
        },
        imageUrl: `https://picsum.photos/seed/${newEventData.title.split(' ')[0] || 'event'}/400/300`,
    };
    setEvents(prev => [...prev, newEvent]);
  };
  
  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden relative">
      <FilterBar filters={filters} onFilterChange={handleFilterChange} eventCount={filteredEvents.length} />

      <main className="relative w-full h-full">
        {isLoadingEvents || !isMapsApiLoaded || mapError ? (
            <div className="flex items-center justify-center h-full bg-gray-800/50">
                <div className="text-center p-8 bg-gray-900 rounded-lg shadow-xl max-w-lg mx-4">
                    {mapError ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.22 3.006-1.742 3.006H4.42c-1.522 0-2.492-1.672-1.742-3.006l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          <h2 className="mt-4 text-2xl font-bold text-red-400">Eroare la încărcarea hărții</h2>
                          <div className="mt-2 text-gray-300 text-left px-4">
                              <p className="font-semibold mb-2">Cheia API pentru Google Maps este invalidă sau configurată greșit. Te rugăm să verifici următoarele în <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google Cloud Console</a>:</p>
                              <ul className="list-disc list-inside space-y-1 mt-2">
                                  <li><strong>Cheia API este corectă:</strong> Asigură-te că folosești cheia API corectă.</li>
                                  <li><strong>Serviciul "Maps JavaScript API" este activat:</strong> Accesează "APIs & Services" &rarr; "Library" și activează-l pentru proiectul tău.</li>
                                  <li><strong>Facturarea este activată:</strong> Google Maps Platform necesită un cont de facturare activat pentru proiect.</li>
                                  <li><strong>Fără restricții de blocare:</strong> Verifică dacă ai setat restricții (ex: referenți HTTP, adrese IP) care ar putea bloca cererea. Pentru testare, poți încerca să le elimini temporar.</li>
                              </ul>
                          </div>
                        </>
                    ) : (
                        <>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                            <p className="mt-4 text-lg">{!isMapsApiLoaded ? 'Se încarcă harta...' : 'Se încarcă evenimentele...'}</p>
                        </>
                    )}
                </div>
            </div>
        ) : (
          <GoogleMap
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onEventClick={handleEventClick}
          />
        )}
      </main>

      {selectedEvent && <EventCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 z-20 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transform hover:scale-105 transition-transform"
        aria-label="Add Event"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      <AddEventModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />

    </div>
  );
};

export default App;