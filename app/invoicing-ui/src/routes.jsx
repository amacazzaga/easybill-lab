import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { ACCESS_MAP } from './accessMap.js';

function Placeholder({ title }) {
  return <h2>{title}</h2>;
}


export const routesConfig = [
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ) },
  ...ACCESS_MAP.map(({ path, label, allowedRoles }) => ({
    path,
    element: (
      <ProtectedRoute allowedRoles={allowedRoles}>
        {path === '/dashboard' ? <DashboardPage /> : <Placeholder title={label} />}
      </ProtectedRoute>
    )
  })),
  { path: '*', element: <Placeholder title="No encontrado" /> },
];

export default function AppRoutes() {
  return (
    <Routes>
      {routesConfig.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
}
