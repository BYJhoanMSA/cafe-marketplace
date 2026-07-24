# Plan de Implementación: Filtros Dinámicos del Catálogo & Social Proof

Este plan integra las mejoras solicitadas para el catálogo público y la ficha de productos: filtros dinámicos basados únicamente en stock real, filtro por altitud en tramos de 300m desde 0m, notas de sabor editables desde el admin, y métricas de "Veces Compartido" (*Social Proof*).

## User Review Required
> [!IMPORTANT]
> A continuación presento la actualización con la escala exacta de altitud en incrementos de 300m desde 0m. Revisa la propuesta y confírmame si estás de acuerdo para proceder a su programación.

---

## Propuesta de Cambios (Implementación)

### 1. Notas de Sabor Editables en Admin (`ProductForm.tsx`)
#### [MODIFY] `src/components/admin/ProductForm.tsx`
- Añadir sección de **Notas de Sabor** con checkboxes/chips editables (ej. *🍒 Frutal, 🍫 Chocolatoso, 🌸 Floral, 🍋 Cítrico, 🌰 Avellanado, 🍬 Caramelo, 🍯 Miel*).
- Guardar estas notas asociadas al producto en la DB (`ProductFlavorNote`).

### 2. Filtro de Origen Dinámico (Solo Regiones con Stock)
#### [NEW] `src/server/actions/catalog.actions.ts`
- Acción de servidor `getAvailableCatalogFilters()` que consulta a Prisma y retorna:
  - Solo las regiones/municipios (`Origin`) que tengan al menos una variante con `stockQuantity > 0`.
  - Las notas de sabor disponibles en el catálogo activo.

### 3. Filtros Avanzados en Catálogo (`CatalogFilterBar.tsx`)
#### [NEW] `src/components/product/CatalogFilterBar.tsx`
- Componente de barra de filtros interactivo para `/catalogo`:
  - **Filtro Origen**: Lista desplegable con regiones/municipios colombianos que tienen stock en tiempo real.
  - **Filtro Altitud (Escala de 300m)**:
    - *Todas las altitudes*
    - *0m – 300m*
    - *300m – 600m*
    - *600m – 900m*
    - *900m – 1.200m*
    - *1.200m – 1.500m*
    - *1.500m – 1.800m*
    - *1.800m – 2.100m*
    - *+2.100m*
  - **Filtro Notas de Sabor**: Seleccionar por perfil sensorial (Floral, Cítrico, etc.).
  - **Botón "Buscar"**: Aplica todos los filtros seleccionados de una vez y actualiza la URL.

### 4. Tarjetas de Producto con Contador "Veces Compartido" (`ProductCard.tsx`)
#### [MODIFY] `src/components/product/ProductCard/ProductCard.tsx`
- Reemplazar la métrica genérica de estrellas por el indicador social: **`⭐ 800 veces compartido`** (o el número real de interacción registrado en DB).
- Añadir botón de **Compartir directo** que usa la API nativa del navegador (`navigator.share`) para compartir el enlace del producto en redes/WhatsApp e incrementar el contador social.

---

## Verification Plan
1. Ir al panel admin `/admin/productos/nuevo` y verificar que las notas de sabor sean seleccionables.
2. Ingresar a `/catalogo` y verificar que el filtro de "Origen" solo muestre regiones que tienen productos con stock.
3. Probar el filtro de "Altitud" con los nuevos rangos de 300m y hacer clic en el botón **"Buscar"**.
4. Inspeccionar la tarjeta de producto (`ProductCard`) para verificar el icono `⭐` con el contador de "veces compartido" y el botón para compartir.
