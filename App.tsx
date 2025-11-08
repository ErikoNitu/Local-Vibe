import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, Filters, PriceFilter, DateFilter } from './types';
import { fetchMockEvents } from './src/services/geminiService';
import { useGoogleMapsApi } from './hooks/useGoogleMapsApi';
import { useAuth } from './src/auth/useAuth';
import { logout } from './src/auth/authActions';
import FilterBar from './src/components/FilterBar';
import EventCard from './src/components/EventCard';
import AddEventModal from './src/components/AddEventModal';
import MainContent from './src/components/MainContent';
import AddEventButton from './src/components/AddEventButton';

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

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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
  
  const handleAddEvent = (newEventData: Omit<Event, 'id' | 'position' | 'imageUrl'>) => {
    const newEvent: Event = {
        ...newEventData,
        id: `user-${Date.now()}`,
        position: {
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
    </div>
  );
};

export default App;