import React, { useState, useRef, useEffect } from 'react';
import { Event } from '../../types';
import XIcon from './icons/XIcon';

interface EventsListSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  onEventClick?: (event: Event) => void;
}

const EventsListSidePanel: React.FC<EventsListSidePanelProps> = ({
  isOpen,
  onClose,
  events,
  onEventClick,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [infiniteEvents, setInfiniteEvents] = useState<Event[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Create infinite list by repeating events multiple times
  // This updates whenever filtered events change
  useEffect(() => {
    if (events.length > 0) {
      // Repeat events 5 times to create a large scrollable list
      const repeated = [...events, ...events, ...events, ...events, ...events];
      setInfiniteEvents(repeated);
      // Reset scroll position when filters change
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    } else {
      // If no events match the filters, clear the infinite list
      setInfiniteEvents([]);
    }
  }, [events]);

  // Handle infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop + container.clientHeight;
    const scrollHeight = container.scrollHeight;

    // When near the bottom, add more events to create seamless infinite scroll
    if (scrollHeight - scrollPosition < 500) {
      setInfiniteEvents((prev) => [...prev, ...events]);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEventId(event.id);
    onEventClick?.(event);
    onClose(); // Close the panel when event is clicked
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Side Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-96 bg-gray-800/60 backdrop-blur-lg border-r border-white/30 shadow-2xl z-50 transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800/60 backdrop-blur-md border-b border-white/30 p-2 sm:p-4 sm:p-6 flex justify-between items-center gap-2">
          <h2 className="text-sm sm:text-lg sm:text-xl font-bold text-white">📋 All Events</h2>
          <button
            onClick={onClose}
            className="bg-gray-700/50 rounded-full p-1 sm:p-2 text-white hover:bg-gray-700 transition-all duration-200 hover:scale-110 hover:rotate-90 flex-shrink-0"
            aria-label="Close"
          >
            <XIcon className="w-4 sm:w-5 sm:w-6 h-4 sm:h-5 sm:h-6" />
          </button>
        </div>

        {/* Events List */}
        <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
          {infiniteEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-xs sm:text-sm">No events available</p>
            </div>
          ) : (
            infiniteEvents.map((event, index) => (
              <button
                key={`${event.id}-${index}`}
                onClick={() => handleEventClick(event)}
                className={`w-full text-left p-2 sm:p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                  selectedEventId === event.id
                    ? 'bg-purple-600/40 border-purple-400/60 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/70'
                }`}
              >
                {/* Title */}
                <h3 className="font-semibold text-white text-xs sm:text-sm line-clamp-2">
                  {event.title}
                </h3>

                {/* Organizer and Category */}
                <div className="flex gap-1 sm:gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded-full text-[10px] sm:text-xs">
                    {event.category}
                  </span>
                  <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded-full text-[10px] sm:text-xs truncate">
                    {event.organizer}
                  </span>
                </div>

                {/* Date and Time */}
                <p className="text-[10px] sm:text-xs text-purple-300 mt-1 sm:mt-2 font-medium">
                  🕐 {formatDate(event.date)}
                </p>

                {/* Phone Number */}
                {event.phoneNumber && (
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                    📞 {event.phoneNumber}
                  </p>
                )}

                {/* Price */}
                <div className="mt-1 sm:mt-2 flex items-center gap-2">
                  <span
                    className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded ${
                      event.isFree
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {event.isFree ? 'Gratuit' : 'Cu Plată'}
                  </span>
                </div>

                {/* Description Preview */}
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2 line-clamp-2">
                  {event.description}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default EventsListSidePanel;
