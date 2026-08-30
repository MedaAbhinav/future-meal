import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { extractError } from '../services/api';
import { DEMO_CREDENTIALS } from '../utils/seedData';

const HERO = 'https://images.unsplash.com/photo-1563379091339-03246963d96b?w=1200&q=80';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      // Personalized welcome — get the name from stored user
      const storedUser = JSON.parse(localStorage.getItem('futuremeal_user') || '{}');
      const firstName = storedUser?.name?.split(' ')[0] || 'there';
      toast.success(`Welcome back, ${firstName}! 🍛`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (creds: { email: string; password: string }) => {
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0e0c0a' }}>
      {/* Left panel – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 lg:px-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#e8892a,#c96c10)' }}
            >
              🍛
            </div>
            <span style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.2rem', color: '#f3ede0' }}>
              Future<span style={{ color: '#e8892a' }}>Meal</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#f3ede0', fontWeight: 700, marginBottom: '0.5rem' }}>
              Welcome back.
            </h1>
            <p style={{ color: '#625a50', fontFamily: '"DM Sans",sans-serif' }}>
              Your next meal is waiting.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-label block mb-2" style={{ color: '#7a7165' }}>EMAIL</label>
              <input
                type="email"
                className="input-dark"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-label block mb-2" style={{ color: '#7a7165' }}>PASSWORD</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-dark pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#625a50' }}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-ember w-full justify-center mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center" style={{ color: '#625a50', fontFamily: '"DM Sans",sans-serif', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#e8892a' }}>Create one</Link>
          </p>

          {/* Demo accounts */}
          <div
            className="mt-8 p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontFamily: '"DM Mono",monospace' }}
          >
            <p className="text-label mb-3" style={{ color: '#4f4840' }}>DEMO ACCOUNTS</p>
            <div className="space-y-2">
              {Object.entries(DEMO_CREDENTIALS).map(([role, creds]) => (
                <button
                  key={role}
                  onClick={() => fillDemo(creds)}
                  className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg transition-colors"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,137,42,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: '#625a50', fontSize: '0.75rem', textTransform: 'capitalize' }}>{role}</span>
                  <span style={{ color: '#4f4840', fontSize: '0.7rem' }}>{creds.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel – cinematic image */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src={HERO}
          alt="Delicious food"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.4) saturate(0.7)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(14,12,10,0.7), transparent)' }} />
        <div className="absolute bottom-12 left-10 right-10">
          <p style={{ fontFamily: '"Playfair Display",serif', color: '#f3ede0', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 }}>
            "Plan a meal today.<br />
            <em style={{ color: '#e8892a' }}>Your future self</em> will thank you."
          </p>
        </div>
      </div>
    </div>
  );
}
