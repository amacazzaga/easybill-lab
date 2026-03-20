
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import KPICard from '../components/KPICard.jsx';
import { AnalyticalTable } from '@ui5/webcomponents-react';

export default function DashboardPage() {
  console.log('[DASHBOARD] Renderizando DashboardPage');
  const { authHeader } = useAuth();
  const [facturas, setFacturas] = useState(null);
  const [pedidos, setPedidos] = useState(null);
  const [pagos, setPagos] = useState(null);
  const [latestInvoices, setLatestInvoices] = useState([]);
  const [latestPayments, setLatestPayments] = useState([]);
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

        // ── Demo/lectura rápida ─────────────────────────────────────
        console.log('[DASHBOARD] Fetch últimas facturas (Emitida)...');
        const liRes = await fetch(
          `/odata/v4/invoice/Invoices?$top=5&$filter=estado%20eq%20%27Emitida%27&$orderby=fecha%20desc&$select=ID,numero,estado,fecha,total,caeFechaVto`,
          { headers: { 'Authorization': authHeader } }
        );
        const liData = await liRes.json();
        setLatestInvoices(Array.isArray(liData?.value) ? liData.value : []);

        console.log('[DASHBOARD] Fetch últimos pagos...');
        const lpRes = await fetch(
          `/odata/v4/payment/Payments?$top=5&$orderby=fecha%20desc&$select=ID,invoice_ID,fecha,importe,metodoPago,referencia`,
          { headers: { 'Authorization': authHeader } }
        );
        const lpData = await lpRes.json();
        setLatestPayments(Array.isArray(lpData?.value) ? lpData.value : []);
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

  const invoicesColumns = useMemo(
    () => [
      { Header: 'Nro.', accessor: 'numero', minWidth: 90, id: 'numero' },
      { Header: 'Fecha', accessor: 'fecha', minWidth: 90, id: 'fecha' },
      { Header: 'Total', accessor: 'total', minWidth: 90, id: 'total' },
      { Header: 'CAE Vto.', accessor: 'caeFechaVto', minWidth: 110, id: 'caeFechaVto' },
      { Header: 'Estado', accessor: 'estado', minWidth: 90, id: 'estado' }
    ],
    []
  );

  const paymentsColumns = useMemo(
    () => [
      { Header: 'Fecha', accessor: 'fecha', minWidth: 90, id: 'fecha' },
      { Header: 'Importe', accessor: 'importe', minWidth: 90, id: 'importe' },
      { Header: 'Método', accessor: 'metodoPago', minWidth: 110, id: 'metodoPago' },
      { Header: 'Referencia', accessor: 'referencia', minWidth: 140, id: 'referencia' },
      {
        Header: 'Factura',
        accessor: (row) => row.invoice_ID || row.invoiceID || row.invoice?.ID || '',
        minWidth: 140,
        id: 'invoice_ID'
      }
    ],
    []
  );

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <KPICard label="Facturas" value={facturasCount} />
        <KPICard label="Pedidos" value={pedidosCount} />
        <KPICard label="Pagos" value={pagosCount} />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Últimas facturas (Emitida)</h3>
        <AnalyticalTable
          header={null}
          columns={invoicesColumns}
          data={latestInvoices}
          visibleRows={5}
          minRows={5}
          loading={loading}
          noDataText="No hay facturas Emitidas"
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Últimos pagos</h3>
        <AnalyticalTable
          header={null}
          columns={paymentsColumns}
          data={latestPayments}
          visibleRows={5}
          minRows={5}
          loading={loading}
          noDataText="No hay pagos"
        />
      </div>

      {loading && <div style={{ marginTop: 16 }}>Cargando datos...</div>}
    </div>
  );
}
