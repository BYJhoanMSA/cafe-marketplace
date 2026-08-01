-- Cambios para permitir hard delete de productos con items en carrito

-- 1. Hacer variantId nullable
ALTER TABLE cart_items MODIFY variantId VARCHAR(36) NULL;

-- 2. Agregar columna isDeleted
ALTER TABLE cart_items ADD COLUMN isDeleted BOOLEAN NOT NULL DEFAULT false;

-- 3. Eliminar FK antigua y recrearla con ON DELETE SET NULL
ALTER TABLE cart_items DROP FOREIGN KEY cart_items_variantId_fkey;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_variantId_fkey 
  FOREIGN KEY (variantId) REFERENCES variants(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- MIGRACIÓN MULTIUSUARIO — Producto → Propietario (createdById)
-- Aplicar con: node scripts/migrate-add-product-owner.cjs
-- -----------------------------------------------------------------------------
-- 1. Agregar columna nullable (los datos se backfillean antes de hacer NOT NULL)
ALTER TABLE products ADD COLUMN createdById VARCHAR(36) NULL;

-- 2. Backfill: asignar como propietario el usuario dueño del Vendor del producto.
--    (Vendor.userId es la fuente más fiel de propiedad de los datos existentes)
UPDATE products p
  JOIN vendors v ON p.vendorId = v.id
  SET p.createdById = v.userId
  WHERE p.createdById IS NULL;

-- 3. Fallback: cualquier producto sin vendor asociado → Administrador General
--    (primer usuario con rol admin por antigüedad)
UPDATE products
  SET createdById = (
    SELECT id FROM (
      SELECT id FROM users WHERE role = 'admin' ORDER BY createdAt ASC LIMIT 1
    ) t
  )
  WHERE createdById IS NULL;

-- 4. Índice para consultas por propietario
CREATE INDEX products_createdById_idx ON products(createdById);

-- 5. FK hacia users (RESTRICT: un usuario con productos no puede eliminarse)
ALTER TABLE products ADD CONSTRAINT products_createdById_fkey
  FOREIGN KEY (createdById) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- 6. Propietario obligatorio
ALTER TABLE products MODIFY createdById VARCHAR(36) NOT NULL;
