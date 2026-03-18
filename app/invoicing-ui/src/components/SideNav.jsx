import React from 'react';
import { SideNavigation, SideNavigationItem } from '@ui5/webcomponents-react';

export default function SideNav() {
  return (
    <SideNavigation style={{ minWidth: 220 }}>
      <SideNavigationItem text="Dashboard" />
      <SideNavigationItem text="Facturación" />
      <SideNavigationItem text="Pedidos" />
      <SideNavigationItem text="Pagos" />
      <SideNavigationItem text="Notas de crédito" />
      <SideNavigationItem text="Clientes" />
      <SideNavigationItem text="Productos" />
      <SideNavigationItem text="Reportes" />
      <SideNavigationItem text="Auditoría" />
      <SideNavigationItem text="Configuración" />
    </SideNavigation>
  );
}
