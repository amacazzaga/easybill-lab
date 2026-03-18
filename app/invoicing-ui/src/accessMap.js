// Centralized permissions and navigation map for the app
// Each entry defines the route, label, and which roles can access it

export const ACCESS_MAP = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    allowedRoles: ['admin', 'contador', 'vendedor'],
  },
  {
    path: '/facturas',
    label: 'Facturación',
    allowedRoles: ['admin', 'contador'],
  },
  {
    path: '/pedidos',
    label: 'Pedidos',
    allowedRoles: ['admin', 'vendedor'],
  },
  {
    path: '/pagos',
    label: 'Pagos',
    allowedRoles: ['admin', 'contador'],
  },
  {
    path: '/notas-credito',
    label: 'Notas de crédito',
    allowedRoles: ['admin', 'contador'],
  },
  {
    path: '/clientes',
    label: 'Clientes',
    allowedRoles: ['admin', 'contador', 'vendedor'],
  },
  {
    path: '/productos',
    label: 'Productos',
    allowedRoles: ['admin', 'contador', 'vendedor'],
  },
  {
    path: '/reportes',
    label: 'Reportes',
    allowedRoles: ['admin', 'contador'],
  },
  {
    path: '/auditoria',
    label: 'Auditoría',
    allowedRoles: ['admin'],
  },
  {
    path: '/configuracion',
    label: 'Configuración',
    allowedRoles: ['admin'],
  },
];
