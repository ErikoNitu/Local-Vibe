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
      className="fixed bottom-6 right-6 z-20 bg-gradient-to-r from-gray-600/30 to-gray-500/30 hover:from-gray-700/40 hover:to-gray-600/40 text-white rounded-full p-4 shadow-lg hover:shadow-xl hover:shadow-gray-400/50 transform hover:scale-125 transition-all duration-200 backdrop-blur-xl border-2 border-white/50"
      aria-label="Add Event"
    >
      <PlusIcon className="w-8 h-8" />
    </button>
  );
};

export default AddEventButton;