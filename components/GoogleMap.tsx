import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Event } from '../types';
import MapPinIcon from './icons/MapPinIcon';

interface GoogleMapProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventClick: (event: Event) => void;
}

const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
];

const MarkerContent: React.FC<{ event: Event, isSelected: boolean }> = ({ event, isSelected }) => {
  const categoryColor = () => {
    switch (event.category.toLowerCase()) {
      case 'muzică': return 'text-purple-400';
      case 'artă': return 'text-pink-400';
      case 'sport': return 'text-blue-400';
      case 'târg': return 'text-yellow-400';
      case 'teatru': return 'text-red-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="relative flex flex-col items-center group">
        <div 
          className={`absolute bottom-full mb-2 w-max max-w-xs p-2 text-sm text-white bg-gray-800 bg-opacity-80 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${isSelected ? '!opacity-100' : ''}`}
        >
          {event.title}
        </div>
        <MapPinIcon className={`w-8 h-8 drop-shadow-lg transition-all duration-300 ${categoryColor()} ${isSelected ? 'scale-125 text-white' : 'group-hover:scale-110'}`} />
    </div>
  );
};


const GoogleMap: React.FC<GoogleMapProps> = ({ events, selectedEvent, onEventClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.marker.AdvancedMarkerElement }>({});

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 44.4268, lng: 26.1025 }, // Bucharest
        zoom: 13,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        mapId: 'LOCAL_VIBE_MAP_ID', // Add a mapId to enable Advanced Markers
      });
      setMap(newMap);
    }
  }, [mapRef, map]);

  useEffect(() => {
    if (map) {
      // Clear old markers that are not in the new events list
      Object.keys(markers).forEach(eventId => {
        if (!events.find(e => e.id === eventId)) {
          markers[eventId].map = null;
          delete markers[eventId];
        }
      });
      
      const newMarkers = { ...markers };

      events.forEach(event => {
        if (newMarkers[event.id]) {
            // Update existing marker's content if selection changed
            // Fix: Cast content to 'any' to access internal React root property to fix TypeScript error.
             const root = (newMarkers[event.id].content as any)._reactRootContainer;
             root.render(<MarkerContent event={event} isSelected={selectedEvent?.id === event.id} />);

        } else {
            // Create new marker
            const markerDiv = document.createElement('div');
            const root = ReactDOM.createRoot(markerDiv);
            root.render(<MarkerContent event={event} isSelected={selectedEvent?.id === event.id} />);
            (markerDiv as any)._reactRootContainer = root; // Store root for later updates

            const marker = new google.maps.marker.AdvancedMarkerElement({
              position: event.position,
              map,
              title: event.title,
              content: markerDiv,
            });
            
            marker.addListener('click', () => {
              onEventClick(event);
            });
            
            newMarkers[event.id] = marker;
        }
      });
      setMarkers(newMarkers);
    }
  }, [map, events, onEventClick, selectedEvent]);


  return <div ref={mapRef} className="w-full h-full" />;
};

export default GoogleMap;