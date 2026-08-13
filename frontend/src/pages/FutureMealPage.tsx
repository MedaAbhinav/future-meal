import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Calendar, Clock } from 'lucide-react';
import { FutureMeal } from '../types';
import { futureMealService } from '../services/futureMealService';
import { FutureMealStatusBadge } from '../components/ui/Badge';
import { FutureMealScore } from '../components/ui/FutureMealScore';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { EmptyState } from '../components/ui/EmptyState';
import { OrderCardSkeleton } from '../components/ui/Skeleton';
import { extractError } from '../services/api';
import { formatCurrency, formatDate, FUTUREMEAL_STATUS_LABELS, CUISINE_LABELS } from '../utils/formatters';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PLANNED',     label: 'Watching' },
  { value: 'MATCH_FOUND', label: 'Match Found' },
  { value: 'READY',       label: 'Ready' },
  { value: 'ORDERED',     label: 'Ordered' },
];

export default function FutureMealPage() {
  const [meals, setMeals] = useState<FutureMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const data = await futureMealService.getMyFutureMeals();
      setMeals(data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeals(); }, []);

  const filtered = meals.filter(m => !filter || m.status === filter);

  const handleEvaluate = async (id: number) => {
    setActionLoading(id);
    try {
      const updated = await futureMealService.evaluateFutureMeal(id);
      setMeals(prev => prev.map(m => m.id === id ? updated : m));
      toast.success('Evaluation complete');
    } catch (err) { toast.error(extractError(err)); }
    finally { setActionLoading(null); }
  };

  const handleCancel = async (id: number) => {
    setActionLoading(id);
    try {
      const updated = await futureMealService.cancelFutureMeal(id);
      setMeals(prev => prev.map(m => m.id === id ? updated : m));
      toast.success('FutureMeal cancelled');
    } catch (err) { toast.error(extractError(err)); }
    finally { setActionLoading(null); }
  };

  const handleOrder = async (id: number) => {
    setActionLoading(id);
    try {
      await futureMealService.orderFutureMeal(id, 'CASH_ON_DELIVERY');
      const updated = await futureMealService.getFutureMealById(id);
      setMeals(prev => prev.map(m => m.id === id ? updated : m));
      toast.success('Order placed from FutureMeal!');
    } catch (err) { toast.error(extractError(err)); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="warm" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10 pb-16">
        {/* Header */}
        <div className="py-10 flex items-start justify-between">
          <div>
            <p className="text-label mb-3" style={{ color: '#e8892a' }}>INTELLIGENT PLANNING</p>
            <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#f3ede0', fontWeight: 700, lineHeight: 1.05 }}>
              Your Future<br />
              <em style={{ color: '#e8892a', fontStyle: 'italic' }}>Meals.</em>
            </h1>
          </div>
          <Link to="/future-meals/new" className="btn-ember flex items-center gap-2 mt-4">
            <Plus className="w-4 h-4" /> Plan New
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Planned', value: meals.filter(m => m.status === 'PLANNED').length, color: '#7a7165' },
            { label: 'Match Found', value: meals.filter(m => m.status === 'MATCH_FOUND' || m.status === 'READY').length, color: '#e8892a' },
            { label: 'Ordered', value: meals.filter(m => m.status === 'ORDERED').length, color: '#4db87a' },
          ].map(stat => (
            <div
              key={stat.label}
              className="p-5 rounded-xl text-center"
              style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-label mt-1" style={{ color: '#4f4840' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`chip ${filter === f.value ? 'chip-ember' : 'chip-dim'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🕐"
            title="No FutureMeals yet"
            description="Plan your first meal and let FutureMeal find the perfect match."
            ctaLabel="Plan a FutureMeal"
            ctaHref="/future-meals/new"
          />
        ) : (
          <div className="space-y-5">
            {filtered.map(meal => (
              <div
                key={meal.id}
                className="p-6 rounded-2xl"
                style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-start gap-4">
                  {/* Score */}
                  {meal.recommendationScore !== undefined && (
                    <div className="hidden sm:block flex-shrink-0">
                      <FutureMealScore score={meal.recommendationScore} size={72} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 style={{ fontFamily: '"Playfair Display",serif', color: '#f3ede0', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          {meal.title || meal.description}
                        </h3>
                        <div className="flex items-center gap-3">
                          <FutureMealStatusBadge status={meal.status} />
                          <span className="chip chip-dim flex items-center gap-1 text-xs">
                            <Calendar className="w-3 h-3" /> {formatDate(meal.plannedDate)}
                          </span>
                          <span className="chip chip-dim flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" /> {meal.plannedTime}
                          </span>
                        </div>
                      </div>
                      <span style={{ color: '#e8892a', fontWeight: 700, fontSize: '1rem', fontFamily: '"DM Sans",sans-serif' }}>
                        ≤ {formatCurrency(meal.maxBudget)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm mt-3 line-clamp-2" style={{ color: '#625a50', lineHeight: 1.6 }}>
                      {meal.description}
                    </p>

                    {/* Recommendation */}
                    {meal.recommendedFoodItem && (
                      <div
                        className="mt-3 px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(232,137,42,0.06)', border: '1px solid rgba(232,137,42,0.1)' }}
                      >
                        <p className="text-xs mb-1" style={{ color: '#625a50' }}>RECOMMENDED</p>
                        <p style={{ color: '#f3ede0', fontWeight: 600, fontSize: '0.9375rem' }}>{meal.recommendedFoodItem.name}</p>
                        {meal.recommendedRestaurant && (
                          <p className="text-xs mt-0.5" style={{ color: '#e8892a' }}>{meal.recommendedRestaurant.name}</p>
                        )}
                        {meal.recommendationReason && (
                          <p className="text-xs mt-1" style={{ color: '#4f4840' }}>{meal.recommendationReason}</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {(meal.status === 'PLANNED' || meal.status === 'MATCH_FOUND') && (
                        <button
                          onClick={() => handleEvaluate(meal.id)}
                          disabled={actionLoading === meal.id}
                          className="btn-ghost-ember text-xs px-4 py-2 flex items-center gap-1.5"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                          <RefreshCw className={`w-3 h-3 ${actionLoading === meal.id ? 'animate-spin' : ''}`} />
                          Evaluate
                        </button>
                      )}
                      {meal.status === 'READY' && (
                        <button
                          onClick={() => handleOrder(meal.id)}
                          disabled={actionLoading === meal.id}
                          className="btn-ember text-xs"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                          Order Now
                        </button>
                      )}
                      {['PLANNED', 'MATCH_FOUND', 'READY'].includes(meal.status) && (
                        <button
                          onClick={() => handleCancel(meal.id)}
                          disabled={actionLoading === meal.id}
                          className="btn-surface text-xs"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#e07070', borderColor: 'rgba(180,50,50,0.2)' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
