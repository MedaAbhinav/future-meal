import React from 'react';
import { Link } from 'react-router-dom';
import { INDIAN_CITIES } from '../../utils/seedData';

const NAV_LINKS = [
  { label: 'Discover', href: '/restaurants' },
  { label: 'FutureMeal', href: '/future-meals' },
  { label: 'Orders', href: '/orders' },
  { label: 'About', href: '/' },
];

export function Footer() {
  return (
    <footer style={{ background: '#141210', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-7 h-7 rounded flex items-center justify-center text-sm"
                style={{ background: 'linear-gradient(135deg,#e8892a,#c96c10)', boxShadow: '0 0 12px rgba(232,137,42,0.3)' }}
              >
                🍛
              </div>
              <span
                style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.1rem', color: '#f3ede0' }}
              >
                Future<span style={{ color: '#e8892a' }}>Meal</span>
              </span>
            </div>
            <p style={{ color: '#4f4840', fontFamily: '"DM Sans",sans-serif', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 280 }}>
              Intelligent meal planning for the modern Indian food lover. Plan today, eat perfectly tomorrow.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-label mb-5" style={{ color: '#625a50' }}>NAVIGATE</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    style={{ color: '#7a7165', fontFamily: '"DM Sans",sans-serif', fontSize: '0.9rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e8892a')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#7a7165')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-label mb-5" style={{ color: '#625a50' }}>AVAILABLE IN</h4>
            <div className="flex flex-wrap gap-2">
              {INDIAN_CITIES.map(city => (
                <span
                  key={city}
                  className="chip chip-dim"
                  style={{ fontSize: '0.75rem' }}
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p style={{ color: '#3c3630', fontFamily: '"DM Sans",sans-serif', fontSize: '0.8125rem' }}>
            © {new Date().getFullYear()} FutureMeal. All rights reserved.
          </p>
          <p style={{ color: '#3c3630', fontFamily: '"DM Mono",monospace', fontSize: '0.75rem' }}>
            Made with 🍛 in India
          </p>
        </div>
      </div>
    </footer>
  );
}
