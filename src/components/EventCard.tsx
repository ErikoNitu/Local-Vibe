import React, { useState, useEffect } from 'react';
import { Event } from '../../types';
import { useLocation } from '../contexts/LocationContext';
import XIcon from './icons/XIcon';
import { reverseGeocode } from '../services/geocoding';

interface EventCardProps {
  event: Event;
  onClose: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClose }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { location } = useLocation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate distance from user to event
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

  const distance = calculateDistance(location.lat, location.lng, event.position.lat, event.position.lng);

  useEffect(() => {
    const fetchLocationAddress = async () => {
      setLoadingLocation(true);
      try {
        const address = await reverseGeocode(event.position.lat, event.position.lng);
        setLocationAddress(address);
      } catch (error) {
        console.error('Error fetching location address:', error);
        setLocationAddress(null);
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchLocationAddress();
  }, [event.position.lat, event.position.lng]);

  const getDefaultPhoto = (): string => {
    return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop';
  };

  const hasPhotos = event.photos && event.photos.length > 0;
  const currentPhoto = hasPhotos ? event.photos[currentPhotoIndex] : null;

  const nextPhoto = () => {
    if (hasPhotos && event.photos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % event.photos.length);
    }
  };

  const prevPhoto = () => {
    if (hasPhotos && event.photos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + event.photos.length) % event.photos.length);
    }
  };

  const openGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps?q=${event.position.lat},${event.position.lng}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-2 sm:p-4 transition-all duration-500 ease-out"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.5s ease-out' }}
    >
      <div 
        className="relative bg-gray-800/40 backdrop-blur-md border border-white/20 text-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-500 ease-out transform my-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        {/* Image Gallery Section */}
        <div className="relative w-full h-60 sm:h-80 md:h-96 bg-gray-900 overflow-hidden">
          {hasPhotos ? (
            <>
              <img 
                src={currentPhoto} 
                alt={`Event photo ${currentPhotoIndex + 1}`} 
                className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = getDefaultPhoto();
                }}
              />
              {event.photos && event.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full p-2 text-white transition-all duration-200 hover:scale-110 border border-white/30 shadow-md"
                    aria-label="Previous photo"
                  >
                    ← 
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full p-2 text-white transition-all duration-200 hover:scale-110 border border-white/30 shadow-md"
                    aria-label="Next photo"
                  >
                    →
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-white/20">
                    {currentPhotoIndex + 1} / {event.photos.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <img 
              src={getDefaultPhoto()} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
            />
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gray-900/60 backdrop-blur-md hover:bg-gray-900/80 rounded-full p-2 text-white transition-all duration-200 hover:scale-110 z-10 border border-white/30 shadow-md"
          aria-label="Close"
        >
          <XIcon className="w-5 sm:w-6 h-5 sm:h-6" />
        </button>

        <div className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-xs sm:text-sm bg-purple-600/50 text-purple-200 px-3 py-1 rounded-full">{event.category}</span>
                <span className="text-xs sm:text-sm bg-blue-600/50 text-blue-200 px-3 py-1 rounded-full">📍 {distance.toFixed(1)} km</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">{event.title}</h2>
              <p className="text-gray-400 text-sm sm:text-base">de {event.organizer}</p>
            </div>
            <div className={`text-sm sm:text-lg font-semibold px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap ${event.isFree ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
              {event.isFree ? 'Gratuit' : 'Cu Plată'}
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 border-t border-gray-700 pt-3 sm:pt-4">
             <p className="font-semibold text-purple-300 text-sm sm:text-base">{formatDate(event.date)}</p>
             {event.phoneNumber && (
               <p className="text-gray-400 text-xs sm:text-sm mt-2">
                 📞 {event.phoneNumber}
               </p>
             )}
             {locationAddress && (
               <button
                 onClick={openGoogleMaps}
                 className="text-gray-400 text-xs sm:text-sm mt-2 hover:text-purple-400 hover:underline transition-colors cursor-pointer flex items-center gap-1"
                 title="Click to open in Google Maps"
               >
                 📍 {locationAddress}
               </button>
             )}
             {loadingLocation && (
               <p className="text-gray-500 text-xs sm:text-sm mt-2">Loading location...</p>
             )}
             <p className="mt-2 text-gray-300 text-sm sm:text-base">{event.description}</p>
          </div>

          {/* Photo Thumbnails Gallery */}
          {hasPhotos && event.photos && event.photos.length > 1 && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">Photo Gallery</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {event.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      currentPhotoIndex === idx 
                        ? 'border-purple-500 ring-2 ring-purple-400' 
                        : 'border-gray-600 hover:border-purple-400'
                    }`}
                  >
                    <img 
                      src={photo} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getDefaultPhoto();
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
