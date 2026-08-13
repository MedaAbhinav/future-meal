import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Star, Clock, Package, ToggleLeft, Trash2, Plus } from 'lucide-react';
import { Restaurant, FoodItem, Order, RestaurantStats } from '../../types';
import { restaurantService } from '../../services/restaurantService';
import { foodService } from '../../services/foodService';
import { orderService } from '../../services/orderService';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { AmbientBackground } from '../../components/ui/AmbientBackground';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { extractError } from '../../services/api';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { PLACEHOLDER_FOOD } from '../../utils/images';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'menu' | 'orders';

export default function RestaurantDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rest, st, orderList] = await Promise.all([
        restaurantService.getMyRestaurant(),
        restaurantService.getRestaurantStats(),
        orderService.getRestaurantOrders(),
      ]);
      setRestaurant(rest);
      setStats(st);
      setOrders(orderList);
      const foodList = await restaurantService.getRestaurantFoods(rest.id);
      setFoods(foodList);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggleFood = async (id: number, available: boolean) => {
    try {
      await foodService.toggleFoodAvailability(id, !available);
      setFoods(prev => prev.map(f => f.id === id ? { ...f, isAvailable: !available } : f));
    } catch (err) { toast.error(extractError(err)); }
  };

  const handleDeleteFood = async (id: number) => {
    try {
      await foodService.deleteFood(id);
      setFoods(prev => prev.filter(f => f.id !== id));
      toast.success('Food item removed');
    } catch (err) { toast.error(extractError(err)); }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      toast.success('Order status updated');
    } catch (err) { toast.error(extractError(err)); }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'menu',     label: 'Menu'     },
    { id: 'orders',   label: 'Orders'   },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="warm" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
        {/* Header */}
        <div className="py-10">
          <p className="text-label mb-3" style={{ color: '#e8892a' }}>RESTAURANT</p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#f3ede0', fontWeight: 700 }}>
            {restaurant?.name || 'Dashboard'}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                fontFamily: '"DM Sans",sans-serif',
                background: tab === t.id ? 'rgba(232,137,42,0.12)' : 'transparent',
                color: tab === t.id ? '#e8892a' : '#625a50',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
              </div>
            ) : stats && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Today Orders', value: stats.todayOrders, color: '#e8892a' },
                    { label: 'Today Revenue', value: stats.todayRevenue, color: '#e8a820', prefix: '₹' },
                    { label: 'Active Orders', value: stats.activeOrders, color: '#4db87a' },
                    { label: 'Avg Rating', value: stats.averageRating, color: '#b3ac9f', decimals: 1, suffix: '★' },
                  ].map(stat => (
                    <div key={stat.label} className="p-5 rounded-2xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.75rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>
                        <AnimatedCounter target={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} decimals={stat.decimals || 0} />
                      </div>
                      <p className="text-xs mt-1.5" style={{ color: '#7a7165' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Popular items */}
                {stats.popularItems && stats.popularItems.length > 0 && (
                  <div className="p-6 rounded-2xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h2 className="text-label mb-5" style={{ color: '#625a50' }}>POPULAR ITEMS</h2>
                    <div className="space-y-3">
                      {stats.popularItems.slice(0, 5).map(item => (
                        <div key={item.foodItemId} className="flex items-center gap-4">
                          <img src={item.foodItemImage || PLACEHOLDER_FOOD} alt={item.foodItemName}
                            className="w-10 h-10 rounded-xl object-cover" onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_FOOD; }} />
                          <div className="flex-1">
                            <p style={{ color: '#f3ede0', fontSize: '0.9375rem' }}>{item.foodItemName}</p>
                            <p className="text-xs" style={{ color: '#625a50' }}>{item.orderCount} orders</p>
                          </div>
                          <span style={{ color: '#e8892a', fontWeight: 700 }}>{formatCurrency(item.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Menu */}
        {tab === 'menu' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p style={{ color: '#625a50', fontSize: '0.875rem' }}>{foods.length} items on your menu</p>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
            ) : (
              <div className="space-y-3">
                {foods.map(food => (
                  <div key={food.id} className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img src={food.image || PLACEHOLDER_FOOD} alt={food.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_FOOD; }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ color: '#f3ede0', fontWeight: 500 }}>{food.name}</p>
                      <p className="text-xs" style={{ color: '#e8892a', fontWeight: 600 }}>{formatCurrency(food.price)}</p>
                    </div>
                    <span className={`chip ${food.isAvailable ? 'chip-green' : 'chip-dim'} text-xs`}>
                      {food.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleFood(food.id, food.isAvailable)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                        style={{ color: food.isAvailable ? '#4db87a' : '#625a50', background: 'rgba(255,255,255,0.04)' }}>
                        <ToggleLeft className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteFood(food.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg"
                        style={{ color: '#e07070', background: 'rgba(255,255,255,0.04)' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
            ) : orders.length === 0 ? (
              <p style={{ color: '#625a50' }}>No orders yet.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="p-5 rounded-2xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p style={{ fontFamily: '"DM Mono",monospace', color: '#625a50', fontSize: '0.75rem' }}>#{order.orderNumber}</p>
                      <p style={{ color: '#f3ede0', fontWeight: 500, marginTop: '0.25rem' }}>
                        {order.items.map(i => `${i.foodItemName} ×${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span style={{ color: '#e8892a', fontWeight: 700 }}>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                  {/* Status update buttons */}
                  {order.status === 'CONFIRMED' && (
                    <button onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')} className="btn-ghost-ember text-xs" style={{ padding: '0.4rem 0.8rem' }}>
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')} className="btn-ghost-ember text-xs" style={{ padding: '0.4rem 0.8rem' }}>
                      Mark Ready
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
