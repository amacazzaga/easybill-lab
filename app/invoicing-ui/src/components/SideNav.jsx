import React from 'react';
import { SideNavigation, SideNavigationItem } from '@ui5/webcomponents-react';

export default function SideNav() {
  return (
    <SideNavigation style={{ minWidth: 220 }}>
      <SideNavigationItem icon="home" text="Dashboard" />
      <SideNavigationItem icon="document" text="Facturación" />
      <SideNavigationItem icon="cart" text="Pedidos" />
      <SideNavigationItem icon="money-bills" text="Pagos" />
      <SideNavigationItem icon="credit-card" text="Notas de crédito" />
      <SideNavigationItem icon="customer" text="Clientes" />
      <SideNavigationItem icon="product" text="Productos" />
      <SideNavigationItem icon="pie-chart" text="Reportes" />
      <SideNavigationItem icon="activity-2" text="Auditoría" />
      <SideNavigationItem icon="settings" text="Configuración" />
    </SideNavigation>
  );
}
