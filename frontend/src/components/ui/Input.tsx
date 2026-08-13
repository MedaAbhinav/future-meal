import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: '"DM Sans",sans-serif',
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#7a7165',
  marginBottom: '0.5rem',
  fontWeight: 500,
};

const errorStyle: React.CSSProperties = {
  marginTop: '0.375rem',
  fontSize: '0.8125rem',
  color: '#e07070',
  fontFamily: '"DM Sans",sans-serif',
};

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <input className={`input-dark ${error ? 'border-[rgba(180,50,50,0.5)]' : ''} ${className}`} {...props} />
      {error && <p style={errorStyle}>{error}</p>}
      {!error && hint && <p style={{ ...errorStyle, color: '#625a50' }}>{hint}</p>}
    </div>
  );
}

export function Select({ label, error, hint, options, className = '', ...props }: SelectProps) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <select
        className={`input-dark ${error ? 'border-[rgba(180,50,50,0.5)]' : ''} ${className}`}
        style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237a7165' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: '#1c1814', color: '#f3ede0' }}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p style={errorStyle}>{error}</p>}
      {!error && hint && <p style={{ ...errorStyle, color: '#625a50' }}>{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        className={`input-dark resize-none ${error ? 'border-[rgba(180,50,50,0.5)]' : ''} ${className}`}
        {...props}
      />
      {error && <p style={errorStyle}>{error}</p>}
      {!error && hint && <p style={{ ...errorStyle, color: '#625a50' }}>{hint}</p>}
    </div>
  );
}
