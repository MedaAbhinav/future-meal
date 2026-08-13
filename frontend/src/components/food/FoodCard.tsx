import React, { useState } from 'react';
import { Clock, Plus, Minus } from 'lucide-react';
import { FoodItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { DietaryBadge } from '../ui/Badge';
import { PLACEHOLDER_FOOD } from '../../utils/images';
import { formatCurrency } from '../../utils/formatters';

interface FoodCardProps {
  food: FoodItem;
  variant?: 'vertical' | 'horizontal';
}

export function FoodCard({ food, variant = 'vertical' }: FoodCardProps) {
  const { addItem, removeItem, updateQuantity, getItemQuantity } = useCart();
  const qty = getItemQuantity(food.id);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    if (qty === 0) addItem(food, 1);
    else updateQuantity(food.id, qty + 1);
  };
  const handleRemove = () => {
    if (qty <= 1) removeItem(food.id);
    else updateQuantity(food.id, qty - 1);
  };

  if (variant === 'horizontal') {
    return (
      <div
        className="flex gap-4 p-4 rounded-xl transition-all duration-300"
        style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Image */}
        <div className="relative w-28 h-24 flex-shrink-0 rounded-xl overflow-hidden">
          <img
            src={imgError ? PLACEHOLDER_FOOD : (food.image || PLACEHOLDER_FOOD)}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          {food.isBestseller && (
            <div className="absolute top-1.5 left-1.5">
              <span className="chip chip-gold" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>BEST</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <DietaryBadge type={food.dietaryType} />
                <h3 className="text-sm font-medium truncate" style={{ color: '#f3ede0', fontFamily: '"Playfair Display",serif' }}>
                  {food.name}
                </h3>
              </div>
              <p className="text-xs line-clamp-2" style={{ color: '#625a50', fontFamily: '"DM Sans",sans-serif', lineHeight: 1.5 }}>
                {food.description}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span style={{ color: '#e8892a', fontFamily: '"DM Sans",sans-serif', fontWeight: 600, fontSize: '0.875rem' }}>
                  {formatCurrency(food.price)}
                </span>
                {food.originalPrice && food.originalPrice > food.price && (
                  <span style={{ color: '#4f4840', textDecoration: 'line-through', fontSize: '0.75rem' }}>
                    {formatCurrency(food.originalPrice)}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs" style={{ color: '#4f4840' }}>
                  <Clock className="w-3 h-3" /> {food.preparationTime}m
                </span>
              </div>
            </div>
            {/* Controls */}
            <div className="flex-shrink-0">
              {qty === 0 ? (
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: 'rgba(232,137,42,0.1)', color: '#e8892a', border: '1px solid rgba(232,137,42,0.2)' }}
                >
                  <Plus className="w-3 h-3" /> ADD
                </button>
              ) : (
                <div
                  className="flex items-center gap-2 rounded-lg px-2 py-1"
                  style={{ background: 'rgba(232,137,42,0.1)', border: '1px solid rgba(232,137,42,0.2)' }}
                >
                  <button onClick={handleRemove} className="w-5 h-5 flex items-center justify-center" style={{ color: '#e8892a' }}>
                    <Minus className="w-3 h-3" />
                  </button>
                  <span style={{ color: '#f3ede0', fontWeight: 600, minWidth: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{qty}</span>
                  <button onClick={handleAdd} className="w-5 h-5 flex items-center justify-center" style={{ color: '#e8892a' }}>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vertical variant (default)
  return (
    <div className="card-dark card-glow overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '11rem' }}>
        <img
          src={imgError ? PLACEHOLDER_FOOD : (food.image || PLACEHOLDER_FOOD)}
          alt={food.name}
          className="w-full h-full object-cover transition-transform duration-500"
          onError={() => setImgError(true)}
          loading="lazy"
          style={{ filter: 'brightness(0.85) saturate(0.95)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,12,10,0.8) 0%, transparent 50%)' }} />
        {food.isBestseller && (
          <div className="absolute top-3 left-3">
            <span className="chip chip-gold" style={{ fontSize: '0.65rem' }}>BESTSELLER</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <DietaryBadge type={food.dietaryType} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-semibold mb-1 line-clamp-1"
          style={{ fontFamily: '"Playfair Display",serif', color: '#f3ede0', fontSize: '1rem' }}
        >
          {food.name}
        </h3>
        <p className="text-xs line-clamp-2 flex-1" style={{ color: '#625a50', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          {food.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span style={{ color: '#e8892a', fontWeight: 700, fontSize: '1rem', fontFamily: '"DM Sans",sans-serif' }}>
              {formatCurrency(food.price)}
            </span>
            {food.originalPrice && food.originalPrice > food.price && (
              <span className="ml-1.5 text-xs" style={{ color: '#4f4840', textDecoration: 'line-through' }}>
                {formatCurrency(food.originalPrice)}
              </span>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" style={{ color: '#4f4840' }} />
              <span style={{ color: '#4f4840', fontSize: '0.7rem' }}>{food.preparationTime} min</span>
            </div>
          </div>

          {qty === 0 ? (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(232,137,42,0.1)', color: '#e8892a', border: '1px solid rgba(232,137,42,0.2)' }}
            >
              <Plus className="w-3 h-3" /> ADD
            </button>
          ) : (
            <div
              className="flex items-center gap-2 rounded-lg px-2 py-1"
              style={{ background: 'rgba(232,137,42,0.1)', border: '1px solid rgba(232,137,42,0.2)' }}
            >
              <button onClick={handleRemove} className="w-5 h-5 flex items-center justify-center" style={{ color: '#e8892a' }}>
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span style={{ color: '#f3ede0', fontWeight: 600, minWidth: '1rem', textAlign: 'center' }}>{qty}</span>
              <button onClick={handleAdd} className="w-5 h-5 flex items-center justify-center" style={{ color: '#e8892a' }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
