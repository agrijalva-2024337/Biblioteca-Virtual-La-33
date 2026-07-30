# Panel Admin / Docente — Biblioteca Virtual La 33

Cliente web (React + Vite + Tailwind) para `ADMIN_ROLE` y `TEACHER_ROLE`.

## Arranque

```bash
cd "Biblioteca 33/client-admin"
pnpm install   # o npm install
pnpm dev       # http://localhost:5173
```

## Variables (`.env`)

- `VITE_AUTH_URL`
- `VITE_FILES_URL`
- `VITE_MODERATION_URL`
- `VITE_NOTIFICATIONS_URL`
- `VITE_RECAPTCHA_SITE_KEY` (opcional en local)

## Rutas públicas de auth

| Ruta | Uso |
|------|-----|
| `/login` | Inicio de sesión |
| `/verify-email?token=` | Verificación de correo (enlace del email) |
| `/reset-password?token=` | Restablecer contraseña (enlace del email) |

## Arquitectura

```
src/
  app/           # router, layouts, guards
  features/      # auth, dashboard, moderation, materials, subjects, ...
  shared/        # api, components, utils, constants
```

Los paneles por rol usan `ProtectedRoute` + `RoleGuard`. El sidebar es drawer en móvil y fijo desde `md`.
