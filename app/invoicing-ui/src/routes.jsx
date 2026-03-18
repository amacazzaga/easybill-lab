import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function Placeholder({ title }) {
  return <h2>{title}</h2>;
}

export const routesConfig = [
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: (
      <ProtectedRoute>
        <Placeholder title="Dashboard" />
      </ProtectedRoute>
    ) },
  { path: '/dashboard', element: (
      <ProtectedRoute>
        <Placeholder title="Dashboard" />
      </ProtectedRoute>
    ) },
  { path: '/facturas', element: (
      <ProtectedRoute>
        <Placeholder title="Facturación" />
      </ProtectedRoute>
    ) },
  { path: '/pedidos', element: (
      <ProtectedRoute>
        <Placeholder title="Pedidos" />
      </ProtectedRoute>
    ) },
  { path: '/pagos', element: (
      <ProtectedRoute>
        <Placeholder title="Pagos" />
      </ProtectedRoute>
    ) },
  { path: '/notas-credito', element: (
      <ProtectedRoute>
        <Placeholder title="Notas de crédito" />
      </ProtectedRoute>
    ) },
  { path: '/clientes', element: (
      <ProtectedRoute>
        <Placeholder title="Clientes" />
      </ProtectedRoute>
    ) },
  { path: '/productos', element: (
      <ProtectedRoute>
        <Placeholder title="Productos" />
      </ProtectedRoute>
    ) },
  { path: '/reportes', element: (
      <ProtectedRoute>
        <Placeholder title="Reportes" />
      </ProtectedRoute>
    ) },
  { path: '/auditoria', element: (
      <ProtectedRoute>
        <Placeholder title="Auditoría" />
      </ProtectedRoute>
    ) },
  { path: '/configuracion', element: (
      <ProtectedRoute>
        <Placeholder title="Configuración" />
      </ProtectedRoute>
    ) },
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
