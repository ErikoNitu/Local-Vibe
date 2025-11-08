import React from 'react';
import { Event } from '../../types';
import XIcon from './icons/XIcon';

interface EventCardProps {
  event: Event;
  onClose: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClose }) => {
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

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-gray-800 text-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-900/50 rounded-full p-2 text-white hover:bg-gray-900 transition-colors"
          aria-label="Close"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-sm bg-purple-600/50 text-purple-200 px-3 py-1 rounded-full">{event.category}</span>
              <h2 className="text-3xl font-bold mt-2">{event.title}</h2>
              <p className="text-gray-400">de {event.organizer}</p>
            </div>
            <div className={`text-lg font-semibold px-4 py-2 rounded-lg ${event.isFree ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
              {event.isFree ? 'Gratuit' : 'Cu Plată'}
            </div>
          </div>
          
          <div className="mt-4 border-t border-gray-700 pt-4">
             <p className="font-semibold text-purple-300">{formatDate(event.date)}</p>
             <p className="mt-2 text-gray-300">{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
