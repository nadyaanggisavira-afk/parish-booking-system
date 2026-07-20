import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../lib/api';

// Umat-or-admin: any authenticated user may pass.
export function RequireUmat({ children }: { children: ReactNode }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Admin-only routes.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}
