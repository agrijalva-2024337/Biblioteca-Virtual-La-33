# Biblioteca Virtual La 33
- Proyecto academico desarrollado en el Centro Educativo Tecnico Laboral Kinal
Grupo: La 33 | Profesor: Braulio Echeverria | Fecha: 13/02/2026


## Descripcion

- Biblioteca Virtual La 33 es una plataforma digital disenada para estudiantes de cuarto y quinto grado del Instituto Kinal.
- Permite acceder de forma organizada a material de apoyo academico como videos explicativos, guias, formulas y recursos para asignaturas como Lenguaje, Matematica, Fisica, Estadistica, Quimica.
- El sistema esta construido como una arquitectura de microservicios, donde el envio de archivos pasa por un pipeline automatico de OCR + clasificacion con IA y, cuando hace falta, por moderacion humana antes de quedar publicado.


## Tecnologias usadas

- ASP.NET Core 8 (Auth Service)
- Node.js + Express (Files, AI/OCR, Moderation, Notifications)
- JWT para autenticacion y autorizacion de usuarios
- API key interna (header `x-internal-key`) para llamadas servicio-a-servicio
- PostgreSQL (solo Auth Service)
- MongoDB (Files Service, Moderation Service, Notification Service)
- Cloudinary (almacenamiento de archivos en Files Service)
- Tesseract.js + Groq (OCR y clasificacion con IA en AI Service)
- nodemailer (envio de correos en Notification Service) / MailKit (envio de correos en Auth Service)
- Docker (PostgreSQL) y GitHub

> Nota: el **AI/OCR Service no usa base de datos propia**: procesa el archivo en memoria/disco temporal y reporta el resultado por HTTP a los demas servicios.


## Instalacion
- Para los servicios Node.js: `npm install` (o `pnpm install`) y `npm start` en cada carpeta de servicio.
- Opcionalmente levantar PostgreSQL con `docker compose up -d`.

### Prerrequisitos

- .NET 8 SDK
- Node.js v18+ (el interop CommonJS/ESM con la carpeta `shared/` requiere Node >= 20.19)
- Docker (recomendado para PostgreSQL)
- PostgreSQL corriendo en puerto `5436` (lo levanta el `docker-compose.yml`)
- MongoDB corriendo en puerto `27017` (lo levanta el `docker-compose.yml` junto con PostgreSQL)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Biblioteca-Virtual-La-33.git
cd Biblioteca-Virtual-La-33
```

### 2. Configurar el Auth Service (.NET)

```bash
cd "Biblioteca 33/auth-service/src/AuthService.Api"
```
Edita `appsettings.json` con tus credenciales (ver seccion de Variables de entorno).

### 3. Instalar microservicios Node.js

En cada carpeta de servicio (`files-service`, `ai-service`, `moderation-service`, `notification-service`):

```bash
npm install
npm start
```

### 4. Levantar bases de datos con Docker

```bash
cd "Biblioteca 33"
docker compose up -d
```

Levanta PostgreSQL (`5436`) y MongoDB (`27017`).

## Uso

- Registro: El usuario crea una cuenta con su correo institucional y recibe un email de verificacion.
- Login: Ingresa con sus credenciales y obtiene un token JWT.
- Explorar recursos: Navega por materias y accede a archivos, guias y videos.
- Subir material: Los usuarios autenticados pueden subir documentos, los cuales pasan por un pipeline de OCR + clasificacion IA y, si la IA no esta segura, por moderacion manual.
- Notificaciones: El sistema notifica al estudiante cuando su archivo es aprobado o rechazado, y puede consultar sus notificaciones in-app.
- Administracion: Los administradores gestionan roles de usuario y moderan contenido.

### Roles disponibles

Los roles reales del sistema estan definidos en `auth-service/src/AuthService.Domain/Constants/RoleConstants.cs`:

| Rol | Descripcion |
|-----|-------------|
| `USER_ROLE` | Rol por defecto. Puede subir material, consultar/buscar archivos **aprobados**, comentar y ver materias y sus propias notificaciones. |
| `TEACHER_ROLE` | Puede moderar material de sus asignaturas, consultar materiales y ver el panel docente. La creacion/edicion de grados y asignacion de docentes es solo admin. |
| `ADMIN_ROLE` | Control total: usuarios, grados/asignaturas, moderacion, notificaciones y materiales. |

> Nota: no existen roles separados `student`, `profesor` ni `moderator`. El alumno es `USER_ROLE`, el docente es `TEACHER_ROLE`. La moderacion la realizan `ADMIN_ROLE` y `TEACHER_ROLE` (este ultimo filtrado por asignaturas asignadas).


## Estructura del proyecto

```
Biblioteca-Virtual-La-33/
|
|- Biblioteca 33/
|   |- auth-service/                   # .NET 8 + PostgreSQL
|   |- files-service/                  # Node + Express + MongoDB + Cloudinary
|   |- ai-service/                     # Node + Express (OCR + IA)
|   |- moderation-service/             # Node + Express + MongoDB
|   |- notification-service/           # Node + Express + MongoDB + nodemailer
|   |- client-admin/                   # React + Vite (admin/docente)
|   |- client-user/                    # Expo / React Native (estudiante)
|   |- shared/                         # JWT, API key interna, helpers
|   |- docs/scrum/                     # Evidencias SCRUM para la evaluacion
|   |- docker-compose.yml              # PostgreSQL + MongoDB
|
|- README.md
```

## Puertos por servicio

| Servicio | Puerto | Base de datos |
|----------|--------|---------------|
| auth-service | 5074 (http) | PostgreSQL (`5436`) |
| moderation-service | 3000 | MongoDB |
| ai-service | 3001 | (ninguna) |
| files-service | 3003 | MongoDB + Cloudinary |
| notification-service | 3005 | MongoDB |


## Endpoints (Auth Service)

Base URL: `https://localhost:5001/api/v1`

### Autenticacion

| Metodo | Endpoint | Descripcion | Auth requerida |
|--------|----------|-------------|----------------|
| `POST` | `/auth/register` | Registro de nuevo usuario | No |
| `POST` | `/auth/login` | Iniciar sesion, retorna JWT | No |
| `GET` | `/auth/profile` | Obtener perfil del usuario autenticado | JWT |
| `POST` | `/auth/profile/by-id` | Obtener perfil por ID (staff o el propio usuario) | JWT |
| `POST` | `/auth/verify-email` | Verificar correo electronico | No |
| `POST` | `/auth/resend-verification` | Reenviar email de verificacion | No |
| `POST` | `/auth/forgot-password` | Solicitar reseteo de contrasena | No |
| `POST` | `/auth/reset-password` | Establecer nueva contrasena | No |

### Usuarios

| Metodo | Endpoint | Descripcion | Auth requerida |
|--------|----------|-------------|----------------|
| `PUT` | `/users/{userId}/role` | Actualizar rol de usuario | Admin |
| `GET` | `/users/{userId}/roles` | Obtener roles de un usuario | JWT |
| `GET` | `/users/by-role/{roleName}` | Listar usuarios por rol | Admin |

### Health

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/health` | Estado del servicio |


## Endpoints (Servicio de Archivos)

Base URL: `http://localhost:3003` (las rutas se montan sin prefijo de version). Documentacion Swagger en `/api-docs`.

### Archivos

| Metodo | Endpoint | Descripcion | Auth requerida |
|--------|----------|-------------|----------------|
| `POST` | `/files/upload` | Subir un archivo (multipart). Dispara el pipeline de IA. `uploadedBy` se toma del JWT. | JWT (USER / TEACHER / ADMIN) |
| `GET` | `/files` | Listar archivos. Estudiantes (`USER_ROLE`) solo ven `approved`. | JWT |
| `GET` | `/files/search?q=` | Buscar archivos por titulo (estudiantes: solo aprobados) | JWT |
| `PATCH` | `/files/{id}/status` | **Endpoint interno**: actualizar el estado de un archivo (`pending` / `approved` / `rejected`). Lo llaman ai-service y moderation-service. | API key interna (`x-internal-key`) |

### Comentarios

| Metodo | Endpoint | Descripcion | Auth requerida |
|--------|----------|-------------|----------------|
| `POST` | `/comments` | Crear un comentario (`fileId`, `text`). El autor se toma del JWT. | JWT |
| `GET` | `/comments/{fileId}` | Listar comentarios de un archivo | JWT |

### Materias

| Metodo | Endpoint | Descripcion | Auth requerida |
|--------|----------|-------------|----------------|
| `POST` | `/subjects` | Crear una materia nueva | JWT + rol `ADMIN_ROLE` o `TEACHER_ROLE` |
| `GET` | `/subjects` | Listar materias | JWT |


## Endpoints (Servicio de IA)

Base URL: `http://localhost:3001/IA-OCR-Service/v1`. Documentacion Swagger en `/docs`.

| Metodo | Endpoint | Descripcion | Auth requerida |
|--------|----------|-------------|----------------|
| `POST` | `/pipeline/process-file` | **Endpoint interno**: OCR + clasificacion IA. Lo llama files-service. | API key interna (`x-internal-key`) |
| `POST` | `/pipeline/test-upload` | Endpoint de prueba/desarrollo: sube un archivo local y lo procesa. No usar en produccion. | No |
| `GET` | `/health` | Estado del servicio | No |


## Endpoints (Servicio de Moderacion)

Base URL: `http://localhost:3000/Biblioteca/v1`

### Moderaciones
| Metodo | Endpoint | Descripcion | Auth requerida |
|--------|----------|-------------|----------------|
| `GET` | `/moderations`| Obtener moderaciones (paginado; docentes filtrados por asignatura) | JWT + `ADMIN_ROLE` / `TEACHER_ROLE` |
| `GET` | `/moderations/{id}`| Obtener una moderacion por ID | JWT + `ADMIN_ROLE` / `TEACHER_ROLE` |
| `POST` | `/moderations` | Crear solicitud de moderacion (lo llama ai-service) | API key interna (`x-internal-key`) |
| `PATCH` | `/moderations/{id}/approve` | Aprobar una moderacion | JWT + `ADMIN_ROLE` / `TEACHER_ROLE` |
| `PATCH` | `/moderations/{id}/reject` | Rechazar una moderacion | JWT + `ADMIN_ROLE` / `TEACHER_ROLE` |


## Endpoints (Servicio de Notificaciones)

Base URL: `http://localhost:3005/Biblioteca/v1/notifications`

| Metodo | Endpoint | Auth | Descripcion |
|--------|----------|------|-------------|
| `POST` | `/send` | API key interna (`x-internal-key`) | Enviar email generico entre servicios. |
| `POST` | `/send-template` | API key interna (`x-internal-key`) | Enviar por plantilla: `welcome`, `verify-email`, `reset-password`, `generic`. |
| `GET` | `/` | JWT | Listar notificaciones del usuario autenticado (paginado: `page`, `limit`, `type`). |
| `GET` | `/{id}` | JWT | Obtener una notificacion por ID (solo el dueno o `ADMIN_ROLE`). |
| `PATCH` | `/{id}/read` | JWT | Marcar notificacion como leida. |
| `POST` | `/internal/file-status` | API key interna (`x-internal-key`) | **Endpoint interno**: crea una notificacion in-app de archivo aprobado/rechazado. Lo llaman ai-service y moderation-service. |

> Los endpoints marcados como **internos** (`PATCH /files/{id}/status` y `POST /internal/file-status`) **no** usan JWT de usuario: se autentican con una API key compartida entre microservicios enviada en el header `x-internal-key` y validada contra la variable de entorno `INTERNAL_SERVICE_KEY`. No estan pensados para ser consumidos desde el frontend.


## Flujo de aprobacion de contenido

Este es el corazon del proyecto: el recorrido completo desde que un usuario sube un archivo hasta que recibe la notificacion del resultado.

1. **Subida.** Un usuario autenticado sube un archivo con `POST /files/upload` (files-service). Se crea el documento `File` en MongoDB con `status = "pending"` y `uploadedBy` tomado del JWT (no del body, por seguridad).

2. **Disparo del pipeline.** files-service llama (HTTP) a `POST /pipeline/process-file` de ai-service con `fileId`, `uploadedBy` y la URL del archivo. Si ai-service no responde, la subida igual termina bien (la llamada esta envuelta en try/catch).

3. **OCR.** ai-service descarga el archivo y extrae el texto (texto de PDF, OCR de imagen u OCR de PDF escaneado segun el tipo) usando Tesseract.js.

4. **Clasificacion con IA.** ai-service manda el texto a Groq, que devuelve una de tres clasificaciones: `material_apoyo`, `tarea_resuelta` o `incierto`, mas una razon.

5. **Decision segun la clasificacion:**
   - `material_apoyo` → ai-service llama a `PATCH /files/{id}/status` con `status: "approved"` y notifica al estudiante.
   - `tarea_resuelta` → ai-service llama a `PATCH /files/{id}/status` con `status: "rejected"` y la razon de la IA, y notifica al estudiante.
   - `incierto` → ai-service **no** cambia el estado del archivo (sigue en `pending`) y crea un registro de moderacion pendiente en moderation-service (`POST /moderations`).

6. **Moderacion manual (solo si fue `incierto`).** Un administrador revisa la moderacion pendiente y decide:
   - `PATCH /moderations/{id}/approve` o `PATCH /moderations/{id}/reject` (con razon).
   - moderation-service guarda el cambio en el registro `Moderation` y luego llama a `PATCH /files/{id}/status` en files-service para sincronizar el estado del archivo. Si esa sincronizacion falla, el cambio de moderacion ya quedo guardado y se registra un log de desincronizacion para revision manual.

7. **Notificacion al estudiante.** Tanto en la via automatica (ai-service) como en la manual (moderation-service), se llama a `POST /internal/file-status` de notification-service con `{ userId, fileId, status, reason }`. notification-service crea una notificacion in-app (`file_approved` / `file_rejected`) que el estudiante puede consultar con `GET /Biblioteca/v1/notifications`.

8. **Resultado final.** El `File` en MongoDB siempre termina reflejando la decision real (`approved` o `rejected`), ya sea automaticamente por la IA o tras la revision humana, y el estudiante queda notificado en ambos casos.

Toda llamada entre microservicios usa variables de entorno (`*_URL`) con fallback a `localhost` y, en los endpoints internos, el header `x-internal-key`.


## Variables de entorno

Solo se listan los **nombres** de las claves (sin valores reales). La misma `INTERNAL_SERVICE_KEY` debe ser identica en los cuatro servicios Node.

### auth-service (.NET — `appsettings.json`, no usa `.env`)
- `ConnectionStrings:DefaultConnection` (PostgreSQL)
- `JwtSettings:SecretKey`, `JwtSettings:Issuer`, `JwtSettings:Audience`, `JwtSettings:ExpirationMinutes`
- `SmtpSettings:Host`, `SmtpSettings:Port`, `SmtpSettings:Username`, `SmtpSettings:Password`, `SmtpSettings:FromEmail`, `SmtpSettings:FromName`, `SmtpSettings:Enabled`
- `AppSettings:FrontendUrl`
- `RecaptchaSettings:Enabled` (bool; `false` omite validación en local)
- `RecaptchaSettings:SecretKey` (Google reCAPTCHA v2 secret)
- `RecaptchaSettings:SiteKey` (documental; los clientes usan su propia env var)

### files-service (`.env`)
- `PORT`, `SERVICE_NAME`, `NODE_ENV`
- `MONGO_URI`
- `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`
- `AI_SERVICE_URL`, `MODERATION_URL`, `NOTIFICATION_SERVICE_URL`
- `INTERNAL_SERVICE_KEY`

### ai-service (`.env`)
- `PORT`
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`
- `GROQ_API_KEY`
- `MODERATION_URL`, `FILES_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`
- `INTERNAL_SERVICE_KEY`

### moderation-service (`.env`)
- `PORT`
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`
- `URI_MONGODB`
- `AI_SERVICE_URL`, `FILES_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`
- `INTERNAL_SERVICE_KEY`

### notification-service (`.env`)
- `PORT`, `SERVICE_NAME`, `NODE_ENV`
- `URI_MONGODB`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `SMTP_ENABLED`
- `FRONTEND_URL`
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`
- `AI_SERVICE_URL`, `FILES_SERVICE_URL`, `MODERATION_URL`
- `INTERNAL_SERVICE_KEY`

### client-admin (`.env`)
- `VITE_AUTH_URL`, `VITE_FILES_URL`, `VITE_MODERATION_URL`, `VITE_NOTIFICATIONS_URL`
- `VITE_RECAPTCHA_SITE_KEY` (Google reCAPTCHA v2 site key; vacío = widget omitido)

### client-user (`.env`)
- `EXPO_PUBLIC_AUTH_URL`, `EXPO_PUBLIC_FILES_URL`, `EXPO_PUBLIC_NOTIFICATIONS_URL`
- `EXPO_PUBLIC_RECAPTCHA_SITE_KEY` (misma site key que el admin; vacío = widget omitido)

### Activar Google reCAPTCHA v2 (checkbox)

1. En [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) crea un sitio tipo **reCAPTCHA v2 → "No soy un robot" Checkbox**.
2. Dominios: `localhost` (desarrollo) y el dominio de producción del admin / webview.
3. Copia la **Site Key** a:
   - `client-admin/.env` → `VITE_RECAPTCHA_SITE_KEY`
   - `client-user/.env` → `EXPO_PUBLIC_RECAPTCHA_SITE_KEY` (misma key)
4. Copia la **Secret Key** a auth-service (`appsettings.json` o secretos de entorno):
   - `RecaptchaSettings:SecretKey` = secret
   - `RecaptchaSettings:Enabled` = `true` (en local puede quedar `false` para omitir validación)
5. Reinicia Vite (`pnpm dev`), Expo (`pnpm start --clear`) y auth-service.

En **desarrollo** sin site key, los clientes muestran un aviso con el nombre de la variable. En **producción** sin site key, el login/registro se deshabilita con un mensaje genérico (no se exponen nombres de env).


## Limitaciones conocidas / trabajo futuro

- **Endpoint de prueba `POST /pipeline/test-upload`.** Es solo para desarrollo (sube un archivo local sin auth); deberia deshabilitarse o protegerse en produccion.
- **auth-service envia correos directamente (MailKit) en `EmailService.cs`.** Los enlaces apuntan a `AppSettings:FrontendUrl` (`/verify-email` y `/reset-password` en client-admin). Existe duplicacion deliberada con las plantillas de notification-service.
- **API key interna en texto plano.** `INTERNAL_SERVICE_KEY` es una clave estatica compartida; suficiente para el alcance academico.
- **Sin pruebas automatizadas.** Los servicios Node no tienen suite de tests todavia (el script `test` es un placeholder).
- **`ai-service` no persiste resultados.** El resultado de OCR/IA no se guarda; solo se reenvia por HTTP.

## Evidencias SCRUM

Ver `Biblioteca 33/docs/scrum/EVIDENCIAS.md` (roles, DoD, checklist de ceremonias y tablero).


## Autores

| Nombre | Carne | Rol |
|--------|-------|-----|
| Angel Gabriel Ernesto Grijalva Castro | 2024337 | Scrum Master - Developer, Auth Service e Integracion |
| Jose Enrique Cuc Cutz | 2024100 | Product Owner - Developer, Servicio de Moderacion |
| Benjamin Eli Argueta Caal | 2024358 | Developer, Servicio de Notificaciones |
| Wilson Pasan del Cid | 2024243 | Developer, Servicio de Archivos (MongoDB) |
| Francisco Emanuel Milian Gonzales | 2024356 | Developer, Agente IA + OCR |

---

Centro Educativo Tecnico Laboral Kinal - 2026
