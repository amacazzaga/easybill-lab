## Visibilidad de gráficos según usuario
- La visualización de gráficos estará sujeta al rol del usuario:
	- **Administrador**: acceso a todos los gráficos y reportes.
	- **Operador**: acceso a gráficos operativos (ej: facturación diaria/mensual, clientes activos), pero no a reportes avanzados.
	- **Consulta**: acceso solo a gráficos de resumen general, sin detalles sensibles.
- La lógica de visibilidad se implementará tanto en el frontend (ocultando componentes) como en el backend (protegiendo endpoints de datos sensibles).
## Gráficos y visualizaciones
	- Dashboard principal: facturación mensual, cantidad de facturas, clientes activos, etc.
	- Reportes: evolución de ventas, distribución de productos, etc.
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

## Rutas principales y autenticación
 - La aplicación contará con un login principal para el acceso de usuarios.
 - Rutas principales previstas:
	 - `/login`: pantalla de autenticación.
	 - `/dashboard`: resumen e indicadores principales.
	 - `/facturas`: listado y gestión de facturas.
	 - `/clientes`: listado y gestión de clientes.
	 - `/productos`: listado y gestión de productos.
	 - `/reportes`: visualización y exportación de reportes.
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

## Notas y decisiones aprobadas
 - Todas las decisiones y lineamientos aprobados sobre el frontend se irán registrando en este documento.
 - Cualquier cambio o excepción debe quedar asentado aquí para mantener coherencia y trazabilidad.

---

> Última actualización: 18/03/2026

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

## Rutas principales y autenticación
- La aplicación contará con un login principal para el acceso de usuarios.
- Rutas principales previstas:
	- `/login`: pantalla de autenticación.
	- `/dashboard`: resumen e indicadores principales.
	- `/facturas`: listado y gestión de facturas.
	- `/clientes`: listado y gestión de clientes.
	- `/productos`: listado y gestión de productos.
	- `/reportes`: visualización y exportación de reportes.
	- `/configuracion`: ajustes y datos de empresa.
- El acceso a rutas estará protegido según el estado de autenticación.

## Diferenciación por tipo de usuario
- Se podrá definir distintos roles de usuario (ej: administrador, operador, consulta).
- Según el rol, se podrá:
	- Restringir el acceso a ciertas rutas o módulos.
	- Mostrar u ocultar opciones del menú lateral.
	- (Opcional) Aplicar variantes de estilo visual (por ejemplo, color de ShellBar) según el tipo de usuario, aunque la base será siempre Fiori.

Todas estas definiciones pueden ampliarse a medida que se avance en el desarrollo y se definan los perfiles de usuario.
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

## Rutas principales y autenticación
- La aplicación contará con un login principal para el acceso de usuarios.
- Rutas principales previstas:
	- `/login`: pantalla de autenticación.
	- `/dashboard`: resumen e indicadores principales.
	- `/facturas`: listado y gestión de facturas.
	- `/clientes`: listado y gestión de clientes.
	- `/productos`: listado y gestión de productos.
	- `/reportes`: visualización y exportación de reportes.
	- `/configuracion`: ajustes y datos de empresa.
- El acceso a rutas estará protegido según el estado de autenticación.

## Diferenciación por tipo de usuario
- Se podrá definir distintos roles de usuario (ej: administrador, operador, consulta).
- Según el rol, se podrá:
	- Restringir el acceso a ciertas rutas o módulos.
	- Mostrar u ocultar opciones del menú lateral.
	- (Opcional) Aplicar variantes de estilo visual (por ejemplo, color de ShellBar) según el tipo de usuario, aunque la base será siempre Fiori.

Todas estas definiciones pueden ampliarse a medida que se avance en el desarrollo y se definan los perfiles de usuario.

## Notas y decisiones aprobadas
- Todas las decisiones y lineamientos aprobados sobre el frontend se irán registrando en este documento.
- Cualquier cambio o excepción debe quedar asentado aquí para mantener coherencia y trazabilidad.

---

> Última actualización: 18/03/2026
