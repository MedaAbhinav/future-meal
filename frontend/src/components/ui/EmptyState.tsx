import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
}

export function EmptyState({ emoji = '🍽️', title, description, ctaLabel, ctaHref, onCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="text-6xl mb-6">{emoji}</div>
      <h3
        style={{
          fontFamily: '"Playfair Display",serif',
          fontSize: '1.5rem',
          color: '#f3ede0',
          fontWeight: 600,
          marginBottom: '0.75rem',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            color: '#625a50',
            fontFamily: '"DM Sans",sans-serif',
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            maxWidth: 380,
            marginBottom: '2rem',
          }}
        >
          {description}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <Link to={ctaHref} className="btn-ember">
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && onCta && !ctaHref && (
        <button className="btn-ember" onClick={onCta}>
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
