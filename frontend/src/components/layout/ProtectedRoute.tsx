import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0e0c0a' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <circle cx="20" cy="20" r="16" stroke="#e8892a" strokeWidth="2"
            strokeLinecap="round" strokeDasharray="100" strokeDashoffset="75"
            className="animate-spin-slow" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0e0c0a' }}>
        <div className="text-center">
          <div className="text-5xl mb-6">🔒</div>
          <h1
            style={{ fontFamily: '"Playfair Display",serif', fontSize: '2rem', color: '#f3ede0', fontWeight: 700, marginBottom: '1rem' }}
          >
            Access Denied
          </h1>
          <p style={{ color: '#625a50', fontFamily: '"DM Sans",sans-serif', fontSize: '0.9375rem', marginBottom: '2rem' }}>
            You don't have permission to access this page.
          </p>
          <a href="/" className="btn-ember">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
