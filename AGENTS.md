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
| 1 | `docs/Contexto cambiable.md` | Contexto completo del proyecto, entregas, decisiones técnicas |
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
develop     ← Integración diaria. Rama base para todo.
feature/*   ← Una rama por cambio.
```

Pasos para cada cambio:

1. `git checkout develop && git pull`
2. `git checkout -b feature/<nombre-del-cambio>`
3. Hacer commits con formato convencional: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`
4. **Solo stagear archivos relacionados al cambio** — prohibido `git add -A`, `git add .`, `git commit -a`
5. `git push origin feature/<nombre-del-cambio>`
6. Crear Pull Request a `develop`
7. Mergear a `develop`

## Issues

Los issues de E2 están en GitHub con label `ready-for-agent`.
Referencia: https://github.com/YahirAedo/stepup/issues

## Expo

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.
