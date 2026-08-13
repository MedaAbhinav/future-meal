import React, { useState, useEffect } from 'react';
import { Users, Store, ShoppingBag, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { AdminStats } from '../../types';
import { adminService } from '../../services/adminService';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { AmbientBackground } from '../../components/ui/AmbientBackground';
import { RevealOnScroll } from '../../components/ui/RevealOnScroll';
import { extractError } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const NAV_GRID = [
  { label: 'Users',        href: '#', icon: <Users className="w-6 h-6" />,       color: '#e8892a' },
  { label: 'Restaurants',  href: '#', icon: <Store className="w-6 h-6" />,        color: '#e8a820' },
  { label: 'Orders',       href: '#', icon: <ShoppingBag className="w-6 h-6" />, color: '#4db87a' },
  { label: 'FutureMeals',  href: '#', icon: <Clock className="w-6 h-6" />,       color: '#b3ac9f' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .catch(err => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="warm" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
        {/* Header */}
        <div className="py-10">
          <p className="text-label mb-3" style={{ color: '#e8892a' }}>ADMIN</p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#f3ede0', fontWeight: 700 }}>
            Dashboard
          </h1>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Users",       value: stats.totalUsers,          icon: <Users className="w-5 h-5" />,       color: '#e8892a' },
              { label: "Restaurants",       value: stats.totalRestaurants,    icon: <Store className="w-5 h-5" />,        color: '#e8a820' },
              { label: "Total Orders",      value: stats.totalOrders,         icon: <ShoppingBag className="w-5 h-5" />, color: '#4db87a' },
              { label: "Active Orders",     value: stats.activeOrders,        icon: <Clock className="w-5 h-5" />,       color: '#b3ac9f' },
              { label: "Today Orders",      value: stats.todayOrders,         icon: <TrendingUp className="w-5 h-5" />,  color: '#e8892a' },
              { label: "FutureMeals",       value: stats.futureMealsCreated,  icon: <Clock className="w-5 h-5" />,       color: '#e8a820' },
              { label: "FM Converted",      value: stats.futureMealsConverted,icon: <TrendingUp className="w-5 h-5" />, color: '#4db87a' },
              { label: "Today Revenue",     value: stats.todayRevenue,        icon: <DollarSign className="w-5 h-5" />, color: '#b3ac9f', isCurrency: true },
            ].map((stat, i) => (
              <RevealOnScroll key={stat.label} delay={i * 50}>
                <div
                  className="p-5 rounded-2xl"
                  style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</span>
                    <span className="text-label" style={{ color: '#4f4840' }}>TOTAL</span>
                  </div>
                  <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.75rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>
                    {stat.isCurrency ? (
                      `₹${(stat.value / 1000).toFixed(1)}k`
                    ) : (
                      <AnimatedCounter target={stat.value} />
                    )}
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: '#7a7165' }}>{stat.label}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        )}

        {/* Navigation grid */}
        <div className="mb-10">
          <h2 className="text-label mb-5" style={{ color: '#625a50' }}>MANAGEMENT</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {NAV_GRID.map(item => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300"
                style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(232,137,42,0.2)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(232,137,42,0.04)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLButtonElement).style.background = '#1c1814';
                }}
              >
                <span style={{ color: item.color }}>{item.icon}</span>
                <span style={{ fontFamily: '"DM Sans",sans-serif', color: '#b3ac9f', fontSize: '0.9rem', fontWeight: 500 }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Total revenue */}
        {stats && (
          <div className="p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(232,137,42,0.08), rgba(200,110,16,0.04))', border: '1px solid rgba(232,137,42,0.15)' }}>
            <p className="text-label mb-2" style={{ color: '#625a50' }}>TOTAL PLATFORM REVENUE</p>
            <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,5vw,4rem)', color: '#e8892a', fontWeight: 700 }}>
              <AnimatedCounter target={stats.totalRevenue} prefix="₹" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
