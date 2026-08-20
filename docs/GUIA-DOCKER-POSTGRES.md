# Guía de Configuración — PostgreSQL con Docker

> Configuración local de la base de datos para desarrollo.

---

## Requisitos Previos

| Herramienta | Versión Mínima | Instalación |
|-------------|----------------|-------------|
| Docker Desktop | 4.x | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| Node.js | 18.x | [nodejs.org](https://nodejs.org/) |
| npm | 9.x | Incluido con Node.js |

Verificar instalación:
```bash
docker --version
docker compose version
```

---

## Paso 1: Levantar PostgreSQL

Desde la carpeta `backend/`:

```bash
cd backend
docker compose up -d
```

**Verificar que el contenedor esté corriendo:**
```bash
docker ps
```

Deberías ver:
```
CONTAINER ID   IMAGE                STATUS         PORTS                    NAMES
xxxxxxxxxxxx   postgres:16-alpine   Up X seconds   0.0.0.0:5432->5432/tcp   stepup-postgres
```

**Credenciales de la base de datos:**

| Parámetro | Valor |
|-----------|-------|
| Host | `localhost` |
| Puerto | `5432` |
| Usuario | `stepup_user` |
| Contraseña | `stepup_password` |
| Base de datos | `stepup_db` |

---

## Paso 2: Configurar Variables de Entorno

Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

El archivo `.env` ya contiene los valores correctos para desarrollo local:

```env
PORT=3000
DATABASE_URL="postgresql://stepup_user:stepup_password@localhost:5432/stepup_db?schema=public"
JWT_SECRET="genera-un-secreto-largo-y-unico"
```

**⚠️ Importante:** Para producción, genera un `JWT_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Paso 3: Instalar Dependencias y Aplicar Migraciones

```bash
# Instalar dependencias
npm install

# Aplicar migraciones de Prisma
npx prisma migrate deploy

# Generar cliente de Prisma
npx prisma generate
```

**Verificar que las migraciones se aplicaron:**
```bash
npx prisma migrate status
```

Deberías ver:
```
Database schema is up to date.

4 migrations found in prisma/migrations
```

---

## Paso 4: Verificar Conexión

**Opción A — Conectar con Prisma Studio:**
```bash
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555` para explorar la base de datos.

**Opción B — Conectar directamente con psql:**
```bash
docker exec -it stepup-postgres psql -U stepup_user -d stepup_db
```

Comandos útiles dentro de psql:
```sql
\dt              -- Listar tablas
\di              -- Listar índices
\d users         -- Ver estructura de tabla
SELECT * FROM users;
\q               -- Salir
```

---

## Paso 5: Ejecutar el Backend

```bash
npm run dev
```

El servidor iniciará en `http://localhost:3000`.

**Verificar con health check:**
```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{"status":"ok"}
```

---

## Comandos Útiles

### Docker

| Acción | Comando |
|--------|---------|
| Iniciar contenedor | `docker compose up -d` |
| Detener contenedor | `docker compose down` |
| Ver logs | `docker logs stepup-postgres` |
| Reiniciar | `docker compose restart` |
| Eliminar datos | `docker compose down -v` |

### Prisma

| Acción | Comando |
|--------|---------|
| Ver estado de migraciones | `npx prisma migrate status` |
| Crear nueva migración | `npx prisma migrate dev --name <nombre>` |
| Resetear base de datos | `npx prisma migrate reset` |
| Abrir Prisma Studio | `npx prisma studio` |
| Regenerar cliente | `npx prisma generate` |

### Tests

| Acción | Comando |
|--------|---------|
| Ejecutar todos los tests | `npm test` |
| Tests en modo watch | `npm run test:watch` |
| Tests con cobertura | `npm test -- --coverage` |

---

## Troubleshooting

### Error: "Port 5432 already in use"

Otro servicio está usando el puerto 5432. Opciones:

**Opción A — Detener el servicio conflictivo:**
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :5432
# Detener el proceso (Windows)
taskkill /PID <PID> /F
```

**Opción B — Cambiar puerto en docker-compose.yml:**
```yaml
ports:
  - "5433:5432"  # Mapea puerto 5433 del host al 5432 del contenedor
```

Y actualizar `DATABASE_URL` en `.env`:
```env
DATABASE_URL="postgresql://stepup_user:stepup_password@localhost:5433/stepup_db?schema=public"
```

### Error: "Connection refused"

El contenedor no está corriendo o no terminó de iniciar:
```bash
# Verificar estado
docker ps

# Si no aparece, iniciar
docker compose up -d

# Esperar 5 segundos y reintentar
```

### Error: "Database does not exist"

La base de datos no se creó correctamente:
```bash
# Eliminar contenedor y volumen
docker compose down -v

# Recrear desde cero
docker compose up -d

# Esperar 5 segundos
sleep 5

# Verificar que la DB existe
docker exec -it stepup-postgres psql -U stepup_user -c "\l"
```

### Error: "Migration engine error"

Las migraciones están en estado inconsistente:
```bash
# Resetear completamente
npx prisma migrate reset --force

# Reaplicar migraciones
npx prisma migrate deploy
```

---

## Estructura de la Base de Datos

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios registrados |
| `tasks` | Tareas del usuario |
| `steps` | Pasos de cada tarea |
| `daily_progress` | Progreso diario |
| `idempotency_keys` | Control de idempotencia para sync |

### Relaciones

```
users (1) ──< (N) tasks (1) ──< (N) steps
  │
  ├──< (N) daily_progress
  │
  └──< (N) idempotency_keys
```

---

## Flujo de Desarrollo Típico

```bash
# 1. Iniciar PostgreSQL
docker compose up -d

# 2. Iniciar backend en modo desarrollo
npm run dev

# 3. (Opcional) Abrir Prisma Studio para ver datos
npx prisma studio

# 4. Al terminar, detener PostgreSQL
docker compose down
```

---

## Recursos Adicionales

- [Prisma Docs](https://www.prisma.io/docs)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

*Última actualización: Agosto 2026*
