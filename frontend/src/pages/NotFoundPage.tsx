import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { AmbientBackground } from '../components/ui/AmbientBackground';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: '#0e0c0a' }}>
      <AmbientBackground variant="hero" />
      <div className="relative z-10 text-center px-6">
        {/* 404 */}
        <div
          style={{
            fontFamily: '"Playfair Display",serif',
            fontSize: 'clamp(6rem,20vw,14rem)',
            fontWeight: 700,
            lineHeight: 1,
            background: 'linear-gradient(135deg, rgba(232,137,42,0.15), rgba(200,110,16,0.05))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.04em',
            marginBottom: '0.5rem',
          }}
        >
          404
        </div>

        <p className="text-label mb-4" style={{ color: '#e8892a' }}>PAGE NOT FOUND</p>

        <h1
          style={{
            fontFamily: '"Playfair Display",serif',
            fontSize: 'clamp(1.5rem,4vw,2.5rem)',
            color: '#f3ede0',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          Looks like this meal wasn't planned.
        </h1>

        <p style={{ color: '#625a50', fontFamily: '"DM Sans",sans-serif', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or may have moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="btn-ember flex items-center gap-2">
            <Home className="w-4 h-4" /> Back Home
          </Link>
          <Link to="/restaurants" className="btn-ghost-ember flex items-center gap-2">
            <Compass className="w-4 h-4" /> Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
