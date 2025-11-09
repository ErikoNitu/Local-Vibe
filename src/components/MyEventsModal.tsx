import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../services/firestore';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Event } from '../../types';
import XIcon from './icons/XIcon';
import { geocodeAddress } from '../services/geocoding';

interface MyEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated?: () => void;
}

const MyEventsModal: React.FC<MyEventsModalProps> = ({ isOpen, onClose, onEventUpdated }) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Event>>({});
  const [locationInput, setLocationInput] = useState<string>('');
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserEvents();
    }
  }, [isOpen, user]);

  const fetchUserEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'events'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          date: data.date,
          isFree: data.isFree,
          category: data.category,
          organizer: data.organizer,
          phoneNumber: data.phoneNumber || '',
          position: data.position,
          imageUrl: data.imageUrl,
          photos: data.photos || [],
        });
      });
      setUserEvents(events);
    } catch (error) {
      console.error('Error fetching user events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setUserEvents(userEvents.filter((e) => e.id !== eventId));
      alert('Event deleted successfully!');
      // Call the callback to refresh events on the map
      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditStart = (event: Event) => {
    setEditingId(event.id);
    setEditData(event);
    setLocationInput('');
    setGeocodingError('');
  };

  const handleLocationSearch = async () => {
    if (!locationInput.trim()) {
      setGeocodingError('Please enter a location');
      return;
    }

    setGeocodingLoading(true);
    setGeocodingError('');
    try {
      const result = await geocodeAddress(locationInput);
      if (result) {
        setEditData({
          ...editData,
          position: {
            lat: result.lat,
            lng: result.lng,
          }
        });
        setLocationInput('');
      } else {
        setGeocodingError('Location not found. Please try a different address.');
      }
    } catch (error) {
      setGeocodingError('Error searching for location. Please try again.');
      console.error('Geocoding error:', error);
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleEditSave = async (eventId: string) => {
    try {
      // Only update the fields that are being edited (exclude id and other non-editable fields)
      const updateData: any = {
        title: editData.title,
        description: editData.description,
        date: editData.date,
        category: editData.category,
        organizer: editData.organizer,
        phoneNumber: editData.phoneNumber,
        isFree: editData.isFree,
        position: editData.position,
        photos: editData.photos || [],
      };
      
      console.log('Saving event update:', updateData);
      await updateDoc(doc(db, 'events', eventId), updateData);
      setUserEvents(userEvents.map((e) => (e.id === eventId ? { ...e, ...editData } : e)));
      setEditingId(null);
      alert('Event updated successfully!');
      // Call the callback to refresh events on the map
      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select image files only');
        continue;
      }

      // Read file and convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditData({
          ...editData,
          photos: [...(editData.photos || []), base64],
        });
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = (editData.photos || []).filter((_, i) => i !== index);
    setEditData({
      ...editData,
      photos: updatedPhotos,
    });
  };

  const getDefaultPhoto = (): string => {
    return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop';
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ease-out`}
      onClick={onClose}
      style={{ animation: 'fadeIn 0.5s ease-out' }}
    >
      <div
        className={`relative rounded-2xl shadow-2xl w-full max-w-2xl transition-all duration-500 ease-out transform overflow-y-auto max-h-[90vh] my-auto backdrop-blur-md border border-white/30 ${
          isDarkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        <div className={`p-4 sm:p-6 border-b sticky top-0 backdrop-blur-sm ${isDarkMode ? 'border-gray-700 bg-gray-800/85' : 'border-gray-200 bg-white/85'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold">My Events</h2>
            <button
              onClick={onClose}
              className={`rounded-full p-2 transition-all duration-200 hover:scale-110 ${
                isDarkMode ? 'bg-gray-700/50 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
              aria-label="Close"
            >
              <XIcon className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your events...</p>
            </div>
          ) : userEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                You haven't created any events yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'border-gray-700 bg-gray-700/50 hover:bg-gray-700'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {editingId === event.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editData.title || ''}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className={`w-full p-2 rounded-lg text-sm ${
                          isDarkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        placeholder="Event title"
                      />
                      <textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className={`w-full p-2 rounded-lg text-sm ${
                          isDarkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        placeholder="Event description"
                        rows={3}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={editData.date ? editData.date.split('T')[0] : ''}
                          onChange={(e) => setEditData({ ...editData, date: new Date(e.target.value).toISOString() })}
                          className={`p-2 rounded-lg text-sm ${
                            isDarkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        <select
                          value={editData.category || ''}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className={`p-2 rounded-lg text-sm ${
                            isDarkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          <option>Music</option>
                          <option>Art</option>
                          <option>Sports</option>
                          <option>Fair</option>
                          <option>Theater</option>
                          <option>Education</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editData.organizer || ''}
                          onChange={(e) => setEditData({ ...editData, organizer: e.target.value })}
                          className={`p-2 rounded-lg text-sm ${
                            isDarkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="Organizer"
                        />
                        <input
                          type="tel"
                          value={editData.phoneNumber || ''}
                          onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                          className={`p-2 rounded-lg text-sm ${
                            isDarkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          placeholder="Phone Number"
                        />
                      </div>

                      {/* Location Section */}
                      <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-600/50 border-gray-500' : 'bg-gray-50 border-gray-300'}`}>
                        <label className="font-semibold text-sm block mb-2">Event Location</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={locationInput}
                            onChange={(e) => {
                              setLocationInput(e.target.value);
                              setGeocodingError('');
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleLocationSearch();
                              }
                            }}
                            placeholder="Enter address (e.g., Bucharest, Romania)"
                            className={`flex-1 p-2 rounded-lg text-sm ${
                              isDarkMode
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          />
                          <button
                            onClick={handleLocationSearch}
                            disabled={geocodingLoading}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors"
                          >
                            {geocodingLoading ? '...' : 'Search'}
                          </button>
                        </div>
                        {geocodingError && (
                          <p className="text-xs text-red-400 mb-2">{geocodingError}</p>
                        )}
                        {editData.position && (
                          <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            📍 Latitude: {editData.position.lat.toFixed(4)}, Longitude: {editData.position.lng.toFixed(4)}
                          </p>
                        )}
                      </div>

                      {/* Photos Section */}
                      <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-600/50 border-gray-500' : 'bg-gray-50 border-gray-300'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-semibold text-sm">Photos</label>
                          <button
                            onClick={handleAddPhoto}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                          >
                            + Add Photos
                          </button>
                        </div>

                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />

                        {editData.photos && editData.photos.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            {editData.photos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={photo}
                                  alt={`Photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded transition-all"
                                  onError={(e) => {
                                    e.currentTarget.src = getDefaultPhoto();
                                  }}
                                />
                                <button
                                  onClick={() => handleRemovePhoto(index)}
                                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove photo"
                                >
                                  <XIcon className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mb-2">
                            <img
                              src={getDefaultPhoto()}
                              alt="Default event photo"
                              className="w-full h-24 object-cover rounded"
                            />
                            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              No custom photos yet - showing default
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSave(event.id)}
                          className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                            isDarkMode
                              ? 'bg-gray-600 hover:bg-gray-500 text-white'
                              : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                          }`}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base">{event.title}</h3>
                          <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {event.description}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              {event.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              {new Date(event.date).toLocaleDateString('ro-RO')} {new Date(event.date).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {event.phoneNumber && (
                              <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                📞 {event.phoneNumber}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${event.isFree ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                              {event.isFree ? 'Free' : 'Paid'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Photo Gallery in View Mode */}
                      <div className="mt-3">
                        <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Photos {event.photos && event.photos.length > 0 && `(${event.photos.length})`}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {event.photos && event.photos.length > 0 ? (
                            event.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = getDefaultPhoto();
                                }}
                              />
                            ))
                          ) : (
                            <img
                              src={getDefaultPhoto()}
                              alt="Default event photo"
                              className="w-full h-20 object-cover rounded col-span-3"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleEditStart(event)}
                          className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`p-4 sm:p-6 border-t sticky bottom-0 backdrop-blur-sm ${isDarkMode ? 'border-gray-700 bg-gray-800/85' : 'border-gray-200 bg-white/85'}`}>
          <button
            onClick={onClose}
            className={`w-full py-2 rounded-lg font-semibold transition-colors ${
              isDarkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyEventsModal;
