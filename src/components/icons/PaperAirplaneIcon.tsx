import React from 'react';

interface PaperAirplaneIconProps {
  className?: string;
}

const PaperAirplaneIcon: React.FC<PaperAirplaneIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10.894 2.553a.75.75 0 00-1.788 0l-7 14a.75.75 0 001.084.852l4.38-7.176 3.5 4.081c.823.96 2.402.96 3.225 0l3.5-4.081 4.38 7.176a.75.75 0 001.084-.852l-7-14z" />
  </svg>
);

export default PaperAirplaneIcon;
