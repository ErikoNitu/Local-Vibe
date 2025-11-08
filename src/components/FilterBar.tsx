import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Filters, PriceFilter, DateFilter } from '../../types';
import UserMenu from './UserMenu';

interface FilterBarProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  eventCount: number;
  user: User | null;
  onLogout: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, eventCount, user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-2 sm:p-3 md:p-4 bg-black/30 backdrop-blur-sm">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wider whitespace-nowrap" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            Local Vibe
          </h1>
          
          <div className="w-full sm:flex-1 bg-white/20 rounded-full flex items-center px-2 sm:px-3 md:px-4 shadow-lg h-10 sm:h-11 md:h-12">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 sm:w-5 h-4 sm:h-5 text-white/70 flex-shrink-0">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder={`Caută printre ${eventCount} evenimente...`}
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className={`w-full bg-transparent text-white focus:outline-none p-2 sm:p-3 text-sm sm:text-base ${
                filters.search === 'chatbot recommended' ? 'text-purple-300 placeholder-purple-300' : 'placeholder-white/70'
              }`}
            />
          </div>

          <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
            <select
              value={filters.price}
              onChange={(e) => onFilterChange('price', e.target.value as PriceFilter)}
              className="flex-1 sm:flex-none bg-white/20 text-white rounded-full px-2 sm:px-4 py-2 sm:py-3 focus:outline-none appearance-none cursor-pointer text-xs sm:text-sm md:text-base transition-all hover:bg-white/30"
            >
              <option value={PriceFilter.All} className="text-black">Toate Prețurile</option>
              <option value={PriceFilter.Free} className="text-black">Gratuit</option>
              <option value={PriceFilter.Paid} className="text-black">Cu Plată</option>
            </select>
            <select
              value={filters.date}
              onChange={(e) => onFilterChange('date', e.target.value as DateFilter)}
               className="flex-1 sm:flex-none bg-white/20 text-white rounded-full px-2 sm:px-4 py-2 sm:py-3 focus:outline-none appearance-none cursor-pointer text-xs sm:text-sm md:text-base transition-all hover:bg-white/30"
            >
              <option value={DateFilter.All} className="text-black">Oricând</option>
              <option value={DateFilter.ThisWeek} className="text-black">Săptămâna Asta</option>
              <option value={DateFilter.NextWeek} className="text-black">Săptămâna Viitoare</option>
              <option value={DateFilter.ThisWeekend} className="text-black">În Weekend</option>
            </select>
          </div>

          <div className="flex gap-1 sm:gap-2 ml-auto w-full sm:w-auto">
            <UserMenu />
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
