import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import { Restaurant } from '../../types';
import { PLACEHOLDER_RESTAURANT } from '../../utils/images';
import { formatCurrency } from '../../utils/formatters';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link to={`/restaurants/${restaurant.id}`} className="block group">
      <div
        className="overflow-hidden rounded-xl transition-all duration-350"
        style={{
          background: '#1c1814',
          border: '1px solid rgba(255,255,255,0.05)',
          transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(232,137,42,0.18)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(232,137,42,0.1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        {/* Cover image */}
        <div className="relative overflow-hidden" style={{ height: '13rem' }}>
          <img
            src={imgError ? PLACEHOLDER_RESTAURANT : (restaurant.coverImage || PLACEHOLDER_RESTAURANT)}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
            style={{ filter: 'brightness(0.75) saturate(0.9)' }}
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(14,12,10,0.95) 0%, rgba(14,12,10,0.3) 60%, transparent 100%)' }}
          />

          {/* Status badge */}
          {!restaurant.isOpen && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <span className="chip chip-dim">Closed</span>
            </div>
          )}

          {/* Offer badge */}
          {restaurant.offers && restaurant.offers.length > 0 && (
            <div className="absolute top-3 left-3">
              <span className="chip chip-green" style={{ fontSize: '0.65rem' }}>🏷 OFFER</span>
            </div>
          )}

          {/* Rating */}
          <div className="absolute top-3 right-3">
            <span className="chip chip-ember flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {restaurant.rating.toFixed(1)}
            </span>
          </div>

          {/* Bottom name */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3
              className="font-semibold mb-0.5"
              style={{ fontFamily: '"Playfair Display",serif', color: '#f3ede0', fontSize: '1.0625rem', lineHeight: 1.2 }}
            >
              {restaurant.name}
            </h3>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Cuisines */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {restaurant.cuisines.slice(0, 3).map(c => (
              <span key={c} className="chip chip-dim" style={{ fontSize: '0.7rem' }}>{c}</span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" style={{ color: '#7a7165', fontSize: '0.8rem', fontFamily: '"DM Sans",sans-serif' }}>
                <Clock className="w-3.5 h-3.5" />
                {restaurant.deliveryTime} min
              </span>
              <span style={{ color: '#4f4840', fontSize: '0.8rem' }}>
                {formatCurrency(restaurant.deliveryFee)} delivery
              </span>
            </div>
            <span style={{ color: '#4f4840', fontSize: '0.75rem', fontFamily: '"DM Sans",sans-serif' }}>
              Min {formatCurrency(restaurant.minimumOrder)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
