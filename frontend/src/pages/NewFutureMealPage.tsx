import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { futureMealService } from '../services/futureMealService';
import { addressService } from '../services/addressService';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { extractError } from '../services/api';
import { Address, CuisineType, DietaryPreference, SpiceLevel } from '../types';
import { CUISINE_LABELS } from '../utils/formatters';
import toast from 'react-hot-toast';

const CUISINES: CuisineType[] = ['ANY','BIRYANI','SOUTH_INDIAN','NORTH_INDIAN','HYDERABADI','ANDHRA','STREET_FOOD','CHINESE','DESSERTS','HEALTHY'];
const DIETARY_OPTIONS: DietaryPreference[] = ['VEG','NON_VEG','VEGAN','JAIN'];
const SPICE_OPTIONS: SpiceLevel[] = ['MILD','MEDIUM','SPICY','EXTRA_SPICY'];

interface FormData {
  description: string;
  plannedDate: string;
  plannedTime: string;
  maxBudget: string;
  cuisine: CuisineType;
  dietaryPreference: DietaryPreference;
  spicePreference: SpiceLevel;
  deliveryAddressId: number;
  specialConditions: string;
}

export default function NewFutureMealPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    description: '',
    plannedDate: '',
    plannedTime: '',
    maxBudget: '',
    cuisine: 'ANY',
    dietaryPreference: 'NON_VEG',
    spicePreference: 'MEDIUM',
    deliveryAddressId: 0,
    specialConditions: '',
  });

  useEffect(() => {
    addressService.getAddresses()
      .then(data => {
        setAddresses(data);
        const def = data.find(a => a.isDefault);
        if (def) setForm(f => ({ ...f, deliveryAddressId: def.id }));
      })
      .catch(() => {});
  }, []);

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.description || !form.plannedDate || !form.plannedTime || !form.maxBudget) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await futureMealService.createFutureMeal({
        description: form.description,
        plannedDate: form.plannedDate,
        plannedTime: form.plannedTime,
        maxBudget: parseFloat(form.maxBudget),
        cuisine: form.cuisine,
        dietaryPreference: form.dietaryPreference,
        spicePreference: form.spicePreference,
        deliveryAddressId: form.deliveryAddressId,
        specialConditions: form.specialConditions || undefined,
      });
      toast.success('FutureMeal planned!');
      navigate('/future-meals');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    { title: 'Describe\nyour craving.', subtitle: 'When do you want it and what are you in the mood for?' },
    { title: 'Set your\npreferences.', subtitle: 'Cuisine type, dietary needs, and spice level.' },
    { title: 'Preview\nyour plan.', subtitle: 'Review your FutureMeal before we start watching.' },
  ];

  const current = STEPS[step - 1];

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="hero" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-16">
        {/* Step counter */}
        <div className="text-center mb-8">
          <span
            style={{ fontFamily: '"DM Mono",monospace', fontSize: '3rem', color: 'rgba(232,137,42,0.2)', letterSpacing: '-0.02em', lineHeight: 1 }}
          >
            0{step}/03
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-12">
          <h1
            style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2.5rem,6vw,4.5rem)', color: '#f3ede0', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', whiteSpace: 'pre-line' }}
          >
            {current.title}
          </h1>
          <p className="mt-4" style={{ color: '#625a50', fontFamily: '"DM Sans",sans-serif', fontSize: '1rem', lineHeight: 1.6 }}>
            {current.subtitle}
          </p>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-label block mb-2" style={{ color: '#7a7165' }}>DESCRIBE YOUR CRAVING *</label>
              <textarea
                className="input-dark resize-none"
                rows={4}
                placeholder="e.g. I want something spicy, maybe biryani or a curry, around dinner time…"
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-label block mb-2" style={{ color: '#7a7165' }}>DATE *</label>
                <input
                  type="date"
                  className="input-dark"
                  value={form.plannedDate}
                  onChange={e => setField('plannedDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="text-label block mb-2" style={{ color: '#7a7165' }}>TIME *</label>
                <input
                  type="time"
                  className="input-dark"
                  value={form.plannedTime}
                  onChange={e => setField('plannedTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-label block mb-2" style={{ color: '#7a7165' }}>MAX BUDGET (₹) *</label>
              <input
                type="number"
                className="input-dark"
                placeholder="e.g. 300"
                value={form.maxBudget}
                onChange={e => setField('maxBudget', e.target.value)}
                min={50}
                required
              />
            </div>

            {addresses.length > 0 && (
              <div>
                <label className="text-label block mb-2" style={{ color: '#7a7165' }}>DELIVERY ADDRESS</label>
                <select
                  className="input-dark"
                  value={form.deliveryAddressId}
                  onChange={e => setField('deliveryAddressId', parseInt(e.target.value, 10))}
                  style={{ appearance: 'none' }}
                >
                  {addresses.map(a => (
                    <option key={a.id} value={a.id} style={{ background: '#1c1814' }}>
                      {a.label} – {a.street}, {a.city}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="text-label block mb-3" style={{ color: '#7a7165' }}>CUISINE TYPE</label>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map(c => (
                  <button
                    key={c}
                    onClick={() => setField('cuisine', c)}
                    className={`chip ${form.cuisine === c ? 'chip-ember' : 'chip-dim'}`}
                  >
                    {CUISINE_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-label block mb-3" style={{ color: '#7a7165' }}>DIETARY</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setField('dietaryPreference', d)}
                    className={`chip ${form.dietaryPreference === d ? 'chip-green' : 'chip-dim'}`}
                  >
                    {d.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-label block mb-3" style={{ color: '#7a7165' }}>SPICE LEVEL</label>
              <div className="flex gap-2">
                {SPICE_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setField('spicePreference', s)}
                    className={`chip ${form.spicePreference === s ? 'chip-ember' : 'chip-dim'}`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-label block mb-2" style={{ color: '#7a7165' }}>SPECIAL CONDITIONS (OPTIONAL)</label>
              <textarea
                className="input-dark resize-none"
                rows={3}
                placeholder="e.g. Only if the restaurant is open, prefer 4+ rated places…"
                value={form.specialConditions}
                onChange={e => setField('specialConditions', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3 – Preview */}
        {step === 3 && (
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{ background: '#1c1814', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {[
              { label: 'Description', value: form.description },
              { label: 'Date & Time', value: `${form.plannedDate} at ${form.plannedTime}` },
              { label: 'Budget', value: `≤ ₹${form.maxBudget}` },
              { label: 'Cuisine', value: CUISINE_LABELS[form.cuisine] },
              { label: 'Dietary', value: form.dietaryPreference.replace('_', ' ') },
              { label: 'Spice', value: form.spicePreference.replace('_', ' ') },
              ...(form.specialConditions ? [{ label: 'Conditions', value: form.specialConditions }] : []),
            ].map(row => (
              <div key={row.label} className="flex items-start justify-between gap-4">
                <span className="text-label" style={{ color: '#4f4840', flexShrink: 0 }}>{row.label.toUpperCase()}</span>
                <span style={{ color: '#b3ac9f', fontFamily: '"DM Sans",sans-serif', fontSize: '0.9375rem', textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}

            <div
              className="mt-4 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(232,137,42,0.06)', border: '1px solid rgba(232,137,42,0.1)' }}
            >
              <p style={{ color: '#e8892a', fontSize: '0.8125rem', fontFamily: '"DM Sans",sans-serif', lineHeight: 1.6 }}>
                ✦ FutureMeal will evaluate restaurants matching your preferences and notify you when the perfect option is available.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="btn-surface flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!form.description || !form.plannedDate || !form.plannedTime || !form.maxBudget)}
              className="btn-ember flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-ember flex items-center gap-2"
            >
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg> Planning…</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Create FutureMeal</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
