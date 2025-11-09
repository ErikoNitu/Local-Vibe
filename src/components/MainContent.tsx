import React from 'react';
import { Event } from '../../types';
import GoogleMap from './GoogleMap';
import MapsLoadingState from './MapsLoadingState';

interface MainContentProps {
  isLoadingEvents: boolean;
  isMapsApiLoaded: boolean;
  mapError: string | null;
  filteredEvents: Event[];
  selectedEvent: Event | null;
  onEventClick: (event: Event) => void;
  onLocationClick?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  isLoadingEvents,
  isMapsApiLoaded,
  mapError,
  filteredEvents,
  selectedEvent,
  onEventClick,
  onLocationClick,
}) => {
  return (
    <main className="relative w-full h-full">
      {(!isMapsApiLoaded || mapError) ? (
        <MapsLoadingState isMapsApiLoaded={isMapsApiLoaded} mapError={mapError} />
      ) : (
        <GoogleMap
          events={filteredEvents}
          selectedEvent={selectedEvent}
          onEventClick={onEventClick}
          onLocationClick={onLocationClick}
        />
      )}
    </main>
  );
};

export default MainContent;