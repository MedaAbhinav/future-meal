import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { DietaryBadge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { PLACEHOLDER_FOOD } from '../../utils/images';

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;

export function CartDrawer() {
  const { isOpen, toggleCart, items, updateQuantity, removeItem, clearCart, subtotal, restaurantName } = useCart();

  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + delivery + tax;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100]"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={toggleCart}
        />
      )}

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full z-[101] flex flex-col"
        style={{
          width: 400,
          maxWidth: '95vw',
          background: '#141210',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: isOpen ? '-24px 0 64px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h2 style={{ fontFamily: '"Playfair Display",serif', color: '#f3ede0', fontSize: '1.125rem', fontWeight: 600 }}>
              Your Cart
            </h2>
            {restaurantName && (
              <p className="text-xs mt-0.5" style={{ color: '#625a50', fontFamily: '"DM Sans",sans-serif' }}>
                {restaurantName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                style={{ color: '#e07070', background: 'rgba(180,50,50,0.08)', border: '1px solid rgba(180,50,50,0.12)' }}
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
            <button
              onClick={toggleCart}
              className="w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ color: '#7a7165', background: 'rgba(255,255,255,0.04)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-16">
              <ShoppingBag className="w-12 h-12 mb-4" style={{ color: '#3c3630' }} />
              <h3 style={{ fontFamily: '"Playfair Display",serif', color: '#625a50', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                Your cart is empty
              </h3>
              <p style={{ color: '#4f4840', fontFamily: '"DM Sans",sans-serif', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Explore restaurants and add something delicious.
              </p>
              <Link to="/restaurants" onClick={toggleCart} className="btn-ember text-sm px-5 py-2.5">
                Explore Restaurants
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.foodItemId}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <img
                  src={item.foodItemImage || PLACEHOLDER_FOOD}
                  alt={item.foodItemName}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_FOOD; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <DietaryBadge type={item.dietaryType as 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN' | 'JAIN'} />
                    <span className="text-sm font-medium truncate" style={{ color: '#e9e0cc', fontFamily: '"DM Sans",sans-serif' }}>
                      {item.foodItemName}
                    </span>
                  </div>
                  <span style={{ color: '#e8892a', fontSize: '0.875rem', fontWeight: 600 }}>
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 flex-shrink-0"
                  style={{ background: 'rgba(232,137,42,0.08)', border: '1px solid rgba(232,137,42,0.15)' }}
                >
                  <button
                    onClick={() => { if (item.quantity <= 1) removeItem(item.foodItemId); else updateQuantity(item.foodItemId, item.quantity - 1); }}
                    className="w-5 h-5 flex items-center justify-center"
                    style={{ color: '#e8892a' }}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span style={{ color: '#f3ede0', fontWeight: 600, minWidth: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.foodItemId, item.quantity + 1)}
                    className="w-5 h-5 flex items-center justify-center"
                    style={{ color: '#e8892a' }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary & CTA */}
        {items.length > 0 && (
          <div
            className="px-5 py-5 flex-shrink-0 space-y-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#1c1814' }}
          >
            <div className="space-y-2">
              {[
                { label: 'Subtotal', value: formatCurrency(subtotal) },
                { label: 'Delivery', value: formatCurrency(delivery) },
                { label: 'Taxes (5%)', value: formatCurrency(tax) },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span style={{ color: '#625a50', fontSize: '0.875rem', fontFamily: '"DM Sans",sans-serif' }}>{row.label}</span>
                  <span style={{ color: '#b3ac9f', fontSize: '0.875rem' }}>{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#f3ede0', fontWeight: 600, fontFamily: '"DM Sans",sans-serif' }}>Total</span>
                <span style={{ color: '#e8892a', fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(total)}</span>
              </div>
            </div>
            <Link to="/checkout" onClick={toggleCart} className="btn-ember w-full justify-center">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
