import React, { useEffect, useRef, ReactNode } from 'react';

interface RevealOnScrollProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
  threshold?: number;
}

export function RevealOnScroll({
  children,
  delay = 0,
  className = '',
  direction = 'up',
  threshold = 0.15,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check prefers-reduced-motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  const transforms: Record<string, string> = {
    up:    'translateY(32px)',
    left:  'translateX(-24px)',
    right: 'translateX(24px)',
    scale: 'scale(0.94)',
  };

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transform: transforms[direction] }}
    >
      {children}
    </div>
  );
}

/* Staggered children reveal */
export function StaggerReveal({
  children,
  stagger = 80,
  className = '',
}: {
  children: ReactNode[];
  stagger?: number;
  className?: string;
}) {
  return (
    <>
      {React.Children.map(children, (child, i) => (
        <RevealOnScroll key={i} delay={i * stagger} className={className}>
          {child}
        </RevealOnScroll>
      ))}
    </>
  );
}
