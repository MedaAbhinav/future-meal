import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Leaf } from 'lucide-react';
import { Restaurant } from '../types';
import { restaurantService } from '../services/restaurantService';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { extractError } from '../services/api';
import { CUISINE_CATEGORIES } from '../utils/seedData';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'RATING',        label: 'Top Rated'      },
  { value: 'DELIVERY_TIME', label: 'Fastest'         },
  { value: 'DELIVERY_FEE',  label: 'Low Delivery Fee'},
];

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '');
  const [sortBy, setSortBy] = useState('RATING');
  const [vegOnly, setVegOnly] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await restaurantService.getRestaurants({
        cuisine: selectedCuisine || undefined,
        sortBy,
        isVeg: vegOnly || undefined,
        size: 20,
      });
      setRestaurants(data.content);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [selectedCuisine, sortBy, vegOnly]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const filtered = restaurants.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisines.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="warm" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
        {/* Header */}
        <div className="py-10">
          <p className="text-label mb-3" style={{ color: '#e8892a' }}>EXPLORE</p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#f3ede0', fontWeight: 700 }}>
            Find your restaurant.
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#625a50' }} />
          <input
            className="input-dark pl-11"
            placeholder="Search restaurants or cuisines…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Cuisine chips */}
          <button
            onClick={() => setSelectedCuisine('')}
            className={`chip ${!selectedCuisine ? 'chip-ember' : 'chip-dim'}`}
          >
            All
          </button>
          {CUISINE_CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCuisine(selectedCuisine === c.id ? '' : c.id)}
              className={`chip ${selectedCuisine === c.id ? 'chip-ember' : 'chip-dim'}`}
            >
              {c.emoji} {c.name}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-3">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-dark py-2 px-3 text-sm"
              style={{ width: 'auto', background: '#1c1814', fontSize: '0.8125rem' }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#1c1814' }}>{o.label}</option>
              ))}
            </select>

            {/* Veg toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`chip ${vegOnly ? 'chip-green' : 'chip-dim'} flex items-center gap-1.5`}
            >
              <Leaf className="w-3 h-3" /> Veg
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🍽️"
            title="No restaurants found"
            description="Try adjusting your filters or search for something else."
            ctaLabel="Clear filters"
            onCta={() => { setSelectedCuisine(''); setSearch(''); setVegOnly(false); }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
