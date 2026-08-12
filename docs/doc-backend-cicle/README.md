# Backend StepUp — Documentación técnica (Fase E2)

> Documentación rigurosa para defensa de arquitectura de software.
> Rama: `feature/backend-express-prisma-postgres` — Agosto 2026.

| Doc | Tema |
|---|---|
| [01 — Evolución Arquitectónica](01-evolucion-arquitectonica.md) | Transición E1 → E2: offline-first (SQLite) → cliente-servidor de 3 capas. SoC y Sustitución |
| [02 — Infraestructura y Modelo Relacional](02-infraestructura-modelo-relacional.md) | Docker + PostgreSQL 16, `schema.prisma`, migraciones e integridad referencial (`ON DELETE CASCADE`) |
| [03 — El Orquestador y los Invariantes](03-orquestador-invariantes.md) | `TaskService.completeTask` (HTTP 409), `StepService.completeStep`, métrica idempotente |
| [04 — Estrategia de Testing](04-estrategia-testing.md) | Jest + Supertest, base efímera `stepup_test`, `maxWorkers: 1`, 20 casos |
| [05 — Integración y Manejo de Red en el Cliente](05-integracion-red-cliente.md) | `apiFetch`, `EXPO_PUBLIC_API_URL`, `ApiError`, estados de carga/error/reintento |
| [06 — Idempotencia segura en PATCH](06-idempotencia-patch.md) | `Idempotency-Key`, transacción atómica, replay de respuestas, plan de implementación |

Todos los documentos citan archivos y líneas del repositorio real.
