import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Star, Clock, ChevronRight } from 'lucide-react';
import { Restaurant, FoodItem, FoodCategory } from '../types';
import { restaurantService } from '../services/restaurantService';
import { FoodCard } from '../components/food/FoodCard';
import { FoodCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { extractError } from '../services/api';
import { PLACEHOLDER_RESTAURANT } from '../utils/images';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    if (!id) { navigate('/restaurants'); return; }
    const numId = parseInt(id, 10);

    Promise.all([
      restaurantService.getRestaurantById(numId),
      restaurantService.getRestaurantFoods(numId),
    ])
      .then(([rest, foodList]) => {
        setRestaurant(rest);
        setFoods(foodList);
        if (foodList.length > 0) setActiveCategory(foodList[0].category);
      })
      .catch(err => { toast.error(extractError(err)); navigate('/restaurants'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const categories = useMemo<string[]>(() => {
    const seen = new Set<string>();
    foods.forEach(f => { if (f.category) seen.add(f.category); });
    return Array.from(seen);
  }, [foods]);

  const filtered = foods.filter(f => {
    const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !activeCategory || f.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-20" style={{ background: '#0e0c0a' }}>
        <div className="skeleton w-full h-64 rounded-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
            </div>
            <div className="lg:col-span-3 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <FoodCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="min-h-screen pt-16" style={{ background: '#0e0c0a' }}>
      {/* Cover */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={restaurant.coverImage || PLACEHOLDER_RESTAURANT}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.4) saturate(0.8)' }}
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_RESTAURANT; }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,12,10,1) 0%, rgba(14,12,10,0.4) 60%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 lg:px-10 pb-8">
          <div className="flex items-end gap-4">
            {restaurant.logo && (
              <img src={restaurant.logo} alt="logo" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" style={{ border: '2px solid rgba(255,255,255,0.1)' }} />
            )}
            <div>
              <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.5rem,4vw,2.5rem)', color: '#f3ede0', fontWeight: 700 }}>
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="chip chip-ember flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> {restaurant.rating.toFixed(1)}
                </span>
                <span className="chip chip-dim flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {restaurant.deliveryTime} min
                </span>
                {restaurant.cuisines.slice(0, 3).map(c => (
                  <span key={c} className="chip chip-dim">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offers strip */}
      {restaurant.offers && restaurant.offers.length > 0 && (
        <div style={{ background: 'rgba(232,137,42,0.06)', borderBottom: '1px solid rgba(232,137,42,0.1)' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {restaurant.offers.map(offer => (
              <span key={offer} style={{ color: '#e8892a', fontFamily: '"DM Sans",sans-serif', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                🏷 {offer}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#625a50' }} />
          <input
            className="input-dark pl-11"
            placeholder="Search dishes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category sidebar */}
          {categories.length > 0 && (
            <aside className="lg:w-56 flex-shrink-0">
              <nav className="sticky top-24 space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="w-full text-left flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      fontFamily: '"DM Sans",sans-serif',
                      background: activeCategory === cat ? 'rgba(232,137,42,0.08)' : 'transparent',
                      color: activeCategory === cat ? '#e8892a' : '#7a7165',
                      border: activeCategory === cat ? '1px solid rgba(232,137,42,0.15)' : '1px solid transparent',
                    }}
                  >
                    {cat}
                    {activeCategory === cat && <ChevronRight className="w-3 h-3" />}
                  </button>
                ))}
              </nav>
            </aside>
          )}

          {/* Food list */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <EmptyState emoji="🍴" title="No dishes found" description="Try a different search or category." />
            ) : (
              <div className="space-y-3">
                {filtered.map(food => <FoodCard key={food.id} food={food} variant="horizontal" />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
