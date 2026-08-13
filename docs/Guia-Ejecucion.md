# Guía de Ejecución StepUp — Backend + App Mobile

> **Última actualización:** Agosto 2026 | Proyecto StepUp — Entrega 2 (E2)

---

## 1. Requisitos previos

- **Docker** debe estar corriendo (container `stepup-postgres` ya levantado)
- **Node.js** + **npm** (versión 20+ recomendada)
- **Expo CLI** para la app móvil: `npm i -g expo-cli`
- **Git** para el repositorio

---

## 2. Levantar la base de datos (PostgreSQL)

El backend usa PostgreSQL vía Docker. El container ya está configurado:

```bash
# Desde el directorio raíz del repo
docker start stepup-postgres

# Verificar: docker ps → debe mostrar stepup-postgres en puerto 5432
```

---

## 3. Levantar el Backend (API REST)

```bash
# Desde el directorio stepup/backend
cd backend

# Instalar dependencias (primera vez)
npm install

# Generar cliente Prisma
npm run prisma:generate

# Verificar migraciones aplicadas
npm run prisma:migrate  # o usar docker si ya está configurado

# Ejecutar en modo desarrollo
npm run dev
# → Se escuchará en http://localhost:3000

# O build y start directo:
npm run build
npm run start
```

### Variables de entorno `.env` (en `backend/`)

El archivo `.env` ya existe con configuración por defecto. Ver `.env.example` para referencia. Lo esencial:

```
PORT=3000
DATABASE_URL=postgresql://stepup_user:stepup_password@localhost:5432/stepup_test?schema=public
JWT_SECRET=tu_secreto_muy_seguro
```

---

## 4. Probar la API

El backend tiene 58 tests que cubren todos los endpoints. Para probar manualmente:

### Health check

```bash
curl http://localhost:3000/api/health
# → {"status":"ok"}

curl http://localhost:3000/health
# → {"status":"ok"} (mantenido por compatibilidad)
```

### Endpoints principales probados

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/auth/register` | POST | Registrar nuevo usuario |
| `/api/auth/login` | POST | Iniciar sesión |
| `/api/auth/me` | GET | Ver perfil (requiere JWT) |
| `/api/tasks` | GET/POST | Listar/crear tareas |
| `/api/tasks/:id` | PUT/DELETE | Actualizar/eliminar tarea |
| `/api/tasks/:taskId/steps` | GET/POST | Listar/crear pasos de una tarea |
| `/api/steps/:id` | PUT | Actualizar paso |
| `/api/sync/push` | POST | Sincronizar cambios locales |
| `/api/sync/pull` | GET | Traer cambios remotos |
| `/api/sync/migrate` | POST | Migración al registrarse |

---

## 5. Levantar la app móvil (React Native + Expo)

```bash
# Desde la raíz del proyecto
npm start
# o: npx expo start

# Escanear código QR con la app Expo Go en tu teléfono Android
# O presionar 'a' para Android, 'i' para iOS
```

### Flujo de pruebas

1. **Sin cuenta (offline puro):** La app funciona 100% con SQLite local. Puedes crear tareas, pasos, completar, etc. Sin necesidad de backend.

2. **Con cuenta (modo sync):**  
   - Regístrate con `POST /api/auth/register` 
   - Login con `POST /api/auth/login`
   - El token JWT se guarda en AsyncStorage
   - Las operaciones escritas como "dirty" se sincronizan push/pull con el servidor

3. **Migración de datos:** Al registrarte por primera vez, el flujo `migrate` envía todos tus tareas/pasos locales al servidor y asigna UUIDs server_id.

---

## 6. Comandos útiles

```bash
# Desde la raíz del proyecto
npm test              # Ejecutar tests (vitest: 75 tests en app, backend: 58 tests)
npm run typecheck     # Verificar TypeScript en todo el proyecto
npm run lint          # Lint en src/ del app
cd backend && npm test  # Tests del backend solo

# Desde backend
npm run prisma:studio  # Ver base de datos en interfaz visual (http://localhost:5555)
```

---

## 7. Flujo completo de verificación

Para confirmar que todo funciona como en la entrega B3:

1. `npm run typecheck` → **OK**
2. `cd backend && npm test` → **58/58 passing**
3. `npm test` (raíz) → **75/75 passing**
4. Probar endpoints con curl o Postman
5. Probar en dispositivo físico con Expo Go

> **Nota:** El backend está deployado en producción en Railway:  
> `https://stepup-backend-api-production.up.railway.app`  
> En la app se configura vía `EXPO_PUBLIC_API_URL` en las variables de entorno.

---
*Guía generada para ejecución local del proyecto StepUp E2.*