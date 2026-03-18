import React from 'react';
import { Routes, Route } from 'react-router-dom';

function Placeholder({ title }) {
  return <h2>{title}</h2>;
}

export const routesConfig = [
  { path: '/', element: <Placeholder title="Dashboard" /> },
  { path: '/dashboard', element: <Placeholder title="Dashboard" /> },
  { path: '/facturas', element: <Placeholder title="Facturación" /> },
  { path: '/pedidos', element: <Placeholder title="Pedidos" /> },
  { path: '/pagos', element: <Placeholder title="Pagos" /> },
  { path: '/notas-credito', element: <Placeholder title="Notas de crédito" /> },
  { path: '/clientes', element: <Placeholder title="Clientes" /> },
  { path: '/productos', element: <Placeholder title="Productos" /> },
  { path: '/reportes', element: <Placeholder title="Reportes" /> },
  { path: '/auditoria', element: <Placeholder title="Auditoría" /> },
  { path: '/configuracion', element: <Placeholder title="Configuración" /> },
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
