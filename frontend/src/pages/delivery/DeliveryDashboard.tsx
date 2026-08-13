import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { AmbientBackground } from '../../components/ui/AmbientBackground';
import { EmptyState } from '../../components/ui/EmptyState';
import { extractError } from '../../services/api';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function DeliveryDashboard() {
  const [available, setAvailable] = useState<Order[]>([]);
  const [active, setActive] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    orderService.getAvailableDeliveries()
      .then(data => setAvailable(data))
      .catch(err => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (orderId: number) => {
    setActionId(orderId);
    try {
      const order = await orderService.acceptDelivery(orderId);
      setActive(order);
      setAvailable(prev => prev.filter(o => o.id !== orderId));
      toast.success('Delivery accepted!');
    } catch (err) { toast.error(extractError(err)); }
    finally { setActionId(null); }
  };

  const handleMarkDelivered = async () => {
    if (!active) return;
    setActionId(active.id);
    try {
      const updated = await orderService.updateDeliveryStatus(active.id, 'DELIVERED');
      setActive(null);
      toast.success('Delivery completed!');
    } catch (err) { toast.error(extractError(err)); }
    finally { setActionId(null); }
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="warm" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 pb-16">
        <div className="py-10">
          <p className="text-label mb-3" style={{ color: '#e8892a' }}>DELIVERY PARTNER</p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,5vw,3rem)', color: '#f3ede0', fontWeight: 700 }}>
            Deliveries
          </h1>
        </div>

        {/* Active delivery */}
        {active && (
          <div
            className="p-6 rounded-2xl mb-8"
            style={{ background: 'linear-gradient(135deg, rgba(232,137,42,0.08), rgba(200,110,16,0.04))', border: '1px solid rgba(232,137,42,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full animate-glow-pulse" style={{ background: '#e8892a' }} />
              <p className="text-label" style={{ color: '#e8892a' }}>ACTIVE DELIVERY</p>
            </div>
            <h3 style={{ fontFamily: '"Playfair Display",serif', color: '#f3ede0', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {active.restaurantName}
            </h3>
            <div className="flex items-center gap-2 mb-2" style={{ color: '#625a50', fontSize: '0.875rem' }}>
              <MapPin className="w-4 h-4" />
              <span>{active.deliveryAddress.street}, {active.deliveryAddress.area}, {active.deliveryAddress.city}</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span style={{ color: '#e8892a', fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(active.total)}</span>
              <button
                onClick={handleMarkDelivered}
                disabled={actionId === active.id}
                className="btn-ember flex items-center gap-2"
                style={{ padding: '0.625rem 1.25rem' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                {actionId === active.id ? 'Updating…' : 'Mark Delivered'}
              </button>
            </div>
          </div>
        )}

        {/* Available deliveries */}
        <h2 className="text-label mb-5" style={{ color: '#625a50' }}>AVAILABLE DELIVERIES</h2>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        ) : available.length === 0 && !active ? (
          <EmptyState emoji="🛵" title="No deliveries available" description="Check back soon for new delivery requests." />
        ) : available.length === 0 ? (
          <p style={{ color: '#625a50', fontSize: '0.875rem' }}>No other deliveries available right now.</p>
        ) : (
          <div className="space-y-4">
            {available.map(order => (
              <div key={order.id} className="p-5 rounded-2xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 style={{ color: '#f3ede0', fontWeight: 500, marginBottom: '0.25rem' }}>{order.restaurantName}</h3>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#625a50' }}>
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{order.deliveryAddress.area}, {order.deliveryAddress.city}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#4f4840' }}>
                      {order.items.length} item(s) · {order.estimatedDeliveryTime} min
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span style={{ color: '#e8892a', fontWeight: 700 }}>{formatCurrency(order.total)}</span>
                    <button
                      onClick={() => handleAccept(order.id)}
                      disabled={!!active || actionId === order.id}
                      className="btn-ember text-sm"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                    >
                      {actionId === order.id ? 'Accepting…' : 'Accept'}
                    </button>
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
