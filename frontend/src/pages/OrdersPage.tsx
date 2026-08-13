import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/orderService';
import { OrderStatusBadge } from '../components/ui/Badge';
import { OrderCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { extractError } from '../services/api';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { PLACEHOLDER_RESTAURANT } from '../utils/images';
import toast from 'react-hot-toast';

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    orderService.getMyOrders(0, 20)
      .then(data => setOrders(data.content))
      .catch(err => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (!filter) return true;
    if (filter === 'ACTIVE') return !['DELIVERED','CANCELLED'].includes(o.status);
    if (filter === 'DELIVERED') return o.status === 'DELIVERED';
    if (filter === 'CANCELLED') return o.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="subtle" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 pb-16">
        <div className="py-10">
          <p className="text-label mb-3" style={{ color: '#e8892a' }}>HISTORY</p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.8rem,4vw,3rem)', color: '#f3ede0', fontWeight: 700 }}>
            Your Orders
          </h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`chip ${filter === f.value ? 'chip-ember' : 'chip-dim'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="📦"
            title="No orders yet"
            description="When you place an order it will appear here."
            ctaLabel="Start Exploring"
            ctaHref="/restaurants"
          />
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block">
                <div
                  className="p-5 rounded-xl transition-all duration-300"
                  style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.09)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={order.restaurantLogo || PLACEHOLDER_RESTAURANT}
                      alt={order.restaurantName}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                      onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_RESTAURANT; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold" style={{ fontFamily: '"Playfair Display",serif', color: '#f3ede0', fontSize: '1rem' }}>
                            {order.restaurantName}
                          </h3>
                          <p className="text-xs mt-0.5" style={{ color: '#4f4840', fontFamily: '"DM Mono",monospace' }}>
                            #{order.orderNumber}
                          </p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>

                      <p className="text-sm mt-2 line-clamp-1" style={{ color: '#625a50' }}>
                        {order.items.map(i => `${i.foodItemName} ×${i.quantity}`).join(', ')}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <span style={{ color: '#e8892a', fontWeight: 700, fontSize: '1rem' }}>
                          {formatCurrency(order.total)}
                        </span>
                        <span style={{ color: '#4f4840', fontSize: '0.75rem', fontFamily: '"DM Sans",sans-serif' }}>
                          {formatRelativeTime(order.placedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
