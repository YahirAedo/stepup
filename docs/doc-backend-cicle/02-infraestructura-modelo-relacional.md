# 02 — Infraestructura y Modelo Relacional (Docker, PostgreSQL y Prisma)

> Documento técnico para defensa de arquitectura de software.
> Proyecto: **StepUp** — Rama: `feature/backend-express-prisma-postgres`

---

## 1. Alcance

Este documento cubre la **capa de datos** de la Fase E2: la contenerización de
PostgreSQL con Docker, el modelo relacional definido en Prisma y la estrategia
de migraciones. El hilo conductor es que la **integridad referencial se delega
al motor de base de datos**, no se resuelve con código de aplicación.

---

## 2. Infraestructura: PostgreSQL contenerizado con Docker

### 2.1 Definición (`backend/docker-compose.yml`)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: stepup-postgres
    restart: always
    environment:
      POSTGRES_USER: stepup_user
      POSTGRES_PASSWORD: stepup_password
      POSTGRES_DB: stepup_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

| Decisión | Justificación |
|---|---|
| `postgres:16-alpine` | Imagen oficial, liviana (aprox. 200 MB menos que la estándar), apta para desarrollo local y posterior deploy en Railway |
| `container_name` fijo | El nombre estable permite inspeccionar con `docker exec -it stepup-postgres psql ...` y conectar DBeaver sin ambigüedad |
| `ports: "5432:5432"` | Expone el puerto estándar en el host para que la API y las herramientas de gestión lo alcancen |
| Volumen `postgres_data` | Persistencia real: los datos sobreviven a `docker compose down` (no se pierden al detener el contenedor) |
| `restart: always` | El servicio vuelve a levantarse ante reinicios de Docker |

### 2.2 Ciclo de vida

```bash
docker compose up -d          # levantar (crea el volumen si no existe)
docker compose down           # detener (el volumen se conserva)
docker exec -it stepup-postgres psql -U stepup_user -d stepup_db   # consola SQL
```

### 2.3 Múltiples bases sobre el mismo servidor

El mismo contenedor aloja **dos bases lógicas**, una por entorno:

| Base | Uso | Enlace |
|---|---|---|
| `stepup_db` | Desarrollo (la API la usa en runtime) | `backend/.env` → `DATABASE_URL` |
| `stepup_test` | Pruebas automatizadas (efímera) | `backend/jest.env.setup.js` → `DATABASE_URL` (ver doc 04) |

Separar las bases evita que la suite de tests (que resetea el esquema) destruya
datos de desarrollo.

---

## 3. Modelo relacional con Prisma

### 3.1 El schema (`backend/prisma/schema.prisma`)

El esquema es un **espejo relacional del esquema SQLite de E1**
(`src/database/migrations.ts`): mismas tablas, mismas columnas en `snake_case`
(vía `@map`), mismos enums y misma FK en cascada.

```prisma
enum TaskStatus { active  completed }
enum StepStatus  { pending completed }

model Task {
  id          Int        @id @default(autoincrement())
  name        String
  dueDate     DateTime?  @map("due_date")
  status      TaskStatus @default(active)
  createdAt   DateTime   @default(now()) @map("created_at")
  completedAt DateTime?  @map("completed_at")
  steps       Step[]
  @@map("tasks")
}

model Step {
  id          Int        @id @default(autoincrement())
  taskId      Int        @map("task_id")
  name        String
  durationMin Int?       @map("duration_min")
  orderIndex  Int        @map("order_index")
  status      StepStatus @default(pending)
  completedAt DateTime?  @map("completed_at")
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  @@map("steps")
}

model DailyProgress {
  id             Int    @id @default(autoincrement())
  date           String @unique
  stepsCompleted Int    @default(0) @map("steps_completed")
  @@map("daily_progress")
}
```

### 3.2 Tablas y restricciones

| Tabla | Columnas | Restricción clave |
|---|---|---|
| `tasks` | id, name, due_date, status, created_at, completed_at | `status` enum `TaskStatus`, default `active` |
| `steps` | id, task_id, name, duration_min, order_index, status, completed_at | FK `task_id → tasks.id`, `status` enum `StepStatus` |
| `daily_progress` | id, date, steps_completed | `date` **UNIQUE** (garantiza una fila por día) |

### 3.3 Integridad referencial delegada al motor

El punto técnico central de este documento:

```prisma
task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
```

`ON DELETE CASCADE` es **una cláusula del motor PostgreSQL**, no una regla del
código. Consecuencias verificables:

1. Al borrar una tarea, la base de datos elimina **automáticamente** sus pasos.
   El repositorio ni siquiera ejecuta un `DELETE` sobre `steps`
   (`backend/src/repositories/task.repository.ts:40-42`):

   ```ts
   async delete(id: number) {
     return prisma.task.delete({ where: { id } });
   }
   ```

2. La consistencia **no depende de que el desarrollador recuerde** borrar en
   orden; es un comportamiento atómico garantizado por el motor.
3. La prueba de integración `tasks.test.ts` lo verifica de extremo a extremo:
   `DELETE /api/tasks/:id` → `204`, y la consulta posterior de pasos devuelve
   `[]` (ver doc 04).

**Argumento académico:** la capa de aplicación se apoya en las **capacidades
nativas del sistema de gestión de base de datos** en lugar de reimplementar la
consistencia en código. Esto reduce el *surface* de bugs y eleva la integridad a
una propiedad del esquema, auditable y declarativa.

### 3.4 `daily_progress.date` como `String` YYYY-MM-DD

La métrica diaria usa `String @unique` en vez de `DateTime`. Es una decisión
consciente para **alinearse con el formato del cliente móvil** (`new Date().toISOString().split('T')[0]`), lo que hace triviales los joins por fecha en
`GET /api/progress` y la comparación con el "hoy" del dispositivo. La
unicidad (`@unique`) habilita además el `upsert` idempotente del orquestador
(ver doc 03).

---

## 4. Migraciones

### 4.1 Estrategia

- **Desarrollo:** migraciones versionadas con `npx prisma migrate dev --name <nombre>`.
  La migración inicial (`init`) está aplicada y versionada en
  `backend/prisma/migrations/`. Cada cambio de esquema produce una migración
  reproducible en cualquier entorno.
- **Testing:** se usa `npx prisma db push --force-reset --skip-generate` contra
  `stepup_test` en `jest.globalSetup.js` (ver doc 04): el esquema se deriva
  directamente del schema, ideal para bases efímeras.
- **Producción (Railway):** se aplicarían las migraciones versionadas con
  `prisma migrate deploy`, garantizando el mismo esquema en todos los entornos.

### 4.2 Scripts disponibles (`backend/package.json`)

| Script | Comando | Uso |
|---|---|---|
| `prisma:migrate` | `prisma migrate dev` | Crear/aplicar migraciones en desarrollo |
| `prisma:generate` | `prisma generate` | Regenerar el cliente TS |
| `prisma:studio` | `prisma studio` | Explorar datos en el navegador |

---

## 5. Del esquema SQLite (E1) al relacional (E2): correspondencia

| E1 (SQLite, `migrations.ts`) | E2 (Prisma) | Diferencias |
|---|---|---|
| `tasks (id, name, due_date, status, created_at, completed_at)` | `tasks` + enum `TaskStatus` | `status` tipado como enum en vez de `TEXT` libre |
| `steps (task_id, ...)` + `FOREIGN KEY ... ON DELETE CASCADE` | `steps` + relación Prisma con `onDelete: Cascade` | La misma semántica, ahora declarada en el schema |
| `daily_progress (date TEXT NOT NULL UNIQUE, ...)` | `daily_progress.date String @unique` | Equivalente directo |
| Seed de datos embebido en `migrations.ts` | Sin seed en el backend | Los tests crean sus propios datos vía la API |

La equivalencia semántica entre ambos esquemas reduce el costo de la
sincronización futura y demuestra que el modelo de dominio no cambió: lo que
cambió fue el **medio de persistencia**.

---

## 6. Resumen

- **Docker** aporta un PostgreSQL reproducible, aislado y persistente.
- **Prisma** declara el modelo con tipos, enums, `@map` y **FK con `ON DELETE CASCADE`**, delegando la integridad referencial al motor.
- **Dos bases** (`stepup_db`/`stepup_test`) aíslan desarrollo de pruebas.
- **Migraciones versionadas** garantizan el mismo esquema en todo el ciclo de vida.

**Siguiente documento:** `03-orquestador-invariantes.md` — la capa de servicios
que defiende las reglas de negocio sobre este modelo de datos.
