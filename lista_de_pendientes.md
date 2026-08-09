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

---

## 🎨 5. Auditoría Visual — Index / Homepage (Agosto 2026)

Resultado de la auditoría estética del index. Se divide en **bugs visuales/errores de marca** y **oportunidades 2026**. La ejecución se organiza en fases (Fase 0 = quick wins sin romper producción).

### 🔴 5.1 Bugs detectados (Fase 0 — arreglos rápidos)

- [x] **`--gold-600` no existe** en `tokens.css` pero se usa en `ProductCard.tsx:269`, `productos/[slug]/page.tsx:260` y `tostadores/[slug]/page.module.css:42`. Color inválido. → Añadir token o reemplazar por gold-500.
- [x] **`@import` de Google Fonts en `tokens.css:8`** duplica las fuentes ya cargadas con `next/font` (`layout.tsx`). Render bloqueante + descarga doble. → Eliminar el `@import`.
- [x] **Ken Burns roto**: `page.module.css:25` define `transition: transform 8s` pero nada dispara el transform. Sin movimiento. → Usar `@keyframes` + `animation`.
- [x] **Botón de búsqueda del navbar muerto en desktop**: `Navbar.tsx:158-167` alterna `searchOpen` (icono→X) pero el input `.searchInput.open` nunca se renderiza. → Renderizar el input expandible y navegar al pulsar Enter.
- [x] **OriginCard ignora su `slug`**: `OriginCard.tsx:28` apunta hardcoded a `/catalogo`; además todo el estilo es inline y deja muerto `.originCard*` en `page.module.css:323`. → Linkear a `/origenes/{slug}` y migrar a CSS Module.
- [x] **Acento verde en pills activas**: `PillSelector.module.css:121-124` usa `rgba(170,214,122)` (forest) en vez del dorado de marca. → Unificar a gold.
- [x] **Social proof "de parche"**: `ProductCard.tsx:261-292` pinta favoritos/compartidos con emojis `❤️⭐` e inline styles dentro de un div `rating`. Inaccesible e incoherente. → Clases CSS + iconos SVG.
- [x] **Contraste bajo**: `--color-ink-tertiary = neutral-500 (#8A7E72)` sobre fondo claro ≈ 3:1, no alcanza AA. → Subir a neutral-600 en light mode.
- [x] **Hero sin CTA primario**: ambas CTAs son outline (`HomepageLazy.tsx:70-77`). → Una CTA dorada + una secundaria.
- [ ] **LCP bloqueado por la BD**: `HomeHero` espera `getHomepageSettings()` antes de pintar (el hero es el LCP). → Defaults estáticos + ISR. *(pendiente — requiere reestructura de datos)*

### 🟡 5.2 Oportunidades visuales 2026 (Fases 1-3)

- Movimiento nativo: scroll-driven animations (`animation-timeline: view()`) + reveals con stagger en grids.
- Lenguaje de marca de `styledk` (Casa del Cafeto): escudo, doble regla, cornisa, textura de grano procedural (`fx-stone`/`fx-marble`).
- Profundidad en hover: fill dorado en iconos de valor, quick actions en cards, parallax sutil, contador animado en stats.
- Marquee de orígenes/regiones bajo el hero; steam animado en el banner de perfil de sabor.
- Secciones de conversión: barra de anuncio, trust badges, testimonios, quick-view modal, sticky CTA mobile.
- Accesibilidad y perf: quitar emojis→SVG, `aria-live` carrito, AVIF/WebP + preload LCP, font stack reducida (Cinzel + EB Garamond + DM Mono).

### 🗂️ 5.3 Plan de fases

| Fase | Contenido | Esfuerzo |
|---|---|---|
| **Fase 0** | Quick wins: bugs 5.1 + limpieza CSS muerto | ½ día |
| **Fase 1** | Identidad visual "Casa del Cafeto" + unificar marca y fuentes | 2-3 días |
| **Fase 2** | Movimiento y profundidad (scroll-driven, parallax, micro-interacciones) | 2-3 días |
| **Fase 3** | Conversión: anuncio, trust badges, testimonios, quick-view, sticky CTA | 3-4 días |
| **Fase 4** | Rendimiento y accesibilidad: imágenes modernas, LCP, contraste AA, dark mode | 2 días |
| **Fase 5** | Mantenimiento: tokenizar colores, inline→CSS Modules, lint | 1 día |

### ✅ 5.4 Estado Fase 0

- [x] Añadir token `--gold-600` o reemplazar usos
- [x] Eliminar `@import` de fuentes en `tokens.css`
- [x] Ken Burns con `@keyframes` (respetando `prefers-reduced-motion`)
- [x] CTA primario dorado en hero
- [x] Búsqueda funcional en navbar desktop
- [x] Contraste `--color-ink-tertiary` a AA
- [x] Pills activas con acento dorado
- [x] Social proof del ProductCard con clases CSS e iconos SVG
- [x] OriginCard con slug real + CSS Module
- [x] Eliminar CSS muerto (`.originCard*` de `page.module.css`)

> **Nota Fase 0**: Build de producción verificado (`npm run build` OK, 29 rutas). Lint y type-check pasan sin errores nuevos.

### ✨ 5.5 Estado Fase 1 — Identidad visual

**Decisión de marca**: se mantiene el nombre **"Cafe Seleccion"** (ya consolidado en nav, footer, metadata, auth y manifest). La maqueta `styledk` ("Casa del Cafeto") se adopta como **lenguaje visual**, no como nombre.

- [x] Reducir stack de fuentes a 3 (Cinzel + EB Garamond + DM Mono); Cormorant y Libre Baskerville retiradas de `next/font` (sin uso real). Tokens `--font-sub`/`--font-quote` apuntan a EB Garamond como fallback.
- [x] `BrandIcon` (escudo heráldico con grano) en `NavIcons.tsx`; usado en logos de Navbar y Footer.
- [x] Componente `Ornament` (doble regla dorada con rombo, variante light/dark) en `src/components/ui/Ornament/`.
- [x] Ornament integrado en hero (bajo el h1) y en los 3 títulos de sección del index.
- [x] Textura de grano procedimental (feTurbulence, SVG data-URI) sobre el hero + fallback.
- [x] Ornament superior en el Footer.
- [x] Build verificado (`npm run build` OK, 29 rutas). Lint de archivos tocados sin warnings nuevos.

> **Pendiente Fase 1 (decisión comercial)**: evaluar si se adopta la rama de cafeto (`--sprig-h`) como divisor de secciones y si se reutiliza el escudo en favicon/PWA.

### 🎬 5.6 Estado Fase 2 — Movimiento y profundidad

- [x] Reveals scroll-driven nativos (`animation-timeline: view()`) con stagger por `nth-child` en cards de producto, orígenes y valor; cabeceras de sección y banner de perfil suben con fade.
- [x] Parallax sutil del fondo del hero (`animation-timeline: scroll(root)` + escala buffer para evitar huecos).
- [x] Contador animado en las stats del hero (`AnimatedNumber` con IntersectionObserver, easing, respeta `prefers-reduced-motion`).
- [x] Marquesina de marca (ticker decorativo con diamantes dorados, pausa al hover, máscara de desvanecido, oculta en reduced-motion).
- [x] Vapor animado (copa humeante) en el banner de perfil de sabor.
- [x] Micro-interacción: iconos de valor se tiñen de dorado al hover.
- [x] Todo bajo `@supports (animation-timeline: view())` → degradación segura: sin soporte, contenido siempre visible.
- [x] Build verificado (`npm run build` OK, 29 rutas). Type-check y lint de archivos tocados limpios.

> **Nota**: Chrome/Edge 115+, Safari 26+ y Firefox 120+ soportan scroll-driven; en navegadores antiguos no se anima pero nada se rompe ni se oculta.
