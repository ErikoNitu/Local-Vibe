import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, Filters, PriceFilter, DateFilter } from './types';
import { fetchEventsFromFirestore } from './src/services/firestore';
import { useGoogleMapsApi } from './hooks/useGoogleMapsApi';
import { useAuth } from './src/auth/useAuth';
import { logout } from './src/auth/authActions';
import { usePreferences } from './src/contexts/PreferencesContext';
import { useLocation } from './src/contexts/LocationContext';
import FilterBar from './src/components/FilterBar';
import LocationSetup from './src/components/LocationSetup';
import EventCard from './src/components/EventCard';
import AddEventModal from './src/components/AddEventModal';
import MainContent from './src/components/MainContent';
import AddEventButton from './src/components/AddEventButton';
import ChatbotSidePanel from './src/components/ChatbotSidePanel';
import { useEventChatbot } from './src/hooks/useEventChatbot';

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [chatbotSuggestedEvents, setChatbotSuggestedEvents] = useState<Event[]>([]);
  const [isChatbotFilterActive, setIsChatbotFilterActive] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    price: PriceFilter.All,
    date: DateFilter.All,
    search: '',
  });

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLoaded: isMapsApiLoaded, error: mapError } = useGoogleMapsApi();
  const { preferences } = usePreferences();
  const { location, isLocationSet, setLocationSet } = useLocation();
  
  const handleSetSearchFilter = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);
  
  const { messages, handleSendMessage } = useEventChatbot(events, setChatbotSuggestedEvents, setIsChatbotFilterActive, handleSetSearchFilter);

  useEffect(() => {
    const loadEvents = async () => {
      // Only load events if location is set
      if (!isLocationSet) {
        setIsLoadingEvents(false);
        return;
      }

      setIsLoadingEvents(true);
      try {
        console.log('Loading events from Firestore...');
        console.log('User location:', location);
        // Only fetch events from Firebase database
        const firestoreEvents = await fetchEventsFromFirestore();
        console.log(`Loaded ${firestoreEvents.length} raw events from Firestore:`, firestoreEvents);
        
        // Calculate distance for each event
        const eventsWithDistance = firestoreEvents.map(event => {
          if (!event.position || typeof event.position.lat !== 'number' || typeof event.position.lng !== 'number') {
            console.warn(`Event ${event.id} has invalid position:`, event.position);
          }
          const dist = calculateDistance(location.lat, location.lng, event.position.lat, event.position.lng);
          console.log(`Event "${event.title}" at (${event.position.lat}, ${event.position.lng}) - Distance: ${dist.toFixed(2)}km`);
          return {
            ...event,
            distance: dist
          };
        });
        
        console.log(`Events with distances calculated:`, eventsWithDistance);
        setEvents(eventsWithDistance);
      } catch (error) {
        console.error('Error loading events:', error);
        // Fallback to empty array if Firestore fetch fails
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    loadEvents();
  }, [isLocationSet, location, calculateDistance]);

  const handleFilterChange = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    // If user clears the search (and we're in chatbot mode), clear the filter
    if (key === 'search' && value === '' && isChatbotFilterActive) {
      setChatbotSuggestedEvents([]);
      setIsChatbotFilterActive(false);
    }
    
    setFilters(prev => ({ ...prev, [key]: value }));
  }, [isChatbotFilterActive]);

  const filteredEvents = useMemo(() => {
    // If chatbot has suggested events, show only those
    if (chatbotSuggestedEvents.length > 0) {
      return chatbotSuggestedEvents;
    }

    // Otherwise, apply regular filters
    console.log('[Filter] Starting filter with preferences:', preferences);
    const result = events.filter(event => {
      const searchMatch = event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                          event.description.toLowerCase().includes(filters.search.toLowerCase());

      const priceMatch = filters.price === PriceFilter.All ||
                         (filters.price === PriceFilter.Free && event.isFree) ||
                         (filters.price === PriceFilter.Paid && !event.isFree);

      // Check genre preferences (if preferences exist)
      const genreMatch = preferences.genrePreferences.length === 0 || preferences.genrePreferences.includes(event.category);

      // Check distance preferences (use pre-calculated distance on event)
      const eventDistance = event.distance ?? calculateDistance(location.lat, location.lng, event.position.lat, event.position.lng);
      const distanceMatch = eventDistance <= (preferences.maxDistance || 200);

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
                const weekendStart = 5 - startOfWeek.getDay();
                const weekendEnd = 6 - startOfWeek.getDay();
                const startOfWeekend = new Date(startOfWeek.getTime() + weekendStart * 24 * 60 * 60 * 1000);
                const endOfWeekend = new Date(startOfWeek.getTime() + weekendEnd * 24 * 60 * 60 * 1000);
                dateMatch = eventDate >= startOfWeekend && eventDate <= endOfWeekend;
                break;
        }
      }

      const shouldInclude = searchMatch && priceMatch && dateMatch && genreMatch && distanceMatch;
      console.log(`Event "${event.title}": search=${searchMatch}, price=${priceMatch}, date=${dateMatch}, genre=${genreMatch} (${event.category}), distance=${distanceMatch} (${eventDistance.toFixed(2)}km / ${preferences.maxDistance}km), included=${shouldInclude}`);
      return shouldInclude;
    });
    
    console.log(`Filtered events: ${result.length} out of ${events.length}`);
    return result;
  }, [events, filters, preferences, calculateDistance, location]);
  
  // Debug logging after filteredEvents is defined
  useEffect(() => {
    console.log('[App] State changed - isLocationSet:', isLocationSet, 'location:', location, 'raw events:', events.length, 'filteredEvents:', filteredEvents.length);
  }, [isLocationSet, location, events, filteredEvents]);
  
  const handleClearChatbotFilter = useCallback(() => {
    setChatbotSuggestedEvents([]);
    setIsChatbotFilterActive(false);
  }, []);
  
  const handleAddEvent = (newEventData: Omit<Event, 'id' | 'imageUrl'>) => {
    const newEvent: Event = {
        ...newEventData,
        id: `user-${Date.now()}`,
        imageUrl: `https://picsum.photos/seed/${newEventData.title.split(' ')[0] || 'event'}/400/300`,
    };
    setEvents(prev => [...prev, newEvent]);
  };
  
  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
  }, []);

  const handleRefreshEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      console.log('Refreshing events from Firestore...');
      const firestoreEvents = await fetchEventsFromFirestore();
      console.log(`Refreshed: Loaded ${firestoreEvents.length} events`);
      setEvents(firestoreEvents);
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden relative">
      {/* Show location setup if user hasn't set location yet */}
      {!isLocationSet && (
        <LocationSetup onComplete={() => setLocationSet(true)} />
      )}

      <FilterBar filters={filters} onFilterChange={handleFilterChange} eventCount={filteredEvents.length} user={user} onLogout={handleLogout} />

      <MainContent
        isLoadingEvents={isLoadingEvents}
        isMapsApiLoaded={isMapsApiLoaded}
        mapError={mapError}
        filteredEvents={filteredEvents}
        selectedEvent={selectedEvent}
        onEventClick={handleEventClick}
      />

      {selectedEvent && <EventCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      <AddEventButton onClick={() => setIsAddModalOpen(true)} />

      <AddEventModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />

      {/* Chatbot Button */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 sm:p-4 shadow-lg transition-all duration-200 ease-out hover:scale-125 hover:shadow-xl z-30 text-lg sm:text-xl transform active:scale-95"
        aria-label="Open chat"
      >
        💬
      </button>

      {/* Chatbot Panel */}
      <ChatbotSidePanel
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        onEventClick={handleEventClick}
        isChatbotFilterActive={isChatbotFilterActive}
        onClearFilter={handleClearChatbotFilter}
      />
    </div>
  );
};

export default App;