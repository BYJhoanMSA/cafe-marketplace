# Revisión pendiente — Dashboard: Clientes, Usuarios, Roles (rc-2.8.09.8)

> Fecha de creación: 10/ago/2026 · Commit: `15a7632` · Tag: **`rc-2.8.09.8`** (pendiente de revisión, no stable)
> Verificación: **`npx tsc --noEmit` OK** y **`npm run build` OK** (rutas compiladas). No se pudo probar en vivo: **MySQL local (`localhost:3306`) estaba apagado** → probar con la DB levantada o directamente en producción.

---

## 1. Páginas creadas (antes daban 404)

| Ruta | Qué hace |
|---|---|
| `/admin/clientes` | Lista de usuarios con rol `customer`: buscador (email/nombre/teléfono), filtro por estado, columnas de pedidos y total gastado, paginación. |
| `/admin/clientes/[id]` | Detalle: perfil, direcciones, pedidos, favoritos/reseñas, botón Bloquear/Activar. |
| `/admin/usuarios` | Lista de staff (`admin`/`vendor`) con su rol, estado, último acceso y link a su marca. |
| `/admin/usuarios/nuevo` | Crear cuenta staff (nombre, email, teléfono, contraseña mín 8, rol admin/vendor). |
| `/admin/usuarios/[id]` | Editar perfil/rol/estado + formulario de resetear contraseña (no visible en tu propia cuenta). |
| `/admin/roles` | Matriz RBAC derivada de `src/server/auth/roles.ts` + conteos reales de `users.role` + cambio rápido de rol por usuario. |

Archivos clave:
- Acciones: `src/server/actions/admin/user.actions.ts` (permiso `users:manage`, solo admin).
- Componentes: `src/components/admin/{StaffForm,ResetPasswordForm,RoleChangeSelect,UserStatusButton}.tsx`.

## 2. Checklist de verificación (como admin)

- [ ] `/admin/clientes` carga y lista clientes reales con pedidos y total gastado.
- [ ] Buscar por nombre/email/WhatsApp y filtrar por estado funciona.
- [ ] Entrar a un cliente → ver direcciones y pedidos (link a `/admin/pedidos/[id]`).
- [ ] **Bloquear** a un cliente: pide confirmación, al recargar aparece "Bloqueado". **Activar** lo revierte.
- [ ] `/admin/usuarios` muestra las cuentas admin/vendor y marca "(tú)" en la propia.
- [ ] Crear un usuario staff nuevo → aparece en la lista y puede iniciar sesión con la contraseña dada.
- [ ] Editar un staff: cambiar rol/estado se guarda. **Resetear contraseña** funciona (inicia sesión con la nueva).
- [ ] `/admin/roles`: las tarjetas de conteo coinciden con la cantidad real de usuarios por rol.
- [ ] En la matriz de permisos: Admin = todos ✓; Vendor = solo productos/marca propios ✓; Cliente = ninguno ✓.
- [ ] Cambiar el rol de un vendor → customer desde `/admin/roles` y comprobar que pierde acceso al panel.

## 3. Salvaguardas de seguridad (probar si es posible)

- [ ] Un usuario **vendor/customer** recibe 403/redirect al entrar a `/admin/clientes`, `/admin/usuarios` o `/admin/roles` (middleware + guard de página).
- [ ] No se puede **bloquear a tu propia cuenta** (botón no disponible / error).
- [ ] No se puede **cambiar el rol de tu propia cuenta** ni **degradar al último admin activo** (error controlado).
- [ ] El email de un usuario staff **no se puede cambiar** (campo de solo lectura).

## 4. Decisiones / notas

- **Sin migraciones**: la DB de producción no cambió. Los roles son el string `users.role`; la matriz de permisos vive en `src/server/auth/roles.ts` (si se quiere ajustar permisos, se edita ahí).
- El menú ya tenía las entradas en `AdminShell.tsx`; con las páginas creadas desaparecen los 404.
- Pedidos de invitados (sin `userId`) no se atribuyen a clientes.
- Los precios usan `formatPrice` (centavos); el módulo turismo usa `formatPesos` (pesos) — no mezclar.
- `reportes`, `configuraciones` y `logs` siguen en el menú sin página (404) — quedaron fuera de alcance.

## 5. Pasos de cierre al aprobar

- [ ] Promover el tag a stable: `git tag -a stable-2.8.09.8 -m "..."` y `git push origin stable-2.8.09.8`.
- [ ] Actualizar `turismo.md` y `lista_de_pendientes.md` (ya marcados como implementado — pendiente revisión).
