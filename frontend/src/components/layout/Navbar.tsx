import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Clock, User, LogOut, Menu, X, ChevronDown, Package, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been signed out successfully.');
    navigate('/');
  };

  const dashLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':            return '/admin';
      case 'RESTAURANT_OWNER': return '/restaurant-dashboard';
      case 'DELIVERY_PARTNER': return '/delivery';
      default:                 return '/profile';
    }
  };

  const isLanding = location.pathname === '/';

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled || !isLanding
            ? 'glass-nav py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-select">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#e8892a,#c96c10)', boxShadow: '0 0 12px rgba(232,137,42,0.3)' }}
            >
              🍛
            </div>
            <span style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.1rem', color: '#f3ede0', letterSpacing: '-0.01em' }}>
              Future<span style={{ color: '#e8892a' }}>Meal</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {[
              { label: 'Discover',     href: '/restaurants'  },
              { label: 'FutureMeal',   href: '/future-meals' },
              { label: 'Orders',       href: '/orders'       },
            ].map(item => {
              const active = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={clsx(
                    'px-4 py-1.5 rounded transition-all duration-200 text-sm',
                    item.label === 'FutureMeal'
                      ? 'text-ember font-medium'
                      : active
                        ? 'text-ivory'
                        : 'text-dim hover:text-ivory'
                  )}
                  style={{ fontFamily: '"DM Sans",sans-serif', letterSpacing: '0.005em' }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative flex items-center justify-center w-9 h-9 rounded transition-colors"
              style={{ color: '#7a7165' }}
              aria-label={`Cart (${itemCount} items)`}
              onMouseEnter={e => (e.currentTarget.style.color = '#f3ede0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#7a7165')}
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-white rounded-full text-[9px] font-bold"
                  style={{ background: '#e8892a', fontFamily: '"DM Sans",sans-serif' }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* FutureMeal CTA */}
            <Link
              to="/future-meals/new"
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded transition-all duration-300 text-sm font-medium"
              style={{
                background: 'rgba(232,137,42,0.1)',
                color: '#e8892a',
                border: '1px solid rgba(232,137,42,0.2)',
                fontFamily: '"DM Sans",sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(232,137,42,0.15)';
                e.currentTarget.style.boxShadow  = '0 0 20px rgba(232,137,42,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(232,137,42,0.1)';
                e.currentTarget.style.boxShadow  = 'none';
              }}
            >
              <Clock className="w-3.5 h-3.5" />
              Plan
            </Link>

            {/* User */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors"
                  style={{ color: '#7a7165' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f3ede0')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7a7165')}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(232,137,42,0.15)', color: '#e8892a', fontFamily: '"DM Sans",sans-serif' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden animate-fade-in"
                    style={{
                      background: '#1c1814',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-sm font-medium" style={{ color: '#e9e0cc', fontFamily: '"DM Sans",sans-serif' }}>
                        {user.name}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#625a50' }}>{user.email}</p>
                    </div>
                    {[
                      { icon: User,    label: 'Profile',    href: '/profile'    },
                      { icon: Package, label: 'Orders',     href: '/orders'     },
                      { icon: Clock,   label: 'FutureMeals',href: '/future-meals'},
                    ].map(item => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: '#7a7165', fontFamily: '"DM Sans",sans-serif' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#f3ede0')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#7a7165')}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                      </Link>
                    ))}
                    {user.role !== 'CUSTOMER' && (
                      <>
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                        <Link
                          to={dashLink()}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: '#e8892a', fontFamily: '"DM Sans",sans-serif' }}
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Dashboard
                        </Link>
                      </>
                    )}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors"
                      style={{ color: '#e07070', fontFamily: '"DM Sans",sans-serif' }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm transition-colors"
                  style={{ color: '#7a7165', fontFamily: '"DM Sans",sans-serif' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f3ede0')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7a7165')}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-ember text-sm px-5 py-2"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded transition-colors"
              style={{ color: '#7a7165' }}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden animate-fade-down"
            style={{
              background: '#141210',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="px-6 py-4 space-y-1">
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg mb-3"
                  style={{ background: 'rgba(232,137,42,0.06)', border: '1px solid rgba(232,137,42,0.1)' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'rgba(232,137,42,0.15)', color: '#e8892a' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#e9e0cc' }}>{user.name}</p>
                    <p className="text-xs" style={{ color: '#625a50' }}>{user.role.replace('_', ' ')}</p>
                  </div>
                </div>
              )}
              {[
                { label: 'Discover',    href: '/restaurants'   },
                { label: 'FutureMeal',  href: '/future-meals'  },
                { label: 'Orders',      href: '/orders'        },
                { label: 'Profile',     href: '/profile'       },
              ].map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex px-3 py-3 rounded-lg text-sm transition-colors"
                  style={{ color: '#7a7165', fontFamily: '"DM Sans",sans-serif' }}
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="flex px-3 py-3 rounded-lg text-sm" style={{ color: '#7a7165' }}>Sign In</Link>
                  <Link to="/register" className="btn-ember w-full justify-center text-sm">Get Started</Link>
                </>
              )}
              {isAuthenticated && (
                <button onClick={handleLogout} className="flex px-3 py-3 rounded-lg text-sm w-full" style={{ color: '#e07070' }}>
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
