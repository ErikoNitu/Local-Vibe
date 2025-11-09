import React from 'react';
import { useAuth } from '../auth/useAuth';
import PlusIcon from './icons/PlusIcon';

interface AddEventButtonProps {
  onClick: () => void;
}

const AddEventButton: React.FC<AddEventButtonProps> = ({ onClick }) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-20 bg-gradient-to-r from-gray-600/30 to-gray-500/30 hover:from-gray-700/40 hover:to-gray-600/40 text-white rounded-full p-3 sm:p-4 md:p-5 shadow-lg hover:shadow-xl hover:shadow-gray-400/50 transform hover:scale-125 active:scale-95 transition-all duration-200 backdrop-blur-xl border-2 border-white/50 min-h-12 sm:min-h-14 md:min-h-16 min-w-12 sm:min-w-14 md:min-w-16 flex items-center justify-center touch-manipulation"
      aria-label="Add Event"
    >
      <PlusIcon className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8" />
    </button>
  );
};

export default AddEventButton;