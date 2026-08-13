import React, { useRef, MouseEvent, ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.25,
  onClick,
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMove = (e: MouseEvent) => {
    if (disabled) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) * strength;
    const dy   = (e.clientY - cy) * strength;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handleLeave = () => {
    const btn = ref.current;
    if (!btn) return;
    btn.style.transform = 'translate(0,0)';
    btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  };

  const handleEnter = () => {
    const btn = ref.current;
    if (!btn) return;
    btn.style.transition = 'transform 0.1s';
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={handleEnter}
      style={{ willChange: 'transform' }}
    >
      {children}
    </button>
  );
}
