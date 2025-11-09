import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Event } from '../../types';
import { useLocation } from '../contexts/LocationContext';
import MapPinIcon from './icons/MapPinIcon';

interface GoogleMapProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventClick: (event: Event) => void;
  onLocationClick?: () => void;
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

  const getCategoryIcon = () => {
    const category = event.category ? event.category.toLowerCase().trim() : '';
    console.log('MarkerContent: event category =', event.category, 'lowercased =', category);
    
    if (category.includes('music') || category.includes('muzic')) return '🎵';
    if (category.includes('art') || category.includes('arta')) return '🎨';
    if (category.includes('sport')) return '⚽';
    if (category.includes('fair') || category.includes('târg') || category.includes('fare')) return '🛍️';
    if (category.includes('theater') || category.includes('theatre') || category.includes('teatru')) return '🎭';
    if (category.includes('education') || category.includes('edu') || category.includes('educatie')) return '📚';
    
    console.log('Returning default pin icon for category:', category);
    return '📍';
  };

  const categoryColor = () => {
    const category = event.category ? event.category.toLowerCase().trim() : '';
    
    if (category.includes('music') || category.includes('muzic')) 
      return { bg: 'bg-purple-600/70', border: 'border-purple-300', label: 'Music' };
    if (category.includes('art') || category.includes('arta')) 
      return { bg: 'bg-pink-600/70', border: 'border-pink-300', label: 'Art' };
    if (category.includes('sport')) 
      return { bg: 'bg-blue-600/70', border: 'border-blue-300', label: 'Sports' };
    if (category.includes('fair') || category.includes('targ')) 
      return { bg: 'bg-yellow-600/70', border: 'border-yellow-300', label: 'Fair' };
    if (category.includes('theater') || category.includes('theatre') || category.includes('teatru')) 
      return { bg: 'bg-red-600/70', border: 'border-red-300', label: 'Theater' };
    if (category.includes('education') || category.includes('educational') || category.includes('educatie')) 
      return { bg: 'bg-green-600/70', border: 'border-green-300', label: 'Education' };
    
    return { bg: 'bg-indigo-600/70', border: 'border-indigo-300', label: 'Event' };
  };

  const colors = categoryColor();

  return (
    <div className="relative flex flex-col items-center group">
        <div 
          className={`absolute bottom-full mb-2 sm:mb-3 w-max max-w-xs sm:max-w-sm p-2 sm:p-3 text-xs sm:text-sm text-white bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:scale-100 scale-95 ${isSelected ? '!opacity-100 !scale-100' : ''}`}
        >
          <div className="font-semibold line-clamp-2">{event.title}</div>
          <div className="text-xs text-gray-300 mt-1">📍 {distance.toFixed(1)} km</div>
        </div>
        <div 
          className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-white/40 backdrop-blur-md transition-all duration-300 transform ${colors.bg} ${colors.border} text-white cursor-pointer touch-manipulation ${
            isSelected 
              ? 'scale-135' 
              : 'group-hover:scale-125 active:scale-110'
          }`}
          style={{
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2)'
          }}
        >
          <span className="text-2xl drop-shadow-lg flex items-center justify-center leading-none">
            {getCategoryIcon()}
          </span>
        </div>
    </div>
  );
};


const GoogleMap: React.FC<GoogleMapProps> = ({ events, selectedEvent, onEventClick, onLocationClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.marker.AdvancedMarkerElement }>({});
  const [userMarker, setUserMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const { location } = useLocation();

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 44.4268, lng: 26.1025 }, // Bucharest
        zoom: 13,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: false,
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
      userMarkerDiv.style.zIndex = '-9999';
      userMarkerDiv.innerHTML = `
        <div style="
          width: 50px;
          height: 50px;
          background-color: rgba(239, 68, 68, 0.5);
          backdrop-filter: blur(20px);
          border: 3px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          z-index: -9999;
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

      // Add click listener to user marker
      userMarkerDiv.addEventListener('click', () => {
        if (onLocationClick) {
          onLocationClick();
        }
      });

      // Add hover effect to resize marker
      userMarkerDiv.addEventListener('mouseenter', () => {
        const innerDiv = userMarkerDiv.querySelector('div');
        if (innerDiv) {
          innerDiv.style.width = '70px';
          innerDiv.style.height = '70px';
          innerDiv.style.fontSize = '32px';
        }
      });

      userMarkerDiv.addEventListener('mouseleave', () => {
        const innerDiv = userMarkerDiv.querySelector('div');
        if (innerDiv) {
          innerDiv.style.width = '50px';
          innerDiv.style.height = '50px';
          innerDiv.style.fontSize = '24px';
        }
      });

      setUserMarker(newUserMarker);
    }
  }, [map, location, onLocationClick]);

  useEffect(() => {
    if (map) {
      console.log('GoogleMap useEffect triggered');
      console.log('GoogleMap: Events array received:', events);
      console.log('GoogleMap: Number of events:', events.length);
      
      if (events.length === 0) {
        console.log('No events to display');
        // Clear all markers
        Object.values(markers).forEach((marker: any) => {
          marker.map = null;
        });
        setMarkers({});
        return;
      }
      
      let newMarkers = { ...markers };

      // Clear old markers that are not in the new events list
      Object.keys(newMarkers).forEach(eventId => {
        if (!events.find(e => e.id === eventId)) {
          console.log('Removing marker:', eventId);
          (newMarkers[eventId] as any).map = null;
          delete newMarkers[eventId];
        }
      });

      events.forEach((event, index) => {
        // Calculate distance if not present
        const distance = event.distance !== undefined && event.distance !== null ? event.distance : 
          calculateDistance(location.lat, location.lng, event.position.lat, event.position.lng);
        
        console.log(`Processing marker ${index} for event:`, event.title, 'position:', event.position, 'distance:', distance);
        
        if (newMarkers[event.id]) {
            console.log(`Updating existing marker for: ${event.title}`);
            // Update existing marker's content if selection changed
            // Fix: Cast content to 'any' to access internal React root property to fix TypeScript error.
             const root = (newMarkers[event.id].content as any)._reactRootContainer;
             if (root) {
               root.render(<MarkerContent event={event} isSelected={selectedEvent?.id === event.id} distance={distance} />);
             }

        } else {
            console.log(`Creating new marker for: ${event.title}`);
            // Create new marker
            const markerDiv = document.createElement('div');
            console.log('Created marker div');
            
            const root = ReactDOM.createRoot(markerDiv);
            console.log('Created React root');
            
            root.render(<MarkerContent event={event} isSelected={selectedEvent?.id === event.id} distance={distance} />);
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
  }, [map, events, onEventClick, selectedEvent, calculateDistance, location.lat, location.lng]);


  return <div ref={mapRef} className="w-full h-full" />;
};

export default GoogleMap;