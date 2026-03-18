# Especificación Frontend – EasyBill Lab

## Decisión de stack y estilo
- El frontend será desarrollado en React usando @ui5/webcomponents-react y @ui5/webcomponents-fiori.
- El objetivo es lograr una UI 100% alineada con el estilo SAP Fiori: corporativo, limpio, enfocado en usabilidad y eficiencia.

## Estructura general del layout
- ShellBar (barra superior): logo, nombre de la app, usuario, notificaciones.
- SideNavigation (menú lateral): accesos a módulos principales (Facturación, Clientes, Productos, Reportes, Configuración).
- Área de contenido principal: muestra las pantallas y formularios.

## Estilo visual
- Colores neutros (blanco, grises, azul Fiori).
- Tipografía clara y legible.
- Íconos SAP Fiori en menú y acciones.
- Espaciado generoso, sin sobrecargar la pantalla.

## Componentes principales
- Table: para listados de datos (facturas, clientes, productos, etc.).
- Form: para ABM de entidades.
- Dialog: para confirmaciones y acciones rápidas.
- BusyIndicator: para estados de carga.
- Breadcrumbs: para indicar ubicación dentro de la app.

## Navegación y experiencia de usuario
- Menú lateral siempre visible.
- Breadcrumbs en la parte superior del contenido.
- Acciones principales (crear, exportar, etc.) en la parte superior de cada pantalla.
- Responsive, pero priorizando desktop.

## Notas y decisiones aprobadas
- Todas las decisiones y lineamientos aprobados sobre el frontend se irán registrando en este documento.
- Cualquier cambio o excepción debe quedar asentado aquí para mantener coherencia y trazabilidad.

---

> Última actualización: 18/03/2026
