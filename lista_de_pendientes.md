# 📝 Lista de Pendientes & Auditoría de Proyecto (Café Marketplace)

Este documento registra los hallazgos de la auditoría superficial del proyecto, identificando enlaces rotos, assets faltantes, mejoras sugeridas y los módulos pendientes para tener una aplicación 100% pulida.

---

## 🔗 1. Enlaces Rotos / Rutas Faltantes (Navegación Pública)

Actualmente, algunos enlaces de la barra de navegación (`Navbar`) y el pie de página (`Footer`) apuntan a rutas que devuelven un error **404 (Página no encontrada)** porque sus vistas aún no han sido creadas:

- ❌ **`/origenes`** y **`/origenes/[slug]`**: Enlace en Navbar a la guía de regiones cafeteras colombianas.
- ❌ **`/tostadores`** y **`/tostadores/[slug]`**: Enlace a las páginas de las marcas/tostaderías.
- ❌ **`/blog`**: Enlace al blog de cultura de café.
- ❌ **`/perfil-de-sabor`**: Enlace al quiz de recomendación de café de 2 minutos.
- ❌ **`/favoritos`**: Vista de lista de deseos guardada por el cliente.
- ❌ **`/cuenta`**: Panel de perfil del cliente autenticado.

> **💡 Solución propuesta**: Crear páginas base informativas/placeholders elegantes para estas 6 rutas para evitar errores 404 mientras se desarrolla su lógica completa.

---

## 🖼️ 2. Assets y Favicons Faltantes (Reducir Peticiones 404)

En la consola de desarrollo del servidor se observaron peticiones fallidas (404) por íconos de la PWA y favicon:

- ❌ `public/icons/favicon-32x32.png`
- ❌ `public/icons/apple-touch-icon.png`
- ❌ `public/icons/icon-192x192.png`
- ❌ `public/icons/icon-512x512.png`
- ❌ Imágenes placeholder locales en `public/images/products/` y `public/images/origins/`.

> **💡 Solución propuesta**: Generar e incluir los PNGs estáticos dentro de `public/icons/` y `public/images/`.

---

## ⚙️ 3. Oportunidades de Mejora Funcional

### A. Carga de Imágenes en Panel de Administración (`ProductForm`)
- **Falla actual**: Al crear un producto desde `/admin/productos/nuevo`, se guarda el texto del producto, pero no hay un campo de subida de imágenes (file uploader) para subir fotos directamente del grano a Cloudflare R2 o almacenamiento local.
- **Mejora**: Integrar un selector de imágenes con vista previa en el `ProductForm` que guarde en `ProductImage`.

### B. Moliendas en Variantes de Inventario
- **Mejora**: Permitir definir la molienda específica cuando el cliente añade el grano al carrito (ej. seleccionar *Molido para Espresso* o *Grano Entero* antes de mandar el pedido a WhatsApp).

---

## 📊 4. Módulos Administrativos Pendientes (Roadmap)

De la lista original de módulos del panel administrativo, quedan pendientes por programar:

- [ ] **Módulo 6: Clientes** (Gestión de usuarios consumidores y compras acumuladas).
- [ ] **Módulo 7: Usuarios Staff** (Cuentas de administradores y operadores).
- [ ] **Módulo 8: Roles** (Permisos y control de acceso RBAC).
- [ ] **Módulo 9: Reportes** (Analíticas de ventas, productos más vendidos).
- [ ] **Módulo 10: Configuraciones** (Ajustes de tienda, teléfono de WhatsApp, textos globales).
- [ ] **Módulo 11: Logs** (Registro de auditoría de cambios del sistema).

---

## 📌 Resumen de Acción Inmediata Recomendada

1. **Crear páginas informativas para los 6 links rotos** (`/origenes`, `/tostadores`, `/blog`, `/perfil-de-sabor`, `/favoritos`, `/cuenta`).
2. **Añadir el cargador de imágenes** en el formulario de creación de productos del panel de administración.
3. **Colocar los íconos de favicon** en la carpeta `public/icons/`.
