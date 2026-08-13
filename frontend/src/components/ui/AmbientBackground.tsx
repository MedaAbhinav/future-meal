import React from 'react';

interface AmbientBackgroundProps {
  variant?: 'hero' | 'subtle' | 'warm' | 'cool';
  className?: string;
}

export function AmbientBackground({ variant = 'subtle', className = '' }: AmbientBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <div className="noise-overlay" />

      {variant === 'hero' && (
        <>
          <div
            className="ambient-blob animate-drift"
            style={{
              width: '60vw', height: '60vw',
              maxWidth: 800, maxHeight: 800,
              top: '-20%', left: '-10%',
              background: 'radial-gradient(ellipse, rgba(232,137,42,0.07) 0%, transparent 70%)',
            }}
          />
          <div
            className="ambient-blob animate-drift-slow"
            style={{
              width: '50vw', height: '50vw',
              maxWidth: 700, maxHeight: 700,
              bottom: '-10%', right: '-5%',
              background: 'radial-gradient(ellipse, rgba(200,110,16,0.06) 0%, transparent 70%)',
            }}
          />
          <div
            className="ambient-blob animate-drift"
            style={{
              width: '30vw', height: '30vw',
              maxWidth: 400, maxHeight: 400,
              top: '40%', right: '20%',
              background: 'radial-gradient(ellipse, rgba(157,108,16,0.05) 0%, transparent 70%)',
              animationDelay: '-4s',
            }}
          />
        </>
      )}

      {variant === 'warm' && (
        <>
          <div
            className="ambient-blob animate-drift"
            style={{
              width: '40vw', height: '40vw',
              maxWidth: 600, maxHeight: 600,
              top: '10%', right: '5%',
              background: 'radial-gradient(ellipse, rgba(232,137,42,0.05) 0%, transparent 70%)',
            }}
          />
          <div
            className="ambient-blob animate-drift-slow"
            style={{
              width: '30vw', height: '30vw',
              maxWidth: 400, maxHeight: 400,
              bottom: '10%', left: '5%',
              background: 'radial-gradient(ellipse, rgba(157,108,16,0.04) 0%, transparent 70%)',
            }}
          />
        </>
      )}

      {variant === 'subtle' && (
        <div
          className="ambient-blob animate-drift-slow"
          style={{
            width: '50vw', height: '50vw',
            maxWidth: 600, maxHeight: 600,
            top: '0', right: '0',
            background: 'radial-gradient(ellipse, rgba(232,137,42,0.03) 0%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}

/* Floating particles for hero */
export function ParticleField({ count = 20 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const size  = 1 + Math.random() * 2;
        const x     = Math.random() * 100;
        const y     = Math.random() * 100;
        const delay = Math.random() * 8;
        const dur   = 6 + Math.random() * 10;
        return (
          <div
            key={i}
            className="absolute rounded-full opacity-0 animate-glow-pulse"
            style={{
              width: size, height: size,
              left: `${x}%`, top: `${y}%`,
              background: i % 3 === 0 ? '#e8892a' : i % 3 === 1 ? '#e8a820' : '#f3ede0',
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
            }}
          />
        );
      })}
    </div>
  );
}
