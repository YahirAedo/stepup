# StepUp — Guía para agentes

## Stack

- React Native + Expo SDK 54 (no usar SDK 55)
- TypeScript
- SQLite local (expo-sqlite)
- Backend E2: Node.js + Express + Prisma + PostgreSQL + Railway
- Diseño: Sistema Zenith Vitality (stitch_stepup_design_system/)

## Documentos obligatorios (leer antes de tocar código)

| Orden | Documento | Por qué |
|-------|-----------|---------|
| 1 | `docs/Contexto.md` | Contexto completo del proyecto, entregas, decisiones técnicas |
| 2 | `docs/CONVENCIONES.md` | Reglas de estilo, arquitectura, git y calidad para el equipo |
| 3 | `.claude/skills/zenith-vitality-ds/SKILL.md` | Design System: tokens, componentes, anti-patterns |

**Regla:** cualquier agente que genere código debe leer estos 3 documentos primero.
No hacerlo produce código inconsistente y PRs rechazadas.

## Diseño y componentes

- Todos los colores, tipografía, espaciado y sombras vienen del theme en `src/theme/`
-**NUNCA** hardcodear colores, fuentes o spacing
- Componentes reutilizables en `src/components/`, no en screens
- Ver catálogo completo en `.claude/skills/zenith-vitality-ds/SKILL.md`

## Flujo de trabajo en Git

Nunca commitear directo a `main`.

```
main        ← Entrega final. Solo recibe merges desde develop.
develop     ← Frontend (app RN). Rama base para issues de frontend.
develop2    ← TRANSIORIO: backend (E2). Se unifica con develop y desaparece.
feature/*   ← Una rama por cambio. Formato: feature/<tipo>/<numero>-<descripcion>
```

Regla de ramas:
- Issue de **backend** → rama desde `develop2` → PR a `develop2`.
- Issue de **frontend** → rama desde `develop` → PR a `develop`.

Pasos para cada cambio:

1. `git checkout <rama-correcta> && git pull` (develop2 para backend, develop para frontend)
2. `git checkout -b feature/<tipo>/<numero>-<descripcion>` (ej. `fix/67-idempotencia-push`)
3. Hacer commits con formato convencional: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`
4. **Solo stagear archivos relacionados al cambio** — prohibido `git add -A`, `git add .`, `git commit -a`. Si aparece un alcance nuevo, crear una issue aparte.
5. `git push origin feature/<tipo>/<numero>-<descripcion>`
6. Crear Pull Request a la rama correcta siguiendo `.github/PULL_REQUEST_TEMPLATE.md`
7. Alguien más revisa y mergea con squash (nadie mergea su propio PR)

## Issues

Los issues de E2 están en GitHub. Al tomar una issue: auto-asignarse (pull rule),
usar las labels correspondientes al tipo. No se usa `ready-for-agent`.
Referencia: https://github.com/YahirAedo/stepup/issues

## Expo

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.
