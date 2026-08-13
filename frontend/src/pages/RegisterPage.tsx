import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { extractError } from '../services/api';
import { UserRole } from '../types';

const HERO = 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&q=80';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'CUSTOMER',          label: 'Customer' },
  { value: 'RESTAURANT_OWNER',  label: 'Restaurant Owner' },
  { value: 'DELIVERY_PARTNER',  label: 'Delivery Partner' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'CUSTOMER' as UserRole,
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0e0c0a' }}>
      {/* Right image (reversed for variety) */}
      <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0 relative overflow-hidden">
        <img
          src={HERO}
          alt="Food"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.35) saturate(0.7)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, rgba(14,12,10,0.6), transparent)' }} />
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 lg:px-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#e8892a,#c96c10)' }}>
              🍛
            </div>
            <span style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.2rem', color: '#f3ede0' }}>
              Future<span style={{ color: '#e8892a' }}>Meal</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#f3ede0', fontWeight: 700, marginBottom: '0.5rem' }}>
              Join FutureMeal.
            </h1>
            <p style={{ color: '#625a50', fontFamily: '"DM Sans",sans-serif' }}>Start planning smarter meals today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-label block mb-2" style={{ color: '#7a7165' }}>FULL NAME</label>
              <input className="input-dark" placeholder="Arjun Sharma" value={form.name} onChange={set('name')} required />
            </div>

            <div>
              <label className="text-label block mb-2" style={{ color: '#7a7165' }}>EMAIL</label>
              <input type="email" className="input-dark" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>

            <div>
              <label className="text-label block mb-2" style={{ color: '#7a7165' }}>PHONE</label>
              <input type="tel" className="input-dark" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} required />
            </div>

            <div>
              <label className="text-label block mb-2" style={{ color: '#7a7165' }}>PASSWORD</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-dark pr-12"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#625a50' }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-label block mb-2" style={{ color: '#7a7165' }}>I AM A</label>
              <select
                className="input-dark"
                value={form.role}
                onChange={set('role')}
                style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237a7165' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
              >
                {ROLE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: '#1c1814', color: '#f3ede0' }}>{o.label}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-ember w-full justify-center mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center" style={{ color: '#625a50', fontFamily: '"DM Sans",sans-serif', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#e8892a' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
