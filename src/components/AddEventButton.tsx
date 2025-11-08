import React from 'react';
import PlusIcon from './icons/PlusIcon';

interface AddEventButtonProps {
  onClick: () => void;
}

const AddEventButton: React.FC<AddEventButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-20 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transform hover:scale-105 transition-transform"
      aria-label="Add Event"
    >
      <PlusIcon className="w-8 h-8" />
    </button>
  );
};

export default AddEventButton;