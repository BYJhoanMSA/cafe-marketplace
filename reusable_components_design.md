# Diseño de Componentes Reutilizables (Design System Completo)

Este documento detalla la arquitectura de todos los componentes reutilizables (UI Kit) necesarios para el Marketplace. **Nota:** Algunos de estos componentes ya fueron implementados en la Fase 4, pero los documentamos aquí junto con los nuevos que faltan por construir para tener el sistema completo.

## User Review Required
> [!IMPORTANT]
> Por favor, revisa el diseño de los componentes listados a continuación. Una vez que apruebes, procederé a generar el código **únicamente para los componentes que faltan** (Modal, Drawer, Toast, Accordion, etc.), respetando la arquitectura de CSS Modules.

---

## 1. Componentes Ya Implementados (Fase 4)

Para contexto, estos componentes ya están en código y en uso:
- **Button**: Polimórfico (`as` prop), maneja estados de loading, íconos y 5 variantes.
- **Input**: Accesible, con label flotante y manejo de errores.
- **Badge**: Semántico para mostrar estado (Score SCA, tags).
- **ProductCard**: Tarjeta estándar de producto.
- **MobileFeedSlide**: Tarjeta estilo TikTok para móvil.
- **Navbar / Footer**: Navegación global.

---

## 2. Nuevos Componentes a Desarrollar (UI Core)

### 2.1. Modal (Dialog)
- **Responsabilidad**: Interrumpir el flujo para solicitar información o mostrar detalles críticos (ej. Quick View, Modal de Login).
- **Props**: `isOpen` (boolean), `onClose` (function), `title` (string), `size` (sm | md | lg | full), `children` (ReactNode).
- **Eventos**: `onClose`, `Escape` keydown, Click outside (backdrop).
- **Estados**: Internamente usa Radix UI o un `<dialog>` nativo para focus trap.
- **Accesibilidad**: Focus trap automático, `aria-modal="true"`, `role="dialog"`, botón explícito de cierre, retorno del foco al elemento disparador tras cerrar.
- **Responsive**: En desktop aparece centrado. En mobile ocupa toda la pantalla (100dvh).
- **Optimización**: Renderizado condicional del contenido solo cuando está abierto. Uso de Portals para inyectarlo en la raíz del DOM.
- **Animaciones**: Fade-in del backdrop, Scale-in/Slide-up del contenedor usando CSS transitions.

### 2.2. Drawer (SidePanel / BottomSheet)
- **Responsabilidad**: Mostrar contenido lateral o inferior sin perder el contexto principal. Ideal para el **Carrito de compras (Mini-cart)** y **Filtros en móvil**.
- **Props**: `isOpen`, `onClose`, `position` (right | left | bottom), `children`.
- **Eventos**: `onClose`, Touch swipe-to-close (en móvil).
- **Accesibilidad**: Mismas reglas que el Modal (Focus trap, aria-attributes).
- **Responsive**: Desktop (Sidebar a la derecha para el carrito). Mobile (Bottom Sheet que sube desde abajo para los filtros o el carrito).
- **Optimización**: Lazy loading de componentes pesados dentro del drawer.
- **Animaciones**: Slide-in desde el borde correspondiente con función de aceleración `cubic-bezier` para simular fricción natural.

### 2.3. Toast (Notification System)
- **Responsabilidad**: Dar feedback temporal no intrusivo tras una acción del usuario ("Producto añadido al carrito", "Error de pago").
- **Props**: Ninguna prop directa (se controla vía un Contexto/Store). La función de llamada recibirá: `message`, `type` (success | error | info), `duration`.
- **Estados**: Cola de notificaciones activas.
- **Accesibilidad**: `role="status"` o `role="alert"`, `aria-live="polite"`.
- **Responsive**: Flotan en la esquina superior derecha en desktop, y en la parte inferior (sobre el tab bar) en mobile.
- **Optimización**: Desmontaje automático (unmount) tras expirar. Máximo 3 toasts visibles en pantalla simultáneamente.
- **Animaciones**: Slide-in + Fade, colapso suave al desaparecer.

### 2.4. Accordion (Disclosure)
- **Responsabilidad**: Ocultar y mostrar grandes bloques de texto para evitar saturación visual (Ej. FAQs, Detalles técnicos del café en el PDP).
- **Props**: `items` (Array de `{ title, content }`), `allowMultiple` (boolean).
- **Estados**: Índice(s) de los paneles abiertos.
- **Accesibilidad**: Teclas `ArrowUp/Down` para navegar entre headers, `Space/Enter` para abrir. `aria-expanded` y `aria-controls`.
- **Animaciones**: Animación del `height` (de 0 al `scrollHeight`) usando un grid-template-rows trick o transition max-height. Rotación de ícono (chevron).

### 2.5. Select (Custom Dropdown)
- **Responsabilidad**: Selector de opciones estilizado cuando el `<select>` nativo no cumple con el diseño requerido (Ej. Filtros en Catálogo).
- **Props**: `options`, `value`, `onChange`, `placeholder`.
- **Eventos**: `onSelect`, Click outside.
- **Accesibilidad**: Uso de `role="listbox"`, `role="option"`. Soporte completo de teclado.
- **Responsive**: En desktop, un dropdown clásico. En mobile, delega a un Drawer nativo inferior para mejor UX (como iOS picker).

### 2.6. QuantitySelector (Stepper)
- **Responsabilidad**: Seleccionar la cantidad de un producto (PDP o Carrito).
- **Props**: `value`, `min`, `max`, `onChange`.
- **Eventos**: Click en `+` / `-`, input directo en el campo numérico con validación (debounce).
- **Accesibilidad**: Botones con `aria-label`, campo input `type="number"` con `aria-valuemin/max`.

---

## Relaciones entre Componentes

1. **`Drawer` + `ProductCard` (Carrito)**: El Drawer actuará como contenedor del Mini-cart. Las tarjetas de producto en el carrito usarán una versión horizontal (compacta) basada en `ProductCard`.
2. **`Modal` + `Input` + `Button` (Auth)**: El inicio de sesión rápido (Magic Link) se renderizará dentro de un `Modal`, utilizando los `Input` de email y los `Button` de submit (con su estado de loading).
3. **`Toast` (Feedback Global)**: Casi todos los eventos de interacción (agregar al carrito, login, errores) dispararán un `Toast`.
4. **`Accordion` + `ProductDetailPage`**: En pantallas móviles, las especificaciones técnicas del café (altitud, finca, proceso) se encapsularán en un `Accordion` para ahorrar espacio en la ficha del producto.

---

¿Apruebas este diseño estructural de los componentes faltantes para que proceda a generarlos siguiendo nuestra arquitectura de Next.js y CSS Modules?
