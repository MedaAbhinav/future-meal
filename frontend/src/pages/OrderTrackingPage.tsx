import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Loader, X } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/orderService';
import { OrderStatusBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { extractError } from '../services/api';
import { formatCurrency, formatRelativeTime, formatDateTime } from '../utils/formatters';
import { PLACEHOLDER_RESTAURANT } from '../utils/images';
import toast from 'react-hot-toast';

const STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'ORDER_PLACED',       label: 'Order Placed',       icon: '📝' },
  { status: 'CONFIRMED',          label: 'Confirmed',          icon: '✅' },
  { status: 'PREPARING',          label: 'Preparing',          icon: '👨‍🍳' },
  { status: 'READY_FOR_PICKUP',   label: 'Ready for Pickup',   icon: '📦' },
  { status: 'OUT_FOR_DELIVERY',   label: 'Out for Delivery',   icon: '🛵' },
  { status: 'DELIVERED',          label: 'Delivered',          icon: '🎉' },
];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) { navigate('/orders'); return; }
    orderService.getOrderById(parseInt(id, 10))
      .then(setOrder)
      .catch(err => { toast.error(extractError(err)); navigate('/orders'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const currentStepIndex = STEPS.findIndex(s => s.status === order?.status);
  const isCancellable = order && ['ORDER_PLACED', 'CONFIRMED'].includes(order.status);

  const handleCancel = async () => {
    if (!order || !cancelReason.trim()) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(order.id, cancelReason);
      setOrder(updated);
      setCancelOpen(false);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: '#0e0c0a' }}>
        <div className="skeleton w-full max-w-2xl mx-6 h-96 rounded-2xl" />
      </div>
    );
  }
  if (!order) return null;

  const subtotal = order.subtotal;
  const delivery = order.deliveryFee;
  const tax = order.taxes;
  const discount = order.discount;

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="subtle" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 pb-16">
        <div className="py-10">
          <p className="text-label mb-3" style={{ color: '#e8892a' }}>ORDER TRACKING</p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.5rem,3vw,2.5rem)', color: '#f3ede0', fontWeight: 700 }}>
            {order.restaurantName}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span style={{ color: '#4f4840', fontFamily: '"DM Mono",monospace', fontSize: '0.8125rem' }}>#{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* Timeline */}
        {order.status !== 'CANCELLED' && (
          <div
            className="p-6 rounded-2xl mb-6"
            style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <h2 className="text-label mb-6" style={{ color: '#625a50' }}>TIMELINE</h2>
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-[21px] top-0 bottom-0 w-px"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
              <div className="space-y-6">
                {STEPS.map((step, i) => {
                  const isDone   = i < currentStepIndex;
                  const isActive = i === currentStepIndex;
                  const isPending = i > currentStepIndex;
                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      {/* Node */}
                      <div
                        className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-lg transition-all"
                        style={{
                          background: isDone ? 'rgba(232,137,42,0.15)' : isActive ? 'rgba(232,137,42,0.1)' : 'rgba(255,255,255,0.03)',
                          border: isDone ? '2px solid rgba(232,137,42,0.4)' : isActive ? '2px solid rgba(232,137,42,0.6)' : '2px solid rgba(255,255,255,0.06)',
                          boxShadow: isActive ? '0 0 20px rgba(232,137,42,0.25)' : 'none',
                          animation: isActive ? 'glowPulse 2s ease-in-out infinite' : 'none',
                        }}
                      >
                        {step.icon}
                      </div>
                      <div className="pt-2">
                        <p style={{ color: isDone ? '#e8892a' : isActive ? '#f3ede0' : '#4f4840', fontFamily: '"DM Sans",sans-serif', fontWeight: isDone || isActive ? 600 : 400 }}>
                          {step.label}
                        </p>
                        {isActive && (
                          <p className="text-xs mt-0.5" style={{ color: '#625a50' }}>In progress…</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Cancelled banner */}
        {order.status === 'CANCELLED' && (
          <div className="p-4 rounded-xl mb-6 flex items-center gap-3" style={{ background: 'rgba(180,50,50,0.08)', border: '1px solid rgba(180,50,50,0.15)' }}>
            <X className="w-5 h-5 flex-shrink-0" style={{ color: '#e07070' }} />
            <div>
              <p style={{ color: '#e07070', fontWeight: 600, fontSize: '0.9375rem' }}>Order Cancelled</p>
              {order.cancellationReason && (
                <p className="text-sm mt-0.5" style={{ color: '#625a50' }}>{order.cancellationReason}</p>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="p-6 rounded-2xl mb-6" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-label mb-4" style={{ color: '#625a50' }}>ITEMS</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold"
                    style={{ background: 'rgba(232,137,42,0.1)', color: '#e8892a' }}>
                    {item.quantity}
                  </span>
                  <span style={{ color: '#b3ac9f', fontFamily: '"DM Sans",sans-serif', fontSize: '0.9rem' }}>{item.foodItemName}</span>
                </div>
                <span style={{ color: '#7a7165', fontSize: '0.875rem' }}>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { label: 'Subtotal', value: formatCurrency(subtotal) },
              { label: 'Delivery', value: formatCurrency(delivery) },
              { label: 'Taxes',    value: formatCurrency(tax)      },
              ...(discount > 0 ? [{ label: 'Discount', value: `-${formatCurrency(discount)}` }] : []),
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span style={{ color: '#625a50', fontSize: '0.875rem' }}>{row.label}</span>
                <span style={{ color: '#b3ac9f', fontSize: '0.875rem' }}>{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#f3ede0', fontWeight: 600 }}>Total</span>
              <span style={{ color: '#e8892a', fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {isCancellable && (
          <button onClick={() => setCancelOpen(true)} className="btn-surface w-full justify-center" style={{ color: '#e07070', borderColor: 'rgba(180,50,50,0.2)' }}>
            Cancel Order
          </button>
        )}
      </div>

      <Modal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Order">
        <p style={{ color: '#625a50', marginBottom: '1rem', fontSize: '0.9rem' }}>Please tell us why you'd like to cancel.</p>
        <textarea
          className="input-dark resize-none mb-4"
          rows={3}
          placeholder="Reason for cancellation…"
          value={cancelReason}
          onChange={e => setCancelReason(e.target.value)}
        />
        <div className="flex gap-3">
          <button onClick={() => setCancelOpen(false)} className="btn-surface flex-1">Keep Order</button>
          <button
            onClick={handleCancel}
            disabled={cancelling || !cancelReason.trim()}
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-all"
            style={{ background: 'rgba(180,50,50,0.15)', color: '#e07070', border: '1px solid rgba(180,50,50,0.2)' }}
          >
            {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
