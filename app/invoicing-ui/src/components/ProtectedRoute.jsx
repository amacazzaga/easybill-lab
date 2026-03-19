import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role } = useAuth();
  const location = useLocation();

  if (!user) {
    // No autenticado: redirige a login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    // Autenticado pero sin rol suficiente
    const userRoles = Array.isArray(role) ? role : role ? [role] : [];
    const hasAccess = allowedRoles.some(r => userRoles.includes(r));
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
