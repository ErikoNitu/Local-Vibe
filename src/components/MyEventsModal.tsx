import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../services/firestore';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Event } from '../../types';
import XIcon from './icons/XIcon';

interface MyEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyEventsModal: React.FC<MyEventsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Event>>({});

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
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditStart = (event: Event) => {
    setEditingId(event.id);
    setEditData(event);
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
        isFree: editData.isFree,
      };
      
      console.log('Saving event update:', updateData);
      await updateDoc(doc(db, 'events', eventId), updateData);
      setUserEvents(userEvents.map((e) => (e.id === eventId ? { ...e, ...editData } : e)));
      setEditingId(null);
      alert('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ease-out`}
      onClick={onClose}
      style={{ animation: 'fadeIn 0.5s ease-out' }}
    >
      <div
        className={`relative rounded-2xl shadow-2xl w-full max-w-2xl transition-all duration-500 ease-out transform overflow-y-auto max-h-[90vh] my-auto ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        <div className={`p-4 sm:p-6 border-b sticky top-0 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
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
                          <option>Muzică</option>
                          <option>Artă</option>
                          <option>Sport</option>
                          <option>Târg</option>
                          <option>Teatru</option>
                          <option>Educație</option>
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
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editData.isFree ?? false}
                            onChange={(e) => setEditData({ ...editData, isFree: e.target.checked })}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Free Event</span>
                        </label>
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
                              {new Date(event.date).toLocaleDateString('ro-RO')}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${event.isFree ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                              {event.isFree ? 'Free' : 'Paid'}
                            </span>
                          </div>
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

        <div className={`p-4 sm:p-6 border-t sticky bottom-0 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
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
