---
name: stepup-review
description: Revisión técnica de un PR de StepUp contra su issue y su contexto completo (comments, reviews, threads, sub-issues). Convenciones, design system, calidad y trayectoria. Usar en workflows de review de PRs.
---

# stepup-review

Revisión técnica estática de un Pull Request de StepUp contra la rama `develop`, pensado para correr en un workflow de GitHub Actions (agente opencode `skill-reviewer`, rol informativo).

## Reglas de ejecución

- **READ-ONLY absoluto.** No editar, crear o mover archivos; no hacer commit, push ni checkout. El permiso `edit: deny` del agente lo impone.
- **Sin builds ni tests.** La revisión es estática sobre el diff, el PR, su contexto asociado y los docs del repo. No ejecutar `npm`, `npx`, `yarn`, `bun`, `expo`.
- **Entrada:** el PR en revisión (número y repo provistos por el workflow via `gh`), la issue vinculada, el diff contra `develop`, el contexto asociado al PR (comments, reviews, threads y sub-issues de la issue) y los docs del repo.
- **Salida:** un único comentario de revisión en **español** con formato fijo. Es el mensaje final del agente; la acción de GitHub lo publica en el PR.
- El rol es **informativo**: el check no falla con `NEEDS WORK` ni `BLOCKED`. El veredicto es orientación para el revisor humano.

## Flujo

### 1. Identificar el PR y su issue

1. Obtener el PR: `gh pr view <number> --repo <owner/repo>` (json: `number`, `title`, `author`, `baseRefName`, `headRefName`, `body`, `additions`, `deletions`, `changedFiles`).
2. De `body`, extraer la issue vinculada con regex de vínculo de cierre: `Closes|Fixes|Resolves\s+#(\d+)`.
3. **Sin issue vinculada:** terminar con el comentario de skip (ver formatos). No analizar el diff.

### 2. Obtener el diff

- `gh pr diff <number> --repo <owner/repo>` entrega el diff contra la base.
- Contextos para juzgar: `baseRefName` (debe ser `develop`), archivos tocados, tamaño.

### 3. Recolectar el contexto asociado al PR

Antes de evaluar, recolectar todo lo que el GitHub actual sabe del PR y de su issue vinculada. Comandos de solo lectura vía `gh`:

1. `gh pr view <n> --repo <owner/repo> --json reviews,comments,commits` — reviews con estado (`APPROVED`/`CHANGES_REQUESTED`/`COMMENTED`), comentarios del PR (discusión de issue, incluye reviews humanas y la skill-review anterior) y mensajes de commits.
2. `gh api repos/<owner>/<repo>/pulls/<n>/comments` — threads de review inline (`path`, `line`, `body`, `user`, `in_reply_to_id`).
3. `gh api repos/<owner>/<repo>/issues/<issue>/sub_issues` — sub-issues de la issue vinculada (abiertas/cerradas). Si están abiertas, ese trabajo pendiente impacta el veredicto.
4. `gh issue view <n> --repo <owner/repo>` — título, body, ACs, labels y milestone de la issue (también usado en el eje A).

Identificar en los comentarios si ya existe una revisión skill-review anterior (`## Revisión técnica (skill-review)`) para comparar hallazgos previos vs. el diff actual.

### 4. Cargar convenciones del repo

- `AGENTS.md`, `docs/Contexto.md`, `docs/CONVENCIONES.md`, `.claude/skills/zenith-vitality-ds/SKILL.md`.
- Usarlos para juzgar el eje de convenciones; no comentar los archivos de workflow/CI del propio PR.

### 5. Ejes de revisión

**A. Fidelidad a la issue (bloqueante).**
- Leer la issue vinculada: `gh issue view <n> --repo <owner/repo>` (title, body, acceptance criteria, labels, milestone).
- ¿El PR resuelve lo que pide la issue? ¿Cubre todos los criterios de aceptación? ¿Trae alcance extra injustificado?
- ¿La issue tiene sub-issues abiertas que el PR NO cubre? En ese caso, el trabajo pendiente está trackeado en esas sub-issues (impacta el eje D).
- Si el PR no referenciaba issue y analizamos igual (no aplica aquí: sin issue = skip), evaluar contra el título del PR.

**B. Convenciones del repo y design system.**
- Git/workflow: ramas `feature/<tipo>/<numero>-<descripcion>`, commits convencionales, PR a `develop` (no a `main`), solo archivos relacionados al cambio.
- Backend: Express + Prisma + schema en `prisma/`, validación Zod en `schemas.ts`, JWT fail-closed, idempotencia en writes, tests con supertest.
- Frontend/Design System Zenith Vitality: colores/tipografía/espaciado/sombras SIEMPRE desde el theme en `src/theme/` — nunca hardcodear. Componentes reutilizables en `src/components/`, no en screens. Respetar tokens y anti-patterns del SKILL del DS.

**C. Calidad y congruencia del código.**
- TypeScript estricto: sin `as any` (valores reales, tipado honesto), sin `@ts-ignore`, sin duplicar tipos que ya existen.
- Congruencia con el resto del código: mismos patrones, mismos nombres, mismo manejo de errores, APIs consistentes.
- Sin deuda nueva innecesaria, sin lógica muerta, sin código comentado.
- No comentar estilo subjetivo; solo lo que afecta corrección, mantenibilidad o consistencia del proyecto.

**D. Contexto y trayectoria del PR (bloqueantes ajenos al diff).**
- **Body desactualizado vs. diff real:** ¿la descripción del PR (archivos, versiones, features) refleja lo que el diff realmente hace? Un body que cita archivos/cambios que ya no están genera confusión en el merge.
- **Hallazgos previos:** si hay una skill-review anterior en los comments, ¿los hallazgos que señaló se resolvieron en el diff actual o persisten? Reportar solo los que persisten o los nuevos, no repetir los ya resueltos.
- **Threads de review sin resolver:** si hay reviews humanas `CHANGES_REQUESTED` o threads inline que el diff no aborda, el PR no está listo aunque el código actual esté bien.
- **Sub-issues abiertas del issue vinculado:** si existen, el work pendiente está trackeado fuera del diff (p. ej. #198/#199 bajo #124). El PR puede estar OK y aun así no ser mergeable hasta cerrarlas.
- **Commits:** formato convencional y coherencia con el fix declarado (ej. el body afirma una cosa y los commits hacen otra).

### 6. Emitir veredicto

Combinar A + B + C + D. Estados:

- `APPROVED` — cumple issue, convenciones y calidad; no hay hallazgos bloqueantes (o solo nits) ni pendientes ajenos al diff.
- `NEEDS WORK` — uno o más hallazgos bloqueantes dentro del propio PR: falta cobertura de la issue, violación clara de convenciones/DS, defecto de calidad/congruencia, o un body que no refleja el diff.
- `BLOCKED` — el diff del PR está técnicamente correcto y cumple su issue, PERO el contexto lo retiene: sub-issues abiertas del issue vinculado, reviews humanas `CHANGES_REQUESTED` sin resolver, o threads de review que el diff no aborda. No es que el PR esté mal; es que hay trabajo asociado pendiente fuera de su alcance actual.
- `SKIPPED` — sin issue vinculada (no se analiza el diff).

> El check del workflow es informativo: `NEEDS WORK` / `BLOCKED` NO bloquean el merge. Priorizar hallazgos accionables, anclados a `archivo:línea`.

> Si hay hallazgos bloqueantes en el diff Y pendientes ajenos: usar `NEEDS WORK` y listar también los bloqueantes externos en el contexto. `BLOCKED` queda reservado para "el diff está bien pero el contexto no lo deja mergear".

## Formatos de salida

### Comentario normal

```markdown
## Revisión técnica (skill-review)

**PR:** #<number> — <title>
**Base:** <base> ← <head>
**Issue vinculada:** #<n> (<title>)
**Tamaño:** +<add> −<del> en <files> archivos

**Veredicto: `APPROVED`** | `NEEDS WORK` | `BLOCKED`

### Contexto del PR
- Reviews: `CHANGES_REQUESTED` por @user (fecha) · skill-review previa: `NEEDS WORK` → hallazgos resueltos: 1/3
- Sub-issues abiertas de la issue vinculada: #198, #199
- Threads inline sin resolver: <n> (o "ninguno")
- Body vs diff: coherente | desactualizado (<qué menciona que ya no está>)

### Resumen
<2-4 líneas: qué hace el PR, si cumple la issue y las convenciones, estado general>

### Hallazgos
- **«Nivel»** `path/al/archivo.ts:línea` — descripción concisa y accionable. («Bloqueante» | «Importante» | «Sugerencia»)

### Cobertura de la issue
- [x] Criterio 1
- [ ] Criterio pendiente
```

### Comentario de skip (sin issue vinculada)

```markdown
## Revisión técnica (skill-review)

**PR:** #<number> — <title>

Sin issue vinculada (`Closes|Fixes|Resolves #N` ausente en el body). Se omite el análisis del diff.

**Veredicto: `SKIPPED`**
```

### Comentario bloqueado por contexto (ejemplo)

```markdown
## Revisión técnica (skill-review)

**PR:** #175 — fix: idempotencia client-side
**Base:** develop ← fix/124-idempotencia-client-side
**Issue vinculada:** #124 (bug: idempotencia client-side anulada)
**Tamaño:** +120 −40 en 5 archivos

**Veredicto: `BLOCKED`**

### Contexto del PR
- Reviews: `CHANGES_REQUESTED` por @user (04/09) · skill-review previa: `NEEDS WORK` → hallazgos resueltos: 1/3
- Sub-issues abiertas de la issue vinculada: #198, #199
- Threads inline sin resolver: 1 (payload_hash persiste password en claro)
- Body vs diff: coherente

### Resumen
El PR repara la idempotencia del push con claves estables, pero el trabajo pendiente queda trackeado en sub-issues abiertas de #124. El diff en sí no tiene hallazgos bloqueantes nuevos.

### Hallazgos
- **Importante** `src/services/idempotency.ts:44` — hallazgo previo de la skill-review anterior persiste (ver #198). No repetir el análisis completo: remitir a la sub-issue.

### Cobertura de la issue
- [x] Claves estables por llamada (push/migrate)
- [ ] AC4: syncLifecycle ante fallo de red (trackeada en #199)
```

## Anti-patrones

- NO correr builds, tests ni instalación de dependencias.
- NO salir del repo: sin navegar a paths externos, sin URLs, sin web.
- NO alabar el trabajo ni usar adjetivos vacíos; solo hallazgos y veredicto.
- NO multiples comentarios: el mensaje final ES el comentario.
- NO editores de texto ni herramientas de escritura: `edit`, `write`, `patch` están denegados.
- NO repetir hallazgos ya resueltos en el diff actual: si una skill-review anterior los marcó y el diff los corrigió, no volver a listarlos.
- NO emitir `BLOCKED` por cuerpo de PR desactualizado: eso es `NEEDS WORK` (el arreglo está en el propio PR). `BLOCKED` es solo para trabajo pendiente fuera del diff (sub-issues abiertas, reviews/threads ajenos).
- NO asumir que una sub-issue abierta implica necesariamente que el diff esté mal: reportarla como pendiente en el contexto, no como hallazgo de código.
