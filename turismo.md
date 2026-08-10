# PLAN — Módulo Turismo (recorridos turísticos)

> Ejecución por fases. Cada fase se confirma antes de pasar a la siguiente.
> Estado actual: **Fases 1–6 completadas — QA (F7) pendiente**.

## Registro de ejecución

- **F1 (9/ago)**: modelos `RecorridoTuristico` + `RecorridoImagen` añadidos a `prisma/schema.prisma`.
  - `prisma db push` NO se usó (falla por drift de índices existente en producción, documentado en `scratch/ACCESO_PRODUCCION.md`).
  - Se crearon las tablas con migración puntual idempotente `scratch/migrate-turismo.js` (CREATE TABLE IF NOT EXISTS + FK).
  - Verificado con `scratch/verify-turismo.js`: columnas, índices y FK coinciden con el schema.
  - Seed: `prisma/seed.ts` ampliado con 4 recorridos (Andina, Cafetera, Caribe, Pacífico). Aplicado a producción.
- **F2 (9/ago)**: capa de datos `src/server/actions/turismo.actions.ts` (públicas + admin con guard `role === 'admin'`), permiso `TURISMO_MANAGE` añadido a `src/server/auth/roles.ts`. Type-check OK.
- **F3 (9/ago)**: página pública `/turismo` (hero terra/forest, marquesina, filtros región/municipio, grid, estados vacíos) + `RecorridoCard` y `TurismoFilterBar`. Type-check OK.
- **F4 (9/ago)**: detalle `/turismo/[slug]` (hero a sangre, **carrusel de fotos con auto-roll** [crossfade + Ken Burns, flechas, miniaturas] en `RecorridoGallery`, qué incluye/no incluye, itinerario, sidebar con precio + WhatsApp `wa.me`). `page.module.css`.
  - **Cambio de diseño (9/ago)**: se eliminó el formulario `SolicitarInfoForm`; su espacio en el sidebar se usa para **"Otras experiencias"** (recorridos de la misma región con miniatura y precio). Los recorridos relacionados pasaron del grid de la columna principal al sidebar.
  - **Precios en pesos**: los precios de turismo se almacenan y muestran en **pesos colombianos sin centavos** (185000 → `$185.000`), con el formateador propio `formatPesos` en `src/lib/utils.ts` (NO se usa `formatPrice`, que asume centavos). Aplicado en card, detalle y admin. Producción sincronizada con `scratch/fix-turismo-precios.js`.
  - **Imágenes reales en Cloudinary (9/ago)**: el seed usaba URLs placeholder inexistentes (404). Se generaron imágenes placeholder reales y se subieron a Cloudinary (`turismo/<slug>`), actualizando la BD. Las credenciales de Cloudinary pasaron a variables de entorno globales del hosting (ya no se pierden). *(El script temporal `scratch/upload-turismo-imagenes.js` se eliminó para no dejar herramienta de credenciales de producción en el repo.)*
- **F5 (9/ago)**: CRUD admin `/admin/turismo` (listado, `nuevo`, `[id]`) con guard extra `role === 'admin'` en cada página + entrada `adminOnly: true` en `AdminShell.tsx`. Formulario `src/components/admin/RecorridoForm.tsx` (precios en pesos, galería con `ImageUploader` tipo `feature`, listas incluye/no incluye/itinerario por líneas, flags destacado/activo) y botón soft-delete `RecorridoDeleteButton.tsx`. Type-check OK.
- **F6 (9/ago)**: el enlace "Turismo" se añadió a `NAV_LINKS`. Por el exceso de enlaces en el header de escritorio, se **sustituyeron los enlaces visibles por un botón hamburguesa** (icono `MenuIcon` en el estilo de `NavIcons.tsx`, botón redondeado tipo "Catálogo") que abre un panel desplegable con Catálogo, Envío, Nosotros, Turismo y Centro de Ayuda. Se cierra con Esc, clic fuera o al navegar. El menú mobile (tab bar) no cambia.

**QA ejecutado (F7, parcial):**
- `npm run type-check` ✅
- `npm run lint` ✅ (solo warnings, sin errores)
- `npm run build` ✅ (rutas `/turismo`, `/turismo/[slug]`, `/admin/turismo*` presentes; `postbuild` OK)

---

## Decisiones confirmadas (9/ago/2026)

1. **CTA de reserva** en el detalle: **WhatsApp** (botón "Reservar por WhatsApp" con `wa.me` y mensaje predefinido). Se descartó el formulario "solicitar información"; su espacio en el sidebar se usa para "Otras experiencias".
2. **SIN modelo Prestador** (no existe en la base real, que usa modelos en inglés): la comunicación se hace a un **único número de WhatsApp del negocio** (`NEXT_PUBLIC_WHATSAPP_NUMBER`). Todos los recorridos los sube directamente el admin.
3. **Seed de ejemplo**: 4 recorridos (regiones Andina, Cafetera, Caribe y Pacífico), con imágenes placeholder y precios.
4. **Gestión SOLO admin**: únicamente el rol `admin` puede subir/crear/editar/eliminar recorridos. Ningún otro rol (ni `vendor`, ni usuarios normales) tiene acceso. Se integra en el dashboard de admin.
5. **Acceso público mínimo**: solo un enlace pequeño en el **navbar/header de escritorio** (y su equivalente en el menú mobile) que apunta a la página principal de turismo.
6. **BD en producción**: los modelos se aplican con `prisma db push` (patrón del proyecto, no hay carpeta `migrations/`) contra la BD de producción Hostinger definida en `.env.production.local`. Cambio **aditivo**, no rompe los datos existentes.

---

## Identidad visual del módulo

- Misma base de diseño del sitio (tokens, Ornament, cards, marquesina, grain) para coherencia de marca.
- **Acento diferenciado**: paleta terra/forest (naturaleza/paisaje) en chips, iconos y CTA, en lugar del dorado dominante del café.
- Héroes con fotografía a sangre, texturas sutiles de hoja/terreno.
- **No** mezclar con el catálogo de café: página independiente, URL propia, sin aparecer en búsqueda de cafés ni en carrito.

---

## Estructura de rutas

```
Públicas:
  /turismo          → página principal de turismo (listado + filtros)
  /turismo/[slug]   → detalle del recorrido

Admin (solo rol admin):
  /admin/turismo          → listado de recorridos
  /admin/turismo/nuevo    → crear recorrido
  /admin/turismo/[id]     → editar recorrido
```

---

## Fase 1 — Base de datos (Prisma)

Nuevo modelo `RecorridoTuristico` (tabla independiente del café):

| Campo | Tipo | Notas |
|---|---|---|
| `id` | String UUID | `@id @default(uuid())` |
| `nombre` | String | `@db.VarChar(160)` |
| `slug` | String | `@unique @db.VarChar(180)` |
| `descripcionCorta` | String | `@db.VarChar(140)` |
| `descripcion` | String | `@db.Text` |
| `precio` | Int | pesos (sin centavos) |
| `precioOriginal` | Int? | pesos, opcional (para descuento) |
| `region` | String | `@db.VarChar(80)` |
| `municipio` | String | `@db.VarChar(120)` |
| `vereda` | String? | opcional |
| `duracion` | String? | ej. "5 horas" |
| `dificultad` | String? | baja / media / alta |
| `capacidad` | Int? | personas |
| `incluye` | String? | JSON array (texto) |
| `noIncluye` | String? | JSON array (texto) |
| `itinerario` | String? | JSON array de pasos |
| `imagen` | String | URL principal (Cloudinary) |
| `destacado` | Boolean | default false |
| `activo` | Boolean | default true |
| `deletedAt` | DateTime? | soft delete |
| `createdAt` / `updatedAt` | DateTime | estándar |

Nuevo modelo `RecorridoImagen` (galería, igual a `ProductoImagen`):

| Campo | Tipo | Notas |
|---|---|---|
| `id` | String UUID | |
| `recorridoId` | String | FK → `RecorridoTuristico` |
| `url` | String | `@db.VarChar(500)` |
| `orden` | Int | default 0 |
| `createdAt` | DateTime | |

**Ejecutar:**
1. Editar `prisma/schema.prisma` (añadir los dos modelos; sin relación con Prestador).
2. `npx prisma db push` contra la BD de producción (`.env.production.local`).
3. Seed: crear/ampliar script `prisma/seed.ts` con 4 recorridos de ejemplo (Andina, Cafetera, Caribe, Pacífico) con imágenes placeholder.
4. Regenerar cliente: `npx prisma generate`.

---

## Fase 2 — Capa de datos (server actions)

Nuevo archivo `src/server/actions/turismo.actions.ts`:

- **Públicas:**
  - `getRecorridos(filtros?: { region?, municipio? })` → lista de recorridos `activo && !deletedAt`, ordenados por `destacado desc, createdAt desc`.
  - `getRecorridoBySlug(slug)` → detalle con imágenes.
  - `getRegiones()` / `getMunicipios(region?)` → para filtros del listado.
- **Admin (verifican sesión + rol `admin`):**
  - `crearRecorrido(datos)`
  - `actualizarRecorrido(id, datos)`
  - `eliminarRecorrido(id)` → soft delete (`deletedAt`)
  - Guard de rol en cada acción: solo `session.user.role === 'admin'`.

Tipos compartidos en `src/types` (interfaces de recorrido y datos de entrada).

---

## Fase 3 — Página pública `/turismo` (listado)

- Hero con identidad turística: foto a sangre, título, subtítulo, marquesina.
- **Filtros por región y municipio** (pills o selects).
- Grid de cards con: imagen, precio, duración, dificultad, chip de ubicación (región → municipio → vereda), descripción corta, CTA "Ver recorrido".
- Estados vacíos y skeletons.
- Reutiliza componentes existentes (Ornament, cards, section) con la paleta terra/forest.

---

## Fase 4 — Página detalle `/turismo/[slug]`

- **Carrusel de fotos animado** (auto-roll con crossfade + Ken Burns, flechas, miniaturas clicables; pausa al pasar el mouse).
- Descripción amplia.
- Secciones: **"Qué incluye" / "Qué no incluye"**, **Itinerario**.
- Ubicación escalonada: región → municipio → vereda.
- Precio (y original tachado).
- **CTA: botón WhatsApp** (`wa.me` con `NEXT_PUBLIC_WHATSAPP_NUMBER` y mensaje predefinido).
- Sidebar: resumen (precio, datos, WhatsApp) + **"Otras experiencias"** (recorridos de la misma región).
- `Metadata` SEO por slug.

---

## Fase 5 — Admin `/admin/turismo` (solo rol admin)

- **Protección estricta de rol**: el layout de admin actual permite `admin` y `vendor` (`layout.tsx`). Para turismo se añade **guard extra** que redirige a `/admin` (o `/auth/login`) si el rol **no es `admin`**:
  - En el nuevo `layout.tsx` de `/admin/turismo` (layout anidado) se comprueba `session.user.role === 'admin'`.
  - Las server actions de turismo también validan `role === 'admin'` (defensa en profundidad).
- **Menú del dashboard**: nueva entrada `{ href: '/admin/turismo', label: 'Turismo', icon: ..., adminOnly: true }` en `AdminShell.tsx`. Como tiene `adminOnly: true`, **solo se muestra para admin**, nunca para vendor.
- Páginas:
  - `page.tsx` → tabla/listado con buscar, activar/desactivar, destacado, eliminar (soft).
  - `nuevo/page.tsx` → formulario completo (campos del modelo + subida de imagen principal y galería).
  - `[id]/page.tsx` → edición (mismo formulario prellenado).
- **Subida de imágenes** reutilizando `src/app/api/upload/route.ts` (Cloudinary, ya existente).
- Formulario con validación (nombre, slug auto, precio, región/municipio/vereda, descripciones, incluye/no incluye/itinerario como listas editables, destacado/activo).

---

## Fase 6 — Navegación pública

- **Header desktop** (`src/components/layout/Navbar/Navbar.tsx`): se sustituyen los enlaces visibles (eran muchos: Catálogo, Envío, Nosotros, Turismo, Centro de Ayuda) por un **botón hamburguesa** (icono `MenuIcon` de `NavIcons.tsx`, botón redondeado adaptado del botón "Catálogo"). Al hacer clic se abre un panel desplegable (`desktopMenu`) con todos los enlaces; se cierra con Esc, clic fuera o al navegar.
- **Mobile**: sin cambios — se mantiene la tab bar inferior (Inicio, Buscar, Catálogo, Favoritos, Carrito). Los enlaces del header siguen en el menú mobile (`MOBILE_MENU_LINKS`).

---

## Fase 7 — QA y entrega

- `npx tsc --noEmit` (type-check)
- `npm run build` (verificar script de build en package.json)
- Lint del proyecto si existe (ver scripts en package.json)
- Revisión visual: página principal, detalle, responsive móvil/tablet/desktop, filtros, estados vacíos, admin CRUD completo, protección de roles (vendor NO ve ni accede a `/admin/turismo`).
- Prueba de flujo: crear recorrido desde admin → aparece en `/turismo` → detalle con CTA WhatsApp y carrusel.

---

## Pendientes

- [x] **Dashboard de clientes, usuarios y roles** — implementado (pendiente de revisión): `/admin/clientes` (clientes + agregados de compra), `/admin/usuarios` (staff admin/vendor + resetear contraseña) y `/admin/roles` (matriz RBAC derivada de `src/server/auth/roles.ts` + conteos reales de `users.role`). Sin cambios de schema en producción.

---

## Notas / riesgos

- La BD real usa modelos en inglés y **no tiene `Prestador`**; el contacto de los recorridos es el WhatsApp del negocio (`NEXT_PUBLIC_WHATSAPP_NUMBER`).
- El layout de admin actual da acceso a `vendor`; el módulo turismo añade guard de `admin` (layout anidado + server actions) para impedir acceso.
- La página `/turismo` es **independiente**: no participa en búsqueda de cafés, carrito ni favoritos de productos.
- Los campos JSON (`incluye`, `noIncluye`, `itinerario`) se almacenan como `String` con JSON serializado.
- `prisma db push` se ejecuta contra la BD de **producción** (`82.197.82.176`); es un cambio aditivo que no afecta tablas existentes.
