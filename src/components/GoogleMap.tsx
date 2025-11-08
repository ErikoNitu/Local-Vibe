import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Event } from '../../types';
import { useLocation } from '../contexts/LocationContext';
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

const MarkerContent: React.FC<{ event: Event, isSelected: boolean, distance: number }> = ({ event, isSelected, distance }) => {

  const getGenreIcon = () => {
    const category = event.category.toLowerCase();
    switch (category) {
      case 'muzică': return '🎵';
      case 'artă': return '🎨';
      case 'sport': return '⚽';
      case 'târg': return '🛍️';
      case 'teatru': return '🎭';
      case 'educație': return '📚';
      default: return '📍';
    }
  };

  const categoryColor = () => {
    switch (event.category.toLowerCase()) {
      case 'muzică': return 'bg-purple-500 border-purple-300';
      case 'artă': return 'bg-pink-500 border-pink-300';
      case 'sport': return 'bg-blue-500 border-blue-300';
      case 'târg': return 'bg-yellow-500 border-yellow-300';
      case 'teatru': return 'bg-red-500 border-red-300';
      case 'educație': return 'bg-green-500 border-green-300';
      default: return 'bg-indigo-500 border-indigo-300';
    }
  };

  return (
    <div className="relative flex flex-col items-center group">
        <div 
          className={`absolute bottom-full mb-3 w-max max-w-xs p-3 text-sm text-white bg-gray-900 rounded-lg shadow-xl border border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:scale-100 scale-95 ${isSelected ? '!opacity-100 !scale-100' : ''}`}
        >
          <div className="font-semibold">{event.title}</div>
          <div className="text-xs text-gray-300 mt-1">📍 {distance.toFixed(1)} km</div>
        </div>
        <div 
          className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg transition-all duration-300 transform ${categoryColor()} ${
            isSelected 
              ? 'scale-140 ring-4 ring-white shadow-xl' 
              : 'group-hover:scale-120 hover:shadow-xl'
          }`}
        >
          <span className="text-xl drop-shadow-md">
            {getGenreIcon()}
          </span>
        </div>
    </div>
  );
};


const GoogleMap: React.FC<GoogleMapProps> = ({ events, selectedEvent, onEventClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.marker.AdvancedMarkerElement }>({});
  const [userMarker, setUserMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const { location } = useLocation();

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

  // Add user location marker
  useEffect(() => {
    if (map && location) {
      // Remove old user marker if it exists
      if (userMarker) {
        userMarker.map = null;
      }

      // Create red user location marker
      const userMarkerDiv = document.createElement('div');
      userMarkerDiv.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background-color: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4), 0 0 0 3px rgba(239, 68, 68, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          📍
        </div>
      `;

      const newUserMarker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: location.address || `Your Location`,
        content: userMarkerDiv,
      });

      setUserMarker(newUserMarker);
    }
  }, [map, location]);

  useEffect(() => {
    if (map) {
      console.log('GoogleMap useEffect triggered');
      console.log('GoogleMap: Events array received:', events);
      console.log('GoogleMap: Number of events:', events.length);
      
      if (events.length === 0) {
        console.log('No events to display');
        setMarkers({});
        return;
      }
      
      // Clear old markers that are not in the new events list
      Object.keys(markers).forEach(eventId => {
        if (!events.find(e => e.id === eventId)) {
          console.log('Removing marker:', eventId);
          markers[eventId].map = null;
          delete markers[eventId];
        }
      });
      
      const newMarkers = { ...markers };

      events.forEach((event, index) => {
        console.log(`Processing marker ${index} for event:`, event.title, 'position:', event.position, 'distance:', event.distance);
        
        if (newMarkers[event.id]) {
            console.log(`Updating existing marker for: ${event.title}`);
            // Update existing marker's content if selection changed
            // Fix: Cast content to 'any' to access internal React root property to fix TypeScript error.
             const root = (newMarkers[event.id].content as any)._reactRootContainer;
             if (root) {
               root.render(<MarkerContent event={event} isSelected={selectedEvent?.id === event.id} distance={event.distance || 0} />);
             }

        } else {
            console.log(`Creating new marker for: ${event.title}`);
            // Create new marker
            const markerDiv = document.createElement('div');
            console.log('Created marker div');
            
            const root = ReactDOM.createRoot(markerDiv);
            console.log('Created React root');
            
            root.render(<MarkerContent event={event} isSelected={selectedEvent?.id === event.id} distance={event.distance || 0} />);
            console.log('Rendered MarkerContent');
            
            (markerDiv as any)._reactRootContainer = root; // Store root for later updates

            const marker = new google.maps.marker.AdvancedMarkerElement({
              position: event.position,
              map,
              title: event.title,
              content: markerDiv,
            });
            
            console.log(`✓ Marker created successfully for event: ${event.title}`);
            
            marker.addListener('click', () => {
              console.log('Marker clicked:', event.title);
              onEventClick(event);
            });
            
            newMarkers[event.id] = marker;
        }
      });
      
      console.log('GoogleMap: Total markers after processing:', Object.keys(newMarkers).length);
      setMarkers(newMarkers);
    }
  }, [map, events, onEventClick, selectedEvent]);


  return <div ref={mapRef} className="w-full h-full" />;
};

export default GoogleMap;