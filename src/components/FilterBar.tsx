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
  onEventUpdated?: () => void;
  onOpenLogin: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, eventCount, user, onLogout, onEventUpdated, onOpenLogin }) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-2 sm:p-3 md:p-4 bg-black/40 backdrop-blur-md border border-white/15 shadow-2xl">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Single row: Title, Search, Filters, Login, Menu */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Title */}
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-wider whitespace-nowrap flex-shrink-0" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)', fontFamily: 'Courier New, Courier, monospace, -apple-system, BlinkMacSystemFont, "Segoe UI"' }}>
            Local Vibe
          </h1>
          
          {/* Search */}
          <div className="flex-1 min-w-0 bg-white/25 backdrop-blur-md rounded-full flex items-center px-3 sm:px-4 md:px-5 shadow-lg h-9 sm:h-10 md:h-11 border border-white/30 hover:bg-white/35 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 sm:w-5 h-4 sm:h-5 text-white/70 flex-shrink-0">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder={`Search among ${eventCount} events...`}
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className={`w-full bg-transparent text-white focus:outline-none p-2 sm:p-2.5 pr-4 sm:pr-5 text-xs sm:text-sm md:text-base placeholder-white/60 ${
                filters.search === 'chatbot recommended' ? 'text-purple-300 placeholder-purple-300' : 'placeholder-white/60'
              }`}
            />
          </div>

          {/* Price Filter */}
          <div className="relative flex-shrink-0">
            <select
              value={filters.price}
              onChange={(e) => onFilterChange('price', e.target.value as PriceFilter)}
              className="bg-white/30 backdrop-blur-md text-white rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 pr-9 sm:pr-10 focus:outline-none appearance-none cursor-pointer text-xs sm:text-sm md:text-base transition-all hover:bg-white/40 focus:ring-2 focus:ring-purple-400/50 border border-white/40 shadow-md"
            >
              <option value={PriceFilter.All} className="text-white bg-black/40 backdrop-blur-md border border-white/30">All Prices</option>
              <option value={PriceFilter.Free} className="text-white bg-black/40 backdrop-blur-md border border-white/30">Free</option>
              <option value={PriceFilter.Paid} className="text-white bg-black/40 backdrop-blur-md border border-white/30">Paid</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative flex-shrink-0">
            <select
              value={filters.date}
              onChange={(e) => onFilterChange('date', e.target.value as DateFilter)}
              className="bg-white/30 backdrop-blur-md text-white rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 pr-9 sm:pr-10 focus:outline-none appearance-none cursor-pointer text-xs sm:text-sm md:text-base transition-all hover:bg-white/40 focus:ring-2 focus:ring-purple-400/50 border border-white/40 shadow-md"
            >
              <option value={DateFilter.All} className="text-white bg-black/40 backdrop-blur-md border border-white/30">Anytime</option>
              <option value={DateFilter.Today} className="text-white bg-black/40 backdrop-blur-md border border-white/30">Today</option>
              <option value={DateFilter.ThisWeek} className="text-white bg-black/40 backdrop-blur-md border border-white/30">This Week</option>
              <option value={DateFilter.NextWeek} className="text-white bg-black/40 backdrop-blur-md border border-white/30">Next Week</option>
              <option value={DateFilter.ThisWeekend} className="text-white bg-black/40 backdrop-blur-md border border-white/30">This Weekend</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </div>
          </div>

          {/* Login Button (only if not logged in) */}
          {!user && (
            <button
              onClick={onOpenLogin}
              className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 backdrop-blur-md border border-purple-400/50 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 whitespace-nowrap flex-shrink-0"
            >
              Login
            </button>
          )}

          {/* User Menu */}
          <div className="flex-shrink-0">
            <UserMenu onEventUpdated={onEventUpdated} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
