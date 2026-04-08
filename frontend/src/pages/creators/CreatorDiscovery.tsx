import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCreatorProfiles, getLocationSuggestions } from '../../api/endpoints';
import type { CreatorProfile } from '../../types';
import {
  CREATOR_CATEGORIES,
  CATEGORY_LABELS,
  SOCIAL_PLATFORMS,
  PLATFORM_LABELS,
  RATE_RANGES,
  RATE_RANGE_LABELS,
  AVAILABILITY_OPTIONS,
  AVAILABILITY_LABELS,
} from '../../types/creator.types';
import { FOLLOWER_RANGES } from '../../types/agency.types';

const FOLLOWER_RANGE_LABELS: Record<string, string> = {
  NANO: '1K - 10K',
  MICRO: '10K - 50K',
  MID_TIER: '50K - 500K',
  MACRO: '500K - 1M',
  MEGA: '1M+',
  ANY: 'Any',
};

const FOLLOWER_RANGE_BOUNDS: Record<string, [number, number]> = {
  NANO: [1000, 10000],
  MICRO: [10000, 50000],
  MID_TIER: [50000, 500000],
  MACRO: [500000, 1000000],
  MEGA: [1000000, Infinity],
};

interface Filters {
  search: string;
  categories: string[];
  platforms: string[];
  rateRange: string;
  availability: string;
  followerRange: string;
  city: string;
  state: string;
}

const defaultFilters: Filters = {
  search: '',
  categories: [],
  platforms: [],
  rateRange: '',
  availability: '',
  followerRange: '',
  city: '',
  state: '',
};

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(count);
}

function getAvailabilityColor(availability: string): string {
  switch (availability) {
    case 'IMMEDIATELY':
      return 'bg-green-500';
    case 'ONE_TWO_WEEKS':
    case 'ONE_MONTH':
      return 'bg-yellow-500';
    case 'NOT_AVAILABLE':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
}

export function CreatorDiscovery() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<{ city: string[]; state: string[] }>({ city: [], state: [] });
  const [activeSuggestion, setActiveSuggestion] = useState<'city' | 'state' | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLocationSuggestions = (field: 'city' | 'state', q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setLocationSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await getLocationSuggestions(field, q);
      setLocationSuggestions((prev) => ({ ...prev, [field]: results }));
    }, 300);
  };

  const {
    data: creators,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['creatorProfiles'],
    queryFn: getCreatorProfiles,
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.platforms.length > 0) count++;
    if (filters.rateRange) count++;
    if (filters.availability) count++;
    if (filters.followerRange) count++;
    if (filters.city.trim()) count++;
    if (filters.state.trim()) count++;
    return count;
  }, [filters]);

  const filteredCreators = useMemo(() => {
    if (!creators) return [];

    return creators.filter((c: CreatorProfile) => {
      // Search by displayName
      if (
        filters.search &&
        !c.displayName.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Categories (multi-select, match any)
      if (
        filters.categories.length > 0 &&
        !filters.categories.some((cat) => c.categories.includes(cat))
      ) {
        return false;
      }

      // Platforms (multi-select, match any)
      if (
        filters.platforms.length > 0 &&
        !filters.platforms.some((plat) =>
          c.socialAccounts.some((sa) => sa.platform === plat),
        )
      ) {
        return false;
      }

      // Rate range
      if (filters.rateRange && c.rateRange !== filters.rateRange) {
        return false;
      }

      // Availability
      if (filters.availability && c.availability !== filters.availability) {
        return false;
      }

      // Follower range (max follower count across socialAccounts)
      if (filters.followerRange && filters.followerRange !== 'ANY') {
        const bounds = FOLLOWER_RANGE_BOUNDS[filters.followerRange];
        if (bounds) {
          const maxFollowers = c.socialAccounts.reduce(
            (max, sa) => Math.max(max, sa.followerCount),
            0,
          );
          if (maxFollowers < bounds[0] || maxFollowers > bounds[1]) {
            return false;
          }
        }
      }

      // Location: city
      if (
        filters.city.trim() &&
        !(c.city ?? '').toLowerCase().includes(filters.city.trim().toLowerCase())
      ) {
        return false;
      }

      // Location: state
      if (
        filters.state.trim() &&
        !(c.state ?? '').toLowerCase().includes(filters.state.trim().toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [creators, filters]);

  const toggleChip = (field: 'categories' | 'platforms', value: string) => {
    setFilters((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const getPrimaryPlatform = (socialAccounts: CreatorProfile['socialAccounts']) => {
    if (!socialAccounts || socialAccounts.length === 0) return null;
    return socialAccounts.reduce((best, sa) =>
      sa.followerCount > best.followerCount ? sa : best,
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Discover Creators</h1>
          <p className="mt-2 text-gray-400">
            Find the perfect creator for your next campaign
          </p>
        </div>

        {/* Search row + filter popover */}
        <div className="relative flex items-center gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg text-sm outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
                : 'border border-white/20 text-white hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 bg-indigo-500 text-white text-xs rounded-full leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Floating popover */}
          {showFilters && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowFilters(false)}
              />
              {/* Panel */}
              <div className="absolute right-0 top-full mt-2 z-50 w-[420px] rounded-2xl border border-white/10 bg-[#0d0d1f] shadow-2xl shadow-black/40">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-sm font-semibold text-white">Filters</span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <X className="h-3 w-3" />
                      Clear all
                    </button>
                  )}
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto max-h-[60vh] px-4 py-4 space-y-5">
                  {/* Categories */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Category</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CREATOR_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => toggleChip('categories', cat)}
                          className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer transition ${
                            filters.categories.includes(cat)
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/[0.08]'
                          }`}
                        >
                          {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Platforms */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Platform</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SOCIAL_PLATFORMS.map((plat) => (
                        <button
                          key={plat}
                          onClick={() => toggleChip('platforms', plat)}
                          className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer transition ${
                            filters.platforms.includes(plat)
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/[0.08]'
                          }`}
                        >
                          {PLATFORM_LABELS[plat as keyof typeof PLATFORM_LABELS]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rate Range */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Rate Range</p>
                    <div className="flex flex-wrap gap-1.5">
                      {RATE_RANGES.map((r) => (
                        <button
                          key={r}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              rateRange: prev.rateRange === r ? '' : r,
                            }))
                          }
                          className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer transition ${
                            filters.rateRange === r
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/[0.08]'
                          }`}
                        >
                          {RATE_RANGE_LABELS[r as keyof typeof RATE_RANGE_LABELS]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Availability</p>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABILITY_OPTIONS.map((a) => (
                        <button
                          key={a}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              availability: prev.availability === a ? '' : a,
                            }))
                          }
                          className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer transition ${
                            filters.availability === a
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/[0.08]'
                          }`}
                        >
                          {AVAILABILITY_LABELS[a as keyof typeof AVAILABILITY_LABELS]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Follower Range */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Follower Range</p>
                    <div className="flex flex-wrap gap-1.5">
                      {FOLLOWER_RANGES.map((f) => (
                        <button
                          key={f}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              followerRange: prev.followerRange === f ? '' : f,
                            }))
                          }
                          className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer transition ${
                            filters.followerRange === f
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/[0.08]'
                          }`}
                        >
                          {FOLLOWER_RANGE_LABELS[f] ?? f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-2 gap-2">
                    {(['city', 'state'] as const).map((field) => (
                      <div key={field} className="relative">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          {field === 'city' ? 'City' : 'State'}
                        </p>
                        <input
                          type="text"
                          placeholder={field === 'city' ? 'e.g. Mumbai' : 'e.g. Maharashtra'}
                          value={filters[field]}
                          onChange={(e) => {
                            setFilters((prev) => ({ ...prev, [field]: e.target.value }));
                            fetchLocationSuggestions(field, e.target.value);
                          }}
                          onFocus={() => setActiveSuggestion(field)}
                          onBlur={() => setTimeout(() => setActiveSuggestion(null), 150)}
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
                        />
                        {activeSuggestion === field && locationSuggestions[field].length > 0 && (
                          <div className="absolute z-10 top-full mt-1 w-full bg-[#0d0d1f] border border-white/10 rounded-lg overflow-hidden shadow-xl">
                            {locationSuggestions[field].map((suggestion) => (
                              <button
                                key={suggestion}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setFilters((prev) => ({ ...prev, [field]: suggestion }));
                                  setLocationSuggestions((prev) => ({ ...prev, [field]: [] }));
                                  setActiveSuggestion(null);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel footer */}
                <div className="px-4 py-3 border-t border-white/10">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin mb-3 border-indigo-500 border-t-transparent text-indigo-500" />
            <p className="text-sm text-gray-400">Loading creators...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-lg font-medium text-red-400 mb-2">
              Failed to load creators
            </p>
            <p className="text-sm text-gray-400">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        )}

        {/* Empty state (after filtering) */}
        {!isLoading && !error && filteredCreators.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <p className="text-lg font-medium mb-2">
              No creators match your filters
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Results grid */}
        {!isLoading && !error && filteredCreators.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator: CreatorProfile, index: number) => {
              const primary = getPrimaryPlatform(creator.socialAccounts);
              const firstCategory = creator.categories[0];

              return (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link
                    to={`/creators/${creator.id}`}
                    className="block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      {creator.profileImageUrl ? (
                        <img
                          src={creator.profileImageUrl}
                          alt={creator.displayName}
                          className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-lg">
                          {getInitials(creator.firstName, creator.lastName)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Name */}
                        <h3 className="font-semibold text-white truncate">
                          {creator.displayName}
                        </h3>

                        {/* Category tag */}
                        {firstCategory && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-medium">
                            {CATEGORY_LABELS[firstCategory as keyof typeof CATEGORY_LABELS] ??
                              firstCategory}
                          </span>
                        )}

                        {/* Location */}
                        {(creator.city || creator.state) && (
                          <p className="mt-1 text-sm text-gray-400 truncate">
                            {[creator.city, creator.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom info row */}
                    <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                      {/* Primary platform + followers */}
                      {primary && (
                        <span className="text-sm text-gray-400">
                          {PLATFORM_LABELS[primary.platform as keyof typeof PLATFORM_LABELS] ??
                            primary.platform}{' '}
                          <span className="font-medium text-white">
                            {formatFollowers(primary.followerCount)}
                          </span>
                        </span>
                      )}

                      {/* Rate badge */}
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/10 text-white/70">
                        {RATE_RANGE_LABELS[creator.rateRange as keyof typeof RATE_RANGE_LABELS] ??
                          creator.rateRange}
                      </span>
                    </div>

                    {/* Availability */}
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${getAvailabilityColor(creator.availability)}`}
                      />
                      <span className="text-xs text-gray-500">
                        {AVAILABILITY_LABELS[creator.availability as keyof typeof AVAILABILITY_LABELS] ??
                          creator.availability}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
