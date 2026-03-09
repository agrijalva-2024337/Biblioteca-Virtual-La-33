# Biblioteca Virtual La 33
- Proyecto academico desarrollado en el Centro Educativo Tecnico Laboral Kinal
Grupo: La 33 | Profesor: Braulio Echeverria | Fecha: 13/02/2026


## Descripcion

- Biblioteca Virtual La 33 es una plataforma digital disenada para estudiantes de cuarto y quinto grado del Instituto Kinal.
- Permite acceder de forma organizada a material de apoyo academico como videos explicativos, guias, formulas y recursos para asignaturas como Lenguaje, Matematica, Fisica, Estadistica, Quimica.


## Tecnologias usadas

- ASP.NET Core 8 (Auth Service)
- Node.js (Files, AI, Moderation, Notifications)
- JWT para autenticacion y autorizacion
- PostgreSQL (Auth Service, Moderation)
- MongoDB (Files, AI/OCR, Notifications)
- Tesseract.js (OCR)
- Docker
- GitHub


## Instalacion
- Para los servicios Node.js, npm install y npm start en cada uno
- Opcionalmente levantar todo con docker compose up -d

### Prerrequisitos

- .NET 8 SDK
- Node.js v18+
- Docker (recomendado)
- PostgreSQL corriendo en puerto `5436`
- MongoDB corriendo en puerto por defecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Biblioteca-Virtual-La-33.git
cd Biblioteca-Virtual-La-33
```

### 2. Configurar el Auth Service (.NET)

```bash
cd auth-service/src/AuthService.Api
```
Edita `appsettings.json` con tus credenciales (ver seccion de Variables de Entorno).



### 3. Instalar microservicios Node.js

```bash
npm install
npm start
```

### 4. Levantar con Docker (opcional)

```bash
docker compose up --d
```

## Uso

- Registro: El usuario crea una cuenta con su correo institucional y recibe un email de verificacion.
- Login: Ingresa con sus credenciales y obtiene un token JWT.
- Explorar recursos: Navega por materias y accede a archivos, guias y videos.
- Subir material: Los usuarios con rol autorizado pueden subir documentos, los cuales pasan por validacion IA (OCR) y moderacion manual.
- Notificaciones: El sistema notifica sobre aprobaciones, rechazos y actividad relevante.
- Administracion: Los administradores gestionan roles y moderan contenido.

### Roles disponibles

| Rol | Descripcion |
|-----|-------------|
| `student` | Consulta y descarga recursos |
| `profesor` | Sube material academico |
| `moderator` | Revisa archivos pendientes |
| `admin` | Gestion completa del sistema |


## Estructura del proyecto

```
Biblioteca-Virtual-La-33/
|
|- auth-service/                    
|   |- src/
|       |- AuthService.Api/         
|       |   |- Controllers/         
|       |   |- Extensions/          
|       |   |- Middlewares/        
|       |- AuthService.Application/ 
|       |- AuthService.Domain/      
|       |- AuthService.Persistence/ 
|
|- files-service/                   
|- ai-service/                      
|- moderation-service/              
|- notifications-service/           
|
|- postgre_db/                      
|- docker-compose.yml               
```


## Endpoints (Auth Service)

Base URL: `https://localhost:5001/api/v1`

### Autenticacion

| Metodo | Endpoint | Descripcion | Auth requerida |
|--------|----------|-------------|----------------|
| `POST` | `/auth/register` | Registro de nuevo usuario | No |
| `POST` | `/auth/login` | Iniciar sesion, retorna JWT | No |
| `GET` | `/auth/profile` | Obtener perfil del usuario autenticado | JWT |
| `POST` | `/auth/profile/by-id` | Obtener perfil por ID | No |
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


### Endpoints (Servicio de Archivos)

### Endpoints (Servicio de IA)

### Endpoints (Servicio de Moderacion)

### Moderaciones
| Metodo | Endpoint | Descripcion | Auth requerida |
|--------|----------|-------------|----------------|
| `GET` | `/moderations`| Obtener todas las moderaciones | JWT |
| `GET` | `/moderations/{id}`| Obtener una moderacion por ID | JWT |
| `POST` | `/moderations` | Crear una nueva solicitud de moderacion | JWT |
| `PATCH` | `/moderations/{id}/approve` | Aprobar una moderacion | Admin |
| `PATCH` | `/moderations/{id}/reject` | Rechazar una moderacion | Admin |


### Endpoints (Servicio de Notificaciones)



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