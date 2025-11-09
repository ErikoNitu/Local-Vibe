import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { addEventToFirestore } from '../services/firestore';
import { Event } from '../../types';
import XIcon from './icons/XIcon';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<Event, 'id' | 'imageUrl'>) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Music');
  const [organizer, setOrganizer] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleLocationSearch = async (query: string) => {
    setLocation(query);
    
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (suggestion: any) => {
    setLocation(suggestion.display_name);
    setLat(parseFloat(suggestion.lat));
    setLng(parseFloat(suggestion.lon));
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotos(prev => [...prev, base64String]);
        setPhotoPreviews(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !organizer || !location || !phoneNumber || lat === null || lng === null) {
        alert('Please fill in all required fields, including location and phone number.');
        return;
    }

    if (!user) {
      alert('Please log in to add an event.');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventData = {
        title,
        description,
        date,
        isFree,
        category,
        organizer,
        phoneNumber,
        position: {
          lat,
          lng,
        },
        photos,
      };

      await addEventToFirestore(eventData, user.uid, user.displayName);
      
      alert('Event added successfully!');
    } catch (error) {
      console.error('Failed to add event:', error);
      alert('Error adding event. Please try again.');
      setIsSubmitting(false);
      return;
    }
    
    onAddEvent({
      title,
      description,
      date,
      isFree,
      category,
      organizer,
      phoneNumber,
      position: {
        lat,
        lng,
      },
      photos,
    });
    
    // Reset form and close
    setTitle('');
    setDescription('');
    setIsSubmitting(false);
    setDate('');
    setCategory('Music');
    setOrganizer('');
    setPhoneNumber('');
    setIsFree(false);
    setLocation('');
    setLat(null);
    setLng(null);
    setPhotos([]);
    setPhotoPreviews([]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ease-out"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-800/60 backdrop-blur-lg border border-white/30 text-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg transition-all duration-300 ease-out transform animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Add Your Event</h2>
            <button
              onClick={onClose}
              className="bg-gray-700/50 rounded-full p-2 text-white hover:bg-gray-700 transition-all duration-200 hover:scale-110 hover:rotate-90"
              aria-label="Close"
            >
              <XIcon className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 sm:p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base" required />
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 sm:p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base" rows={3} required></textarea>
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 sm:p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-400 text-sm sm:text-base" required />
            <input type="text" placeholder="Organizer Name" value={organizer} onChange={e => setOrganizer(e.target.value)} className="w-full p-2 sm:p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base" required />
            <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full p-2 sm:p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base" required />
            
            {/* Location Input with Autocomplete */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search location..." 
                value={location} 
                onChange={e => handleLocationSearch(e.target.value)}
                onFocus={() => {
                  if (location.length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                className="w-full p-2 sm:p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base" 
                required 
              />
              {lat && lng && (
                <div className="text-xs text-green-400 mt-1">
                  ✓ Location selected: {lat.toFixed(4)}, {lng.toFixed(4)}
                </div>
              )}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto border border-purple-500/30">
                  {locationSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(suggestion)}
                      className="w-full text-left p-2 sm:p-3 hover:bg-gray-600 text-xs sm:text-sm text-gray-200 border-b border-gray-600 last:border-b-0 transition-colors flex items-start gap-2"
                    >
                      <span className="mt-0.5">📍</span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{suggestion.display_name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showSuggestions && locationSuggestions.length === 0 && location.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 rounded-lg shadow-lg z-10 p-3 text-xs sm:text-sm text-gray-400 border border-gray-600">
                  No locations found. Try a different search.
                </div>
              )}
            </div>
            
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 sm:p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base" required>
                <option>Music</option>
                <option>Art</option>
                <option>Sports</option>
                <option>Fair</option>
                <option>Theater</option>
                <option>Education</option>
            </select>

            {/* Photo Upload Section */}
            <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-3 sm:p-4">
              <label className="block text-sm font-medium mb-2">Adaugă Fotografii</label>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-xs sm:text-sm text-gray-400 cursor-pointer"
              />
              {photoPreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {photoPreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={preview} 
                        alt={`Preview ${idx}`} 
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {photos.length > 0 && (
                <p className="text-xs text-green-400 mt-2">✓ {photos.length} foto(i) selectată(e)</p>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="h-4 sm:h-5 w-4 sm:w-5 rounded bg-gray-700 text-purple-500 focus:ring-purple-500" />
              <span className="text-sm sm:text-base">Eveniment Gratuit</span>
            </label>
            <button type="submit" disabled={isSubmitting || !lat || !lng} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base">
              Publică Eveniment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
