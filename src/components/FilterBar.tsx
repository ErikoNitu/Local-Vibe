import React, { useState } from 'react';
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
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-2 sm:p-3 md:p-4 bg-black/40 backdrop-blur-md border border-white/15 shadow-2xl">
      <div className="w-full max-w-screen-2xl mx-auto px-1 sm:px-4">
        {/* Mobile: Logo on top, filters below */}
        <div className="md:hidden mb-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Local Vibe Logo" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-wider whitespace-nowrap" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)', fontFamily: 'Courier New, Courier, monospace, -apple-system, BlinkMacSystemFont, "Segoe UI"' }}>
              Local Vibe
            </h1>
          </div>
        </div>

        {/* Mobile: Filter row */}
        <div className="flex flex-row items-center gap-2 md:gap-3 lg:gap-4">
          {/* Desktop: Logo */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="Local Vibe Logo" className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 flex-shrink-0" />
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-wider whitespace-nowrap" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)', fontFamily: 'Courier New, Courier, monospace, -apple-system, BlinkMacSystemFont, "Segoe UI"' }}>
              Local Vibe
            </h1>
          </div>

          {/* Search - constrained width */}
          <div className="flex-1 max-w-4xl min-w-0 bg-white/25 backdrop-blur-md rounded-full flex items-center px-3 sm:px-3 md:px-4 lg:px-5 shadow-lg h-9 sm:h-9 md:h-10 lg:h-11 border border-white/30 hover:bg-white/35 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 sm:w-4 md:w-5 h-4 sm:h-4 md:h-5 text-white/70 flex-shrink-0">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder={`Search (${eventCount})`}
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className={`w-full bg-transparent text-white focus:outline-none p-1.5 sm:p-2 pr-2 sm:pr-3 text-xs sm:text-xs md:text-sm lg:text-base placeholder-white/60 ${
                filters.search === 'chatbot recommended' ? 'text-purple-300 placeholder-purple-300' : 'placeholder-white/60'
              }`}
            />
          </div>

          {/* MOBILE: Filter Dropdown Menu Button */}
          <div className="relative md:hidden flex-shrink-0">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="bg-white/30 backdrop-blur-md text-white rounded-xl px-3 py-2 h-9 sm:h-9 focus:outline-none cursor-pointer text-xs sm:text-xs transition-all hover:bg-white/40 focus:ring-2 focus:ring-purple-400/50 border border-white/40 shadow-md flex items-center gap-1 whitespace-nowrap"
              aria-label="Filter menu"
              aria-expanded={isFilterMenuOpen}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v6.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 10-1.414-1.414L15 14.586V8z" />
              </svg>
              ⚙️
            </button>

            {/* Mobile Dropdown Menu */}
            {isFilterMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-gray-800/60 backdrop-blur-lg border border-white/30 rounded-xl shadow-xl z-20 w-48 p-3 space-y-3">
                {/* Price Filter */}
                <div>
                  <label className="block text-xs sm:text-xs font-semibold text-gray-300 mb-2">Price</label>
                  <select
                    value={filters.price}
                    onChange={(e) => onFilterChange('price', e.target.value as PriceFilter)}
                    className="w-full bg-white/20 backdrop-blur-md text-white rounded-lg px-2 py-1.5 focus:outline-none appearance-none cursor-pointer text-xs transition-all hover:bg-white/30 focus:ring-2 focus:ring-purple-400/50 border border-white/40"
                  >
                    <option value={PriceFilter.All}>All Price</option>
                    <option value={PriceFilter.Free}>Free</option>
                    <option value={PriceFilter.Paid}>Paid</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-xs sm:text-xs font-semibold text-gray-300 mb-2">Time</label>
                  <select
                    value={filters.date}
                    onChange={(e) => onFilterChange('date', e.target.value as DateFilter)}
                    className="w-full bg-white/20 backdrop-blur-md text-white rounded-lg px-2 py-1.5 focus:outline-none appearance-none cursor-pointer text-xs transition-all hover:bg-white/30 focus:ring-2 focus:ring-purple-400/50 border border-white/40"
                  >
                    <option value={DateFilter.All}>Anytime</option>
                    <option value={DateFilter.Today}>Today</option>
                    <option value={DateFilter.ThisWeek}>This Week</option>
                    <option value={DateFilter.NextWeek}>Next Week</option>
                    <option value={DateFilter.ThisWeekend}>This Weekend</option>
                  </select>
                </div>

                {/* Login Button in Dropdown */}
                {!user && (
                  <button
                    onClick={() => {
                      onOpenLogin();
                      setIsFilterMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg text-xs font-semibold transition-all duration-300 backdrop-blur-md border border-purple-400/50 shadow-md hover:shadow-lg hover:shadow-purple-500/30"
                  >
                    Login
                  </button>
                )}

                {/* Close button */}
                <button
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="w-full px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition-all border border-white/20"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Mobile User Menu */}
          <div className="md:hidden flex-shrink-0">
            <UserMenu onEventUpdated={onEventUpdated} />
          </div>

          {/* DESKTOP: Inline filters and buttons */}
          <div className="hidden md:flex md:items-center md:gap-2 md:flex-shrink-0">
            {/* Price Filter */}
            <div className="relative">
              <select
                value={filters.price}
                onChange={(e) => onFilterChange('price', e.target.value as PriceFilter)}
                className="w-full bg-white/30 backdrop-blur-md text-white rounded-xl 
               pl-4 pr-10 py-2.5 md:py-3 md:pl-6 md:pr-14
               text-left text-sm md:text-base 
               focus:outline-none appearance-none cursor-pointer 
               transition-all hover:bg-white/40 focus:ring-2 
               focus:ring-purple-400/50 border border-white/40 shadow-md"

              >
                <option value={PriceFilter.All}>All Price</option>
                <option value={PriceFilter.Free}>Free</option>
                <option value={PriceFilter.Paid}>Paid</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/70">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </div>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={filters.date}
                onChange={(e) => onFilterChange('date', e.target.value as DateFilter)}
                className="bg-white/30 backdrop-blur-md text-white rounded-xl px-4 py-2.5 md:px-6 md:py-3 pr-14 focus:outline-none appearance-none cursor-pointer text-sm md:text-base transition-all hover:bg-white/40 focus:ring-2 focus:ring-purple-400/50 border border-white/40 shadow-md text-left"
              >
                <option value={DateFilter.All}>Anytime</option>
                <option value={DateFilter.Today}>Today</option>
                <option value={DateFilter.ThisWeek}>This Week</option>
                <option value={DateFilter.NextWeek}>Next Week</option>
                <option value={DateFilter.ThisWeekend}>This Weekend</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/70">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </div>
            </div>

            {/* Login Button (only if not logged in) - Desktop */}
            {!user && (
              <button
                onClick={onOpenLogin}
                className="px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl text-sm md:text-base font-semibold transition-all duration-300 backdrop-blur-md border border-purple-400/50 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 whitespace-nowrap"
              >
                Login
              </button>
            )}

            {/* User Menu - Desktop */}
            <div className="flex-shrink-0">
              <UserMenu onEventUpdated={onEventUpdated} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;