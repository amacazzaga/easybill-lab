import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

function Placeholder({ title }) {
  return <h2>{title}</h2>;
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Placeholder title="Dashboard" />} />
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="/facturas" element={<Placeholder title="Facturación" />} />
          <Route path="/pedidos" element={<Placeholder title="Pedidos" />} />
          <Route path="/pagos" element={<Placeholder title="Pagos" />} />
          <Route path="/notas-credito" element={<Placeholder title="Notas de crédito" />} />
          <Route path="/clientes" element={<Placeholder title="Clientes" />} />
          <Route path="/productos" element={<Placeholder title="Productos" />} />
          <Route path="/reportes" element={<Placeholder title="Reportes" />} />
          <Route path="/auditoria" element={<Placeholder title="Auditoría" />} />
          <Route path="/configuracion" element={<Placeholder title="Configuración" />} />
          <Route path="*" element={<Placeholder title="No encontrado" />} />
        </Routes>
      </Layout>
    </Router>
  );
}
