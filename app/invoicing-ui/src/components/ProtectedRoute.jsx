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

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Autenticado pero sin rol suficiente
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
