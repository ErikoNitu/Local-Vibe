import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, Filters, PriceFilter, DateFilter } from './types';
import { fetchEventsFromFirestore } from './src/services/firestore';
import { useGoogleMapsApi } from './hooks/useGoogleMapsApi';
import { useAuth } from './src/auth/useAuth';
import { logout } from './src/auth/authActions';
import FilterBar from './src/components/FilterBar';
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
  const { messages, handleSendMessage } = useEventChatbot(events, setChatbotSuggestedEvents, setIsChatbotFilterActive);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingEvents(true);
      try {
        console.log('Loading events from Firestore...');
        // Only fetch events from Firebase database
        const firestoreEvents = await fetchEventsFromFirestore();
        console.log(`Loaded ${firestoreEvents.length} events`);
        setEvents(firestoreEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        // Fallback to empty array if Firestore fetch fails
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    loadEvents();
  }, []);

  const handleFilterChange = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Clear chatbot suggestions when user manually filters
    setChatbotSuggestedEvents([]);
    setIsChatbotFilterActive(false);
  }, []);

  const filteredEvents = useMemo(() => {
    // If chatbot has suggested events, show only those
    if (chatbotSuggestedEvents.length > 0) {
      return chatbotSuggestedEvents;
    }

    // Otherwise, apply regular filters
    return events.filter(event => {
      const searchMatch = event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                          event.description.toLowerCase().includes(filters.search.toLowerCase());

      const priceMatch = filters.price === PriceFilter.All ||
                         (filters.price === PriceFilter.Free && event.isFree) ||
                         (filters.price === PriceFilter.Paid && !event.isFree);

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

      return searchMatch && priceMatch && dateMatch;
    });
  }, [events, filters]);
  
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
      <FilterBar filters={filters} onFilterChange={handleFilterChange} eventCount={filteredEvents.length} user={user} onLogout={handleLogout} onRefresh={handleRefreshEvents} />

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
        className="fixed bottom-6 left-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-30"
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