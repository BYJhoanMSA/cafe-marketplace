-- Cambios para permitir hard delete de productos con items en carrito

-- 1. Hacer variantId nullable
ALTER TABLE cart_items MODIFY variantId VARCHAR(36) NULL;

-- 2. Agregar columna isDeleted
ALTER TABLE cart_items ADD COLUMN isDeleted BOOLEAN NOT NULL DEFAULT false;

-- 3. Eliminar FK antigua y recrearla con ON DELETE SET NULL
ALTER TABLE cart_items DROP FOREIGN KEY cart_items_variantId_fkey;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_variantId_fkey 
  FOREIGN KEY (variantId) REFERENCES variants(id) ON DELETE SET NULL ON UPDATE CASCADE;
