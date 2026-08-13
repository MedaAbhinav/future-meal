import React, { useEffect, useRef, useState } from 'react';

interface FutureMealScoreProps {
  score: number;
  size?: number;
  showFactors?: boolean;
  animated?: boolean;
  className?: string;
}

const FACTORS = [
  { label: 'Budget',       key: 'budget'   },
  { label: 'Taste',        key: 'taste'    },
  { label: 'Availability', key: 'avail'    },
  { label: 'Delivery',     key: 'delivery' },
  { label: 'Distance',     key: 'distance' },
  { label: 'Rating',       key: 'rating'   },
];

export function FutureMealScore({
  score,
  size = 120,
  showFactors = false,
  animated = true,
  className = '',
}: FutureMealScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [visible, setVisible]           = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  const radius      = (size - 16) / 2;
  const circumf     = 2 * Math.PI * radius;
  const progressPct = displayScore / 100;
  const dashOffset  = circumf * (1 - progressPct);
  const cx = size / 2;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setDisplayScore(score); setVisible(true); return; }

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [score]);

  useEffect(() => {
    if (!visible || !animated) { setDisplayScore(score); return; }
    const dur = 1400;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setDisplayScore(Math.round(score * ease(p)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, score, animated]);

  const color = score >= 80 ? '#e8892a' : score >= 60 ? '#e8a820' : '#4db87a';

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={cx} cy={cx} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={8}
          />
          {/* Progress */}
          <circle
            cx={cx} cy={cx} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumf}
            strokeDashoffset={dashOffset}
            style={{
              transition: animated ? 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)' : 'none',
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold leading-none"
            style={{ fontSize: size * 0.26, color, fontFamily: '"Playfair Display",serif' }}
          >
            {displayScore}
          </span>
          <span className="text-label text-dim mt-1" style={{ fontSize: size * 0.1 }}>MATCH</span>
        </div>
      </div>

      {showFactors && (
        <div className="w-full space-y-1.5">
          {FACTORS.map((f, i) => (
            <div key={f.key} className="flex items-center justify-between">
              <span className="text-xs text-dim">{f.label}</span>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 rounded-full overflow-hidden" style={{ width: 64, background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: visible ? `${Math.min(100, score + (i % 3 === 0 ? 5 : -3))}%` : '0%',
                      background: color,
                      transition: visible ? `width 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms` : 'none',
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span style={{ color, fontSize: 10 }}>✓</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
