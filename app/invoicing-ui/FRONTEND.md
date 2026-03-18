# Especificación Frontend – EasyBill Lab
## Decisión de stack y estilo
- El frontend será desarrollado en React usando @ui5/webcomponents-react y @ui5/webcomponents-fiori.
- El objetivo es lograr una UI 100% alineada con el estilo SAP Fiori: corporativo, limpio, enfocado en usabilidad y eficiencia.

## Estructura general del layout
 - ShellBar (barra superior): logo, nombre de la app, usuario, notificaciones.
 - SideNavigation (menú lateral): accesos a módulos principales:
	 - Facturación
	 - Pedidos
	 - Pagos
	 - Notas de crédito
	 - Clientes
	 - Productos
	 - Reportes
	 - Auditoría
	 - Configuración
 - Área de contenido principal: muestra las pantallas y formularios.

## Estilo visual
 - Colores neutros (blanco, grises, azul Fiori).
 - Tipografía clara y legible.
 - Íconos SAP Fiori en menú y acciones.
 - Espaciado generoso, sin sobrecargar la pantalla.

## Componentes principales
- Table: para listados de datos (facturas, pedidos, pagos, notas de crédito, clientes, productos, auditoría, etc.).
- Form: para ABM de entidades y registro de pagos, pedidos, notas de crédito.
- Dialog: para confirmaciones, aprobaciones, anulaciones, generación de PDF y acciones rápidas.
- BusyIndicator: para estados de carga.
- Breadcrumbs: para indicar ubicación dentro de la app.

## Navegación y experiencia de usuario
- Menú lateral siempre visible.
- Breadcrumbs en la parte superior del contenido.
- Acciones principales (crear, exportar, aprobar, anular, generar PDF, etc.) en la parte superior de cada pantalla o como acciones rápidas en tablas.
- Diálogos de confirmación para acciones críticas (aprobación de pedidos, anulación de facturas/notas, etc.).
- Responsive, pero priorizando desktop.

## Rutas principales y autenticación
 - La aplicación contará con un login principal para el acceso de usuarios.
 - Rutas principales previstas:
	 - `/login`: pantalla de autenticación.
	 - `/dashboard`: resumen e indicadores principales.
	 - `/facturas`: listado y gestión de facturas.
	 - `/pedidos`: listado y gestión de pedidos.
	 - `/pagos`: registro y consulta de pagos.
	 - `/notas-credito`: emisión y gestión de notas de crédito.
	 - `/clientes`: listado y gestión de clientes.
	 - `/productos`: listado y gestión de productos.
	 - `/reportes`: visualización y exportación de reportes.
	 - `/auditoria`: visualización de eventos fiscales.
	 - `/configuracion`: ajustes y datos de empresa.
 - El acceso a rutas estará protegido según el estado de autenticación.

## Diferenciación por tipo de usuario
 - Se podrá definir distintos roles de usuario (ej: administrador, operador, consulta).
 - Según el rol, se podrá:
	 - Restringir el acceso a ciertas rutas o módulos.
	 - Mostrar u ocultar opciones del menú lateral.
	 - (Opcional) Aplicar variantes de estilo visual (por ejemplo, color de ShellBar) según el tipo de usuario, aunque la base será siempre Fiori.

## Gráficos y visualizaciones
 - Se prevé el uso de gráficos simples (barras, tortas, líneas) para dashboards y reportes.
 - Se utilizará la librería Recharts (ya incluida en dependencias) para implementar estos gráficos.
 - Los gráficos estarán alineados al estilo Fiori: colores neutros, integración visual con el resto de la UI, y foco en la claridad de la información.
 - Ejemplos de uso:
	 - Dashboard principal: facturación mensual, cantidad de facturas, clientes activos, etc.
	 - Reportes: evolución de ventas, distribución de productos, etc.
 - Los gráficos no serán el foco principal, pero sí un complemento visual útil para la toma de decisiones.

### Visibilidad de gráficos según usuario
 - La visualización de gráficos estará sujeta al rol del usuario:
	 - **Administrador**: acceso a todos los gráficos y reportes.
	 - **Operador**: acceso a gráficos operativos (ej: facturación diaria/mensual, clientes activos), pero no a reportes avanzados.
	 - **Consulta**: acceso solo a gráficos de resumen general, sin detalles sensibles.
 - La lógica de visibilidad se implementará tanto en el frontend (ocultando componentes) como en el backend (protegiendo endpoints de datos sensibles).

 # Testing

### Testing end-to-end (E2E)
- Se utilizará Cypress para testing end-to-end (E2E) del frontend.
- Los tests E2E simulan la interacción real de un usuario: login, navegación, creación de facturas, pedidos, pagos, etc.
- Permiten validar que todo el stack (frontend, backend, base de datos) funciona correctamente en conjunto.
- Los tests E2E se ubicarán en la carpeta `app/invoicing-ui/cypress`.
- Para correr los tests E2E es necesario tener el backend y la base de datos levantados (idealmente en modo test o con datos de prueba).
- Los tests E2E complementan (no reemplazan) los tests unitarios y de integración existentes en el backend.

### Testing unitario e integración (backend)
- Se mantienen los tests unitarios y de integración existentes en la carpeta `test/` del proyecto raíz.
- Estos tests validan la lógica de negocio y la integración de servicios a nivel de backend y base de datos.

Ambos tipos de tests son necesarios para asegurar calidad y robustez en la aplicación.

### Roadmap Frontend
⚙️ Setup y Base

✅ Configuración de Vite, React y UI5
✅ Estructura de carpetas y layout principal (ShellBar, SideNavigation)
🔐 Autenticación y Usuarios

✅ Pantalla de login y lógica de autenticación
✅ Contexto de usuario y gestión de roles
✅ Protección de rutas y componentes
📊 Dashboard

✅ Pantalla /dashboard con KPIs y primeros gráficos
📝 Módulos de Gestión

✅ Facturas: listado, alta, edición, anulación, PDF
✅ Pedidos: listado, alta, edición, aprobación
✅ Pagos: listado, registro de pagos
✅ Notas de crédito: listado, alta, anulación
✅ Clientes: listado, alta, edición
✅ Productos: listado, alta, edición
📈 Reportes y Visualizaciones

✅ Pantalla /reportes con filtros, gráficos avanzados y exportación
🕵️ Auditoría

✅ Pantalla /auditoria con eventos fiscales y filtros
⚙️ Configuración

✅ Pantalla /configuracion para datos de empresa y preferencias
✨ Experiencia de Usuario

✅ Breadcrumbs, BusyIndicator, manejo de errores, acciones rápidas, diálogos, responsive, accesibilidad
🧪 Testing y Ajustes Finales

✅ Pruebas unitarias, integración y E2E (Cypress)
✅ Performance, optimización y documentación final


