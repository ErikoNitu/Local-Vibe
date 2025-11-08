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
  const [category, setCategory] = useState('Muzică');
  const [organizer, setOrganizer] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  };

  const handleSelectLocation = (suggestion: any) => {
    setLocation(suggestion.display_name);
    setLat(parseFloat(suggestion.lat));
    setLng(parseFloat(suggestion.lon));
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !organizer || !location || lat === null || lng === null) {
        alert('Te rog completează toate câmpurile obligatorii, inclusiv locația.');
        return;
    }

    if (!user) {
      alert('Te rog autentifică-te pentru a adăuga un eveniment.');
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
        position: {
          lat,
          lng,
        },
      };

      await addEventToFirestore(eventData, user.uid, user.displayName);
      
      alert('Evenimentul a fost adăugat cu succes!');
    } catch (error) {
      console.error('Failed to add event:', error);
      alert('Eroare la adăugarea evenimentului. Te rog încearcă din nou.');
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
      position: {
        lat,
        lng,
      },
    });
    
    // Reset form and close
    setTitle('');
    setDescription('');
    setIsSubmitting(false);
    setDate('');
    setCategory('Muzică');
    setOrganizer('');
    setIsFree(false);
    setLocation('');
    setLat(null);
    setLng(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-800 text-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Adaugă Evenimentul Tău</h2>
            <button
              onClick={onClose}
              className="bg-gray-700/50 rounded-full p-2 text-white hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Titlu Eveniment" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            <textarea placeholder="Descriere" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" rows={3} required></textarea>
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-400" required />
            <input type="text" placeholder="Nume Organizator" value={organizer} onChange={e => setOrganizer(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            
            {/* Location Input with Autocomplete */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cauta locație..." 
                value={location} 
                onChange={e => handleLocationSearch(e.target.value)}
                onFocus={() => location.length >= 2 && setShowSuggestions(true)}
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                required 
              />
              {lat && lng && (
                <div className="text-xs text-green-400 mt-1">
                  ✓ Locație selectată: {lat.toFixed(4)}, {lng.toFixed(4)}
                </div>
              )}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {locationSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(suggestion)}
                      className="w-full text-left p-3 hover:bg-gray-600 text-sm text-gray-200 border-b border-gray-600 last:border-b-0 transition-colors"
                    >
                      📍 {suggestion.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                <option>Muzică</option>
                <option>Artă</option>
                <option>Sport</option>
                <option>Târg</option>
                <option>Teatru</option>
                <option>Educație</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="h-5 w-5 rounded bg-gray-700 text-purple-500 focus:ring-purple-500" />
              <span>Eveniment Gratuit</span>
            </label>
            <button type="submit" disabled={isSubmitting || !lat || !lng} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors">
              Publică Eveniment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
