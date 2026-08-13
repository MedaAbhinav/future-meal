import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Check, X, MapPin, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Address, DietaryPreference, SpiceLevel } from '../types';
import { addressService } from '../services/addressService';
import { authService } from '../services/authService';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { extractError } from '../services/api';
import { getInitials } from '../utils/formatters';
import toast from 'react-hot-toast';

const DIETARY_OPTIONS: DietaryPreference[] = ['VEG', 'NON_VEG', 'VEGAN', 'JAIN'];
const SPICE_OPTIONS: SpiceLevel[] = ['MILD', 'MEDIUM', 'SPICY', 'EXTRA_SPICY'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dietaryPreference: (user?.dietaryPreference || 'NON_VEG') as DietaryPreference,
    spicePreference: (user?.spicePreference || 'MEDIUM') as SpiceLevel,
  });

  useEffect(() => {
    addressService.getAddresses()
      .then(setAddresses)
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile(form);
      updateUser(updated);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await addressService.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address removed');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="warm" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 pb-16">
        <div className="py-10">
          <p className="text-label mb-3" style={{ color: '#e8892a' }}>ACCOUNT</p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.8rem,4vw,3rem)', color: '#f3ede0', fontWeight: 700 }}>
            Your Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile card */}
          <div
            className="p-6 rounded-2xl text-center lg:col-span-1"
            style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)', alignSelf: 'start' }}
          >
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(232,137,42,0.2), rgba(200,110,16,0.3))', color: '#e8892a', border: '2px solid rgba(232,137,42,0.2)' }}
            >
              {getInitials(user.name)}
            </div>
            <h2 style={{ fontFamily: '"Playfair Display",serif', color: '#f3ede0', fontSize: '1.25rem', fontWeight: 600 }}>
              {user.name}
            </h2>
            <p className="text-xs mt-1" style={{ color: '#625a50' }}>{user.email}</p>
            <span className="chip chip-dim mt-3 inline-block">{user.role.replace('_', ' ')}</span>

            {/* Quick links */}
            <div className="mt-6 pt-5 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { label: 'My Orders', href: '/orders' },
                { label: 'FutureMeals', href: '/future-meals' },
              ].map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center justify-between p-3 rounded-xl text-sm transition-all"
                  style={{ color: '#7a7165', background: 'rgba(255,255,255,0.02)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#e8892a'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#7a7165'; }}
                >
                  {link.label}
                  <span>→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Edit profile */}
            <div className="p-6 rounded-2xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-label" style={{ color: '#625a50' }}>PERSONAL INFO</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ color: '#e8892a', background: 'rgba(232,137,42,0.08)', border: '1px solid rgba(232,137,42,0.15)' }}>
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ color: '#4db87a', background: 'rgba(45,122,84,0.1)', border: '1px solid rgba(45,122,84,0.2)' }}>
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ color: '#e07070', background: 'rgba(180,50,50,0.08)', border: '1px solid rgba(180,50,50,0.12)' }}>
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {editing ? (
                  <>
                    <div>
                      <label className="text-label block mb-2" style={{ color: '#7a7165' }}>NAME</label>
                      <input className="input-dark" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-label block mb-2" style={{ color: '#7a7165' }}>PHONE</label>
                      <input className="input-dark" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-label block mb-3" style={{ color: '#7a7165' }}>DIETARY</label>
                      <div className="flex flex-wrap gap-2">
                        {DIETARY_OPTIONS.map(d => (
                          <button key={d} onClick={() => setForm(f => ({ ...f, dietaryPreference: d }))}
                            className={`chip ${form.dietaryPreference === d ? 'chip-green' : 'chip-dim'}`}>
                            {d.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-label block mb-3" style={{ color: '#7a7165' }}>SPICE PREFERENCE</label>
                      <div className="flex flex-wrap gap-2">
                        {SPICE_OPTIONS.map(s => (
                          <button key={s} onClick={() => setForm(f => ({ ...f, spicePreference: s }))}
                            className={`chip ${form.spicePreference === s ? 'chip-ember' : 'chip-dim'}`}>
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: 'Name', value: user.name },
                      { label: 'Email', value: user.email },
                      { label: 'Phone', value: user.phone || '—' },
                      { label: 'Dietary', value: user.dietaryPreference?.replace('_', ' ') || '—' },
                      { label: 'Spice', value: user.spicePreference?.replace('_', ' ') || '—' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span className="text-label" style={{ color: '#4f4840' }}>{row.label.toUpperCase()}</span>
                        <span style={{ color: '#b3ac9f', fontSize: '0.9375rem' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Addresses */}
            <div className="p-6 rounded-2xl" style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-label" style={{ color: '#625a50' }}>ADDRESSES</h2>
              </div>
              {addresses.length === 0 ? (
                <p style={{ color: '#4f4840', fontSize: '0.875rem' }}>No saved addresses yet.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div key={addr.id} className="flex items-start gap-3 p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#625a50' }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span style={{ color: '#b3ac9f', fontWeight: 500, fontSize: '0.875rem' }}>{addr.label}</span>
                          {addr.isDefault && <span className="chip chip-ember text-xs py-0.5">Default</span>}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#4f4840' }}>
                          {addr.street}, {addr.area}, {addr.city} – {addr.pincode}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(addr.id)} className="text-xs px-2 py-1 rounded" style={{ color: '#625a50' }}>
                            Set default
                          </button>
                        )}
                        <button onClick={() => handleDeleteAddress(addr.id)} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: '#e07070' }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
