import React, { useState } from 'react';
import { Event } from '../types';
import XIcon from './icons/XIcon';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<Event, 'id' | 'position' | 'imageUrl'>) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Muzică');
  const [organizer, setOrganizer] = useState('');
  const [isFree, setIsFree] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !organizer) {
        alert('Te rog completează toate câmpurile obligatorii.');
        return;
    }
    
    onAddEvent({
      title,
      description,
      date,
      isFree,
      category,
      organizer,
    });
    
    // Reset form and close
    setTitle('');
    setDescription('');
    setDate('');
    setCategory('Muzică');
    setOrganizer('');
    setIsFree(false);
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
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
              Publică Eveniment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
