import React, { useState, useEffect } from 'react';
import { Search, X, Flame, TrendingUp } from 'lucide-react';
import { TMDBShow } from '../../types/tmdb';
import { searchTMDB, fetchTrendingShows, fetchPopularShows } from '../../lib/tmdb';
import { ShowGrid } from './ShowGrid';
import { ShowDetailModal } from './ShowDetailModal';

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<TMDBShow[]>([]);
  const [trendingShows, setTrendingShows] = useState<TMDBShow[]>([]);
  const [popularShows, setPopularShows] = useState<TMDBShow[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedShow, setSelectedShow] = useState<TMDBShow | null>(null);

  useEffect(() => {
    fetchTrendingShows().then(setTrendingShows);
    fetchPopularShows().then(setPopularShows);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(() => {
      searchTMDB(query).then((results) => {
        setSearchResults(results);
        setIsSearching(false);
      });
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div className="pb-32 pt-2">
      {/* Search Input Bar */}
      <div className="px-4 mb-5">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search TV shows (e.g., Severance, Fallout)..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#091e14]/90 border border-emerald-900/70 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Search Results OR Trending / Popular */}
      <div className="px-4">
        {query.trim().length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Search Results ({searchResults.length})
              </h3>
            </div>

            <ShowGrid
              shows={searchResults}
              onSelectShow={(show) => setSelectedShow(show)}
              isLoading={isSearching}
            />

            {!isSearching && searchResults.length === 0 && (
              <div className="text-center py-16 text-emerald-600/70 text-xs">
                No shows found for "{query}". Try a different title or keyword.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Trending Shows */}
            <div>
              <div className="flex items-center gap-1.5 mb-3 text-emerald-400">
                <Flame className="w-4 h-4 fill-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-200">
                  Trending This Week
                </h3>
              </div>

              <ShowGrid
                shows={trendingShows}
                onSelectShow={(show) => setSelectedShow(show)}
              />
            </div>

            {/* Popular Shows */}
            <div>
              <div className="flex items-center gap-1.5 mb-3 text-teal-400">
                <TrendingUp className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-200">
                  Popular All-Time
                </h3>
              </div>

              <ShowGrid
                shows={popularShows}
                onSelectShow={(show) => setSelectedShow(show)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Show Detail Modal */}
      {selectedShow && (
        <ShowDetailModal
          show={selectedShow}
          onClose={() => setSelectedShow(null)}
        />
      )}
    </div>
  );
};
