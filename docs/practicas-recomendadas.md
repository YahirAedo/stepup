# StepUp — Prácticas recomendadas para mejorar el proyecto

Este documento lista prácticas de ingeniería que el proyecto StepUp puede adoptar para
mejorar calidad, testabilidad, y velocidad de desarrollo en equipo. Está basado en el
análisis del proyecto Granix Portal (app.granixv1), que comparte stack TypeScript y
arquitectura similar.

Priorizado por **impacto ÷ esfuerzo**. Arrancá por el principio.

---

## Quick wins (alta prioridad)

| # | Práctica | Tiempo estimado | Dependencias |
|---|----------|----------------|--------------|
| 1 | Tests de tabla con vitest | ~2h | — |
| 2 | Hardening de tsconfig | ~15min | — |
| 3 | ESLint + Prettier | ~1h | — |
| 4 | Path aliases en tsconfig | ~30min | — |

---

## 1. Tests de tabla con vitest

**Por qué:** los Services tienen lógica pura (reindexación de pasos, avance automático,
getStepCounts) que hoy no tiene tests. En equipo de 3, un test roto te avisa al toque.

**Cómo:**

```bash
npm install -D vitest
```

Agregar a `package.json`:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Crear `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
});
```

**Tests de tabla (patrón):**

```typescript
import { describe, it, expect } from 'vitest';
import { StepService } from './StepService';

describe('StepService.complete', () => {
  // Acá van tests contra SQLite in-memory o mockeando getDb()
});
```

> **Tip:** los Services dependen de `getDb()`. Para testearlos sin base real,
> reemplazá `getDb` con un `expo-sqlite` en memoria o mejor aún: extraé la
> lógica pura de los Services. Ver sección 5.

---

## 2. Hardening de tsconfig

**Por qué:** `strict: true` solo no alcanza. Dos flags atrapan bugs comunes.

Editar `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Qué atrapa cada flag:**

| Flag | Bug que previene |
|------|-----------------|
| `noUncheckedIndexedAccess` | `orderedIds[i]` sin check de undefined |
| `exactOptionalPropertyTypes` | Pasar `undefined` a un campo opcional donde no corresponde |

**Lo que va a romper:** probablemente nada, o muy pocos lugares. Cada error
se arregla con un guard (`if (!x) continue`) o un `??`.

---

## 3. ESLint flat config + Prettier

**Por qué:** 3 personas → 3 estilos distintos. ESLint + Prettier unifica.

```bash
npm install -D eslint @eslint/js typescript-eslint prettier eslint-config-prettier
```

Crear `eslint.config.js`:

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  { ignores: ['node_modules/', '.expo/', 'dist/'] },
);
```

Crear `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

Agregar a `package.json`:
```json
"scripts": {
  "lint": "eslint src/",
  "format": "prettier --write src/"
}
```

---

## 4. Path aliases en tsconfig

**Por qué:** `'../../services/StepService'` es frágil. Con aliases queda
`@services/StepService` y los refactors no rompen imports.

En `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@services/*": ["src/services/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@types/*": ["src/types/*"],
      "@theme/*": ["src/theme/*"],
      "@database/*": ["src/database/*"]
    }
  }
}
```

Después, en el `metro.config.js` de Expo hay que agregar los mismos aliases
para que el bundler los entienda. Requiere instalar `babel-plugin-module-resolver`
y configurarlo en `babel.config.js`.

---

## 5. Funciones puras extraíbles de Services (mediano plazo)

**Por qué:** `StepService.complete()` mezcla queries SQL con lógica de negocio
("completo el paso, incremento progreso, busco el siguiente, si no hay siguiente
completo la tarea"). Separando la lógica en funciones puras:

- Se testean sin base de datos
- Se reutilizan si aparece otro canal (sync, API)
- El Service queda como adapter fino (mismo molde que issue #63 de Granix)

**Ejemplo:**

```typescript
// src/services/stepLogic.ts — función pura
export interface CompleteStepResult {
  nextStep: Step | null;
  taskCompleted: boolean;
}

export function evaluateStepCompletion(
  remainingSteps: Step[],
  completedStepId: number,
): CompleteStepResult {
  const nextPending = remainingSteps.find(
    (s) => s.status === 'pending' && s.id !== completedStepId,
  );
  return {
    nextStep: nextPending ?? null,
    taskCompleted: !nextPending,
  };
}
```

```typescript
// src/services/StepService.ts — adapter
async complete(id: number): Promise<CompleteStepResult> {
  const db = await getDb();
  const step = await db.getFirstAsync<Step>(`SELECT * FROM steps WHERE id = ?`, [id]);
  if (!step) return { nextStep: null, taskCompleted: false };

  await db.runAsync(`UPDATE steps SET status = 'completed' WHERE id = ?`, [id]);
  await ProgressService.increment();

  const remaining = await db.getAllAsync<Step>(
    `SELECT * FROM steps WHERE task_id = ? AND id != ?`,
    [step.task_id, id]
  );

  const result = evaluateStepCompletion(remaining, id);

  if (result.taskCompleted) {
    await TaskService.complete(step.task_id);
  }
  return result;
}
```

---

## 6. SKILL.md del Design System (mediano plazo)

**Por qué:** el DS Zenith Vitality está en `stitch_stepup_design_system/` pero no
hay un skill que un agente de IA pueda cargar para saber cómo escribir
componentes consistentes. Sin eso, cada pantalla rediseñada puede derivar en
estilos inconsistentes.

Crear `.claude/skills/zenith-vitality-ds/SKILL.md` con:

- **Tokens**: colores, tipografía, spacing, border radius, sombras
- **Componentes catalog**: Button, Card, Badge, TextField, GlassTabBar, etc.
  con interfaces de props, ejemplos de uso, variantes
- **Anti-patterns**: qué NO hacer (ej: colores hardcodeados, estilos inline
  en screens, fuentes del sistema)
- **Dark mode contract**: si aplica
- **Checklist pre-merge**: qué revisar antes de mergear una pantalla rediseñada

> **Referencia**: el skill `granix-ds` en app.granixv1 tiene esta estructura
> y puede usarse como template.

---

## 7. Husky + lint-staged (baja prioridad)

```bash
npm install -D husky lint-staged
npx husky init
```

En `.husky/pre-commit`:
```bash
npx lint-staged
```

En `package.json`:
```json
"lint-staged": {
  "*.ts": ["prettier --write", "eslint --fix"],
  "*.tsx": ["prettier --write", "eslint --fix"]
}
```

Con `npx tsc --noEmit` también en pre-commit.

---

## 8. ADR en markdown (baja prioridad)

Las decisiones técnicas están en `.docx` en `docs/`. Pasarlas a `docs/adr/`
en markdown las hace:

- Buscables con grep
- Visibles en GitHub sin descargar
- Versionables con el código

Formato sugerido (por decisión):

```markdown
# ADR-001: SQLite local sin backend en E1

**Fecha:** 2026-03-15
**Contexto:** Necesitábamos persistencia local sin servidor.
**Decisión:** SQLite vía expo-sqlite.
**Alternativas:** AsyncStorage (límite 6MB), Realm (overhead).
**Consecuencias:** App 100% offline, migración necesaria para E2.
```

---

## Checklist de implementación

- [ ] 1. Tests: vitest instalado + `npm run test` pasa
- [ ] 2. tsconfig: `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` activos
- [ ] 3. ESLint + Prettier: `npm run lint` y `npm run format` funcionan
- [ ] 4. Path aliases: imports usando `@services/`, `@components/`, etc.
- [ ] 5. Funciones puras: al menos `evaluateStepCompletion` extraída y testeada
- [ ] 6. SKILL.md del DS creada en `.claude/skills/zenith-vitality-ds/`
- [ ] 7. Husky: pre-commit ejecuta lint + format
- [ ] 8. ADRs migrados a `docs/adr/`

---

## Referencias

- Granix Portal — `app.granixv1` — el análisis base de estas prácticas
- [vitest](https://vitest.dev/)
- [TypeScript strict flags](https://www.typescriptlang.org/tsconfig/#strict)
- [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [expo-sqlite testing patterns](https://docs.expo.dev/versions/latest/sdk/sqlite/)
