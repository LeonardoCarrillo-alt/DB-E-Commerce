# E-commerce Frontend

Proyecto frontend de la aplicación E‑Commerce (Vite + React + TypeScript).

**Resumen rápido**
- **Stack:** React, TypeScript, Vite.
- **Carpeta principal de código:** [src](ecommerce-frontend/src#L1)
- **Configuración del bundler:** [vite.config.ts](ecommerce-frontend/vite.config.ts#L1)
- **Definición de dependencias y scripts:** [package.json](ecommerce-frontend/package.json#L1)

**Requisitos**
- Node.js (16+ recomendado)
- npm o yarn

**Instalación**
1. Instalar dependencias:

```
npm install
```

**Comandos útiles**
- `npm run dev` — Inicia el servidor de desarrollo (Vite).
- `npm run build` — Genera la versión de producción.
- `npm run preview` — Previsualiza el build localmente.

**Estructura principal**
- `src/` — Código fuente principal.
  - `src/main.tsx` — Entrada de la aplicación ([src/main.tsx](ecommerce-frontend/src/main.tsx#L1)).
  - `src/App.tsx` — Componente raíz.
  - `src/api/` — Módulos para llamadas a la API (auth, product, order, etc.).
  - `src/components/` — Componentes reutilizables (Navbar, Footer, cart, forms, dashboard).
  - `src/hooks/` — Hooks personalizados (useAuth, useProducts, usePagination, ...).
  - `src/layouts/` — Layouts de la app: MainLayout, AuthLayout, AdminLayout.
  - `src/pages/` — Páginas por área: admin, customer, public.
  - `src/store/` — Estado global (slices, hooks).
  - `src/services/` — Lógica de negocio para llamadas y transformaciones.

**Configuración y variables de entorno**
- Si usa variables de entorno, colóquelas en un archivo `.env` en la raíz del proyecto.
- Revisa los archivos en `src/api/` para las claves o URLs necesarias del backend.

**Desarrollo y depuración**
- Vite recarga en caliente por defecto; modifica componentes y guarda para ver cambios instantáneos.
- Para inspeccionar peticiones API, utiliza la herramienta de red del navegador o usa logs en `src/api/`.

**Contribuir**
- Abrir PRs pequeñas y descriptivas.
- Ejecutar `npm install` y `npm run dev` antes de crear PR.

**Contacto**
- Responsable del frontend: revisa el repositorio y los commits para encontrar los autores.

---
Archivo generado automáticamente: resumen del frontend en la carpeta del proyecto.
