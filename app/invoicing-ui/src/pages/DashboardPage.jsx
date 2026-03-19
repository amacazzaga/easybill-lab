
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import KPICard from '../components/KPICard.jsx';

export default function DashboardPage() {
  console.log('[DASHBOARD] Renderizando DashboardPage');
  const { authHeader } = useAuth();
  const [facturas, setFacturas] = useState(null);
  const [pedidos, setPedidos] = useState(null);
  const [pagos, setPagos] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        console.log('[DASHBOARD] Fetch facturas...');
        const fRes = await fetch('/odata/v4/invoice/Invoices', {
          headers: { 'Authorization': authHeader }
        });
        const fData = await fRes.json();
        setFacturas(Array.isArray(fData?.value) ? fData.value : []);
        console.log('[DASHBOARD] Facturas:', fData);

        console.log('[DASHBOARD] Fetch pedidos...');
        const pRes = await fetch('/odata/v4/order/Orders', {
          headers: { 'Authorization': authHeader }
        });
        const pData = await pRes.json();
        setPedidos(Array.isArray(pData?.value) ? pData.value : []);
        console.log('[DASHBOARD] Pedidos:', pData);

        console.log('[DASHBOARD] Fetch pagos...');
        const paRes = await fetch('/odata/v4/payment/Payments', {
          headers: { 'Authorization': authHeader }
        });
        const paData = await paRes.json();
        setPagos(Array.isArray(paData?.value) ? paData.value : []);
        console.log('[DASHBOARD] Pagos:', paData);
      } catch (err) {
        setError(err.message);
        console.log('[DASHBOARD] Error:', err);
      } finally {
        setLoading(false);
      }
    }
    if (authHeader) fetchAll();
  }, [authHeader]);

  const facturasCount = Array.isArray(facturas) ? facturas.length : 0;
  const pedidosCount = Array.isArray(pedidos) ? pedidos.length : 0;
  const pagosCount = Array.isArray(pagos) ? pagos.length : 0;

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <KPICard label="Facturas" value={facturasCount} />
        <KPICard label="Pedidos" value={pedidosCount} />
        <KPICard label="Pagos" value={pagosCount} />
      </div>

      {loading && <div style={{ marginTop: 16 }}>Cargando datos...</div>}
    </div>
  );
}
