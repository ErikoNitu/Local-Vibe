import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Filters, PriceFilter, DateFilter } from '../../types';

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
    <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-black/30 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            Local Vibe
          </h1>
          
          <div className="w-full md:w-auto md:flex-1 bg-white/20 rounded-full flex items-center px-4 shadow-lg">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white/70">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder={`Caută printre ${eventCount} evenimente...`}
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full bg-transparent text-white placeholder-white/70 focus:outline-none p-3"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={filters.price}
              onChange={(e) => onFilterChange('price', e.target.value as PriceFilter)}
              className="w-full md:w-auto bg-white/20 text-white rounded-full px-4 py-3 focus:outline-none appearance-none cursor-pointer"
            >
              <option value={PriceFilter.All} className="text-black">Toate Prețurile</option>
              <option value={PriceFilter.Free} className="text-black">Gratuit</option>
              <option value={PriceFilter.Paid} className="text-black">Cu Plată</option>
            </select>
            <select
              value={filters.date}
              onChange={(e) => onFilterChange('date', e.target.value as DateFilter)}
               className="w-full md:w-auto bg-white/20 text-white rounded-full px-4 py-3 focus:outline-none appearance-none cursor-pointer"
            >
              <option value={DateFilter.All} className="text-black">Oricând</option>
              <option value={DateFilter.ThisWeek} className="text-black">Săptămâna Asta</option>
              <option value={DateFilter.NextWeek} className="text-black">Săptămâna Viitoare</option>
              <option value={DateFilter.ThisWeekend} className="text-black">În Weekend</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            {user ? (
              <>
                <span className="text-sm text-gray-300 px-3 py-2">{user.email}</span>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors"
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
