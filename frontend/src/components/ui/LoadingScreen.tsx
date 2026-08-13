import React, { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [phase, setPhase] = useState<'in' | 'visible' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 100);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#0e0c0a' }}
      aria-label="Loading FutureMeal"
      role="status"
    >
      <div className="noise-overlay" />

      {/* Animated plate / ring */}
      <div
        className="relative mb-8"
        style={{
          opacity: phase === 'in' ? 0 : 1,
          transform: phase === 'in' ? 'scale(0.8)' : 'scale(1)',
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <circle
            cx="32" cy="32" r="28"
            stroke="#e8892a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="176"
            strokeDashoffset="132"
            className="animate-spin-slow"
            style={{ filter: 'drop-shadow(0 0 8px rgba(232,137,42,0.6))' }}
          />
          <circle cx="32" cy="32" r="18" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <text x="32" y="38" textAnchor="middle" fontSize="18" fill="#e8892a">🍛</text>
        </svg>

        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full animate-glow-pulse"
          style={{
            background: 'radial-gradient(ellipse, rgba(232,137,42,0.15) 0%, transparent 70%)',
            margin: -16,
          }}
        />
      </div>

      <div
        style={{
          opacity: phase === 'in' ? 0 : 1,
          transform: phase === 'in' ? 'translateY(12px)' : 'translateY(0)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
          textAlign: 'center',
        }}
      >
        <div
          className="text-label mb-2"
          style={{ color: '#e8892a', letterSpacing: '0.2em', fontSize: '0.65rem' }}
        >
          FUTUREMEAL
        </div>
        <div style={{ color: '#625a50', fontSize: '0.8125rem', fontFamily: '"DM Sans",sans-serif' }}>
          Preparing your future…
        </div>
      </div>
    </div>
  );
}

/* Inline page loader */
export function PageLoader() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#0e0c0a' }}
    >
      <div className="relative">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <circle
            cx="24" cy="24" r="20"
            stroke="#e8892a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="126"
            strokeDashoffset="94"
            className="animate-spin-slow"
          />
        </svg>
      </div>
      <p className="mt-4 text-label" style={{ color: '#4f4840', letterSpacing: '0.15em', fontSize: '0.65rem' }}>
        LOADING
      </p>
    </div>
  );
}
