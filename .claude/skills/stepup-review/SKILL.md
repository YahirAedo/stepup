---
name: stepup-review
description: Revisión técnica de un PR de StepUp contra su issue (convenciones, design system y calidad). Usar en workflows de review de PRs.
---

# stepup-review

Revisión técnica estática de un Pull Request de StepUp contra la rama `develop`, pensado para correr en un workflow de GitHub Actions (agente opencode `skill-reviewer`, rol informativo).

## Reglas de ejecución

- **READ-ONLY absoluto.** No editar, crear o mover archivos; no hacer commit, push ni checkout. El permiso `edit: deny` del agente lo impone.
- **Sin builds ni tests.** La revisión es estática sobre el diff, el PR y los docs del repo. No ejecutar `npm`, `npx`, `yarn`, `bun`, `expo`.
- **Entrada:** listar el PR en revisión (número y repo provistos por el workflow via `gh`), la issue vinculada, el diff contra `develop`, y los docs del repo.
- **Salida:** un único comentario de revisión en **español** con formato fijo. Es el mensaje final del agente; la acción de GitHub lo publica en el PR.
- El rol es **informativo**: el check no falla con `NEEDS WORK`. El veredicto es orientación para el revisor humano.

## Flujo

### 1. Identificar el PR y su issue

1. Obtener el PR: `gh pr view <number> --repo <owner/repo>` (json: `number`, `title`, `author`, `baseRefName`, `headRefName`, `body`, `additions`, `deletions`, `changedFiles`).
2. De `body`, extraer la issue vinculada con regex de vínculo de cierre: `Closes|Fixes|Resolves\s+#(\d+)`.
3. **Sin issue vinculada:** terminar con el comentario de skip (ver formatos). No analizar el diff.

### 2. Obtener el diff

- `gh pr diff <number> --repo <owner/repo>` entrega el diff contra la base.
- Contextos para juzgar: `baseRefName` (debe ser `develop`), archivos tocados, tamaño.

### 3. Cargar convenciones del repo

- `AGENTS.md`, `docs/Contexto.md`, `docs/CONVENCIONES.md`, `.claude/skills/zenith-vitality-ds/SKILL.md`.
- Usarlos para juzgar el eje de convenciones; no comentar los archivos de workflow/CI del propio PR.

### 4. Ejes de revisión

**A. Fidelidad a la issue (bloqueante).**
- Leer la issue vinculada: `gh issue view <n> --repo <owner/repo>` (title, body, acceptance criteria, labels, milestone).
- ¿El PR resuelve lo que pide la issue? ¿Cubre todos los criterios de aceptación? ¿Trae alcance extra injustificado?
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

### 5. Emitir veredicto

Combinar A + B + C:
- `APPROVED` — cumple issue, convenciones y calidad; no hay hallazgos bloqueantes (o solo nits).
- `NEEDS WORK` — uno o más hallazgos bloqueantes: falta cobertura de la issue, violación clara de convenciones/DS, o defecto de calidad/congruencia.

> El check del workflow es informativo: `NEEDS WORK` NO bloquea el merge. Priorizar hallazgos accionables, anclados a `archivo:línea`.

## Formatos de salida

### Comentario normal

```markdown
## Revisión técnica (skill-review)

**PR:** #<number> — <title>
**Base:** <base> ← <head>
**Issue vinculada:** #<n> (<title>)
**Tamaño:** +<add> −<del> en <files> archivos

**Veredicto: `APPROVED`** | `NEEDS WORK`

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

## Anti-patrones

- NO correr builds, tests ni instalación de dependencias.
- NO salir del repo: sin navegar a paths externos, sin URLs, sin web.
- NO alabar el trabajo ni usar adjetivos vacíos; solo hallazgos y veredicto.
- NO multiples comentarios: el mensaje final ES el comentario.
- NO editores de texto ni herramientas de escritura: `edit`, `write`, `patch` están denegados.