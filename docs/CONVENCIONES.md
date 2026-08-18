# StepUp — Convenciones del proyecto

> Este documento existe para que los 3 integrantes + cualquier agente de IA trabajen
> con las mismas reglas. No es opcional. Si una PR rompe estas reglas, se rechaza.

---

## 1. Estilos y presentación

### 1.1 Siempre usar theme tokens, NUNCA colores hardcodeados

```tsx
// ✅ CORRECTO
<View style={{ backgroundColor: colors.surface }} />
<Text style={{ color: colors['on-surface'] }} />

// ❌ INCORRECTO
<View style={{ backgroundColor: '#F8FAFF' }} />
<Text style={{ color: '#1A3A5C' }} />
```

**Excepción:** colores dinámicos que no existen en el theme (ej: color de gráfico por categoría).
Justificar con un comentario.

### 1.2 Tipografía: usar los estilos del theme, nunca `as any`

El sistema de tipos `ThemeTypography` necesita que los estilos se usen correctamente:

```tsx
// ✅ CORRECTO
<Text style={typography['headline-md'] as TextStyle}>

// ❌ INCORRECTO — si no funciona, arreglar el tipo, no poner as any
<Text style={typography['headline-md'] as any}>
```

Si un estilo tipográfico no existe en el theme, **agregarlo al theme**, no inventarlo inline.

### 1.3 Inline styles sí, StyleSheet.create no

Usamos **inline styles** con los tokens del theme. No usar `StyleSheet.create` que
desconecta los estilos del sistema de diseño.

```tsx
// ✅ CORRECTO
<View style={{ flex: 1, backgroundColor: colors.surface, padding: spacing['container-padding'] }} />

// ❌ INCORRECTO
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAFF' } });
```

### 1.4 Componentes UI van en `src/components/`, no en screens

Si un elemento visual se repite en 2+ pantallas, es un componente:

```
src/components/
├── Button.tsx
├── Card.tsx
├── Badge.tsx
├── TextField.tsx
├── ProgressBar.tsx
├── StepItem.tsx
├── EmptyState.tsx
├── TimerWidget.tsx
├── GlassTabBar.tsx
├── LineChart.tsx
├── ConfettiOverlay.tsx
└── ProgressRing.tsx
```

---

## 1.5 Responsive scaling — tamaños que escalan con la pantalla

Usamos la utility `src/theme/responsive.ts` para elementos con tamaño absoluto
que deben adaptarse a distintos dispositivos.

### Import

```tsx
import { scale, moderateScale, useResponsive } from '../theme';
```

### Reglas

| ✅ Se escala | ❌ No se escala |
|---|---|
| Rings del timer, ilustraciones, checkmarks decorativos | `spacing.*` — el gap y padding del theme |
| Círculos decorativos de fondo | `typography.*` — las fuentes ya son proporcionales |
| Iconos grandes (40px+) en listas | Layout flex — `flex: 1`, `width: '100%'` |
| Imágenes e ilustraciones | Porcentajes y valores relativos |

**Regla de oro:** si es un valor absoluto que representa un elemento visual
(círculo, icono, ilustración), escalálo. Si es spacing, tipografía, o layout flex,
no lo escalés.

### Hook vs función directa

```tsx
// ✅ Para componentes que rotan o cambian de tamaño → hook
function TimerWidget() {
  const { scale: s, isSmall } = useResponsive();
  return <View style={{ width: s(256), height: s(256) }} />;
}

// ✅ Para valores estáticos (se calculan una vez) → función directa
const CHECK_SIZE = scale(120);
```

### Moderate scale

Para elementos donde el escalado completo se siente exagerado (border radius,
iconos chicos), usar `moderateScale`:

```tsx
<View style={{ borderRadius: moderateScale(12) }} />
```

---

## 2. Arquitectura y patrones

### 2.1 Las pantallas NO acceden a SQLite directamente

Toda comunicación con la base de datos pasa por un Service.

```tsx
// ✅ CORRECTO
const task = await TaskService.getById(id);

// ❌ INCORRECTO
const db = await getDb();
const task = await db.getFirstAsync('SELECT * FROM tasks WHERE id = ?', [id]);
```

### 2.2 Lógica de negocio va en Services, no en screens

Si una función tiene lógica que podría testearse sin UI, va en un Service o en una
función pura separada.

**Regla de oro:** si podés escribir un test unitario para esa función sin renderizar
React, no debería estar en una screen.

### 2.3 Funciones puras extraídas para lógica testeable

Cuando un Service mezcla queries SQL con lógica de decisión, extraer la lógica pura:

```ts
// src/services/stepLogic.ts — función pura, testeable sin DB
export function evaluateStepCompletion(
  remainingSteps: Step[],
  completedStepId: number,
): CompleteStepResult { ... }

// src/services/StepService.ts — adapter que llama a la DB
async complete(id: number): Promise<CompleteStepResult> {
  const db = await getDb();
  // ... queries SQL ...
  const result = evaluateStepCompletion(remaining, id);
  // ...
}
```

### 2.4 Navegación tipada, no `navigation: any`

```tsx
// ✅ CORRECTO
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'TaskDetail'>;
};

// ❌ INCORRECTO
type Props = { navigation: any; route: any };
```

### 2.5 TimerService va a refactorizarse a hook

El estado global mutable de `TimerService` es aceptable temporalmente en E1-E2,
pero no se agregue nueva funcionalidad que dependa de él sin refactorizar.

---

## 3. Datos y base de datos

### 3.1 Migraciones separadas del seed data

- `src/database/migrations.ts` — solo schema (CREATE TABLE, ALTER TABLE)
- `src/database/seed.ts` — datos de prueba, SOLO para desarrollo

El seed NUNCA debe borrar datos del usuario (`DELETE FROM ...`).
En producción el seed no se ejecuta.

### 3.2 Tipos compartidos en `src/types/index.ts`

Todas las interfaces que cruzan capas van en `src/types/`. Si un tipo es específico
de un componente, va en el mismo archivo del componente.

---

## 4. Calidad y tooling

### 4.1 ESLint + Prettier obligatorio antes de commit

```bash
npm run lint     # eslint src/
npm run format   # prettier --write src/
```

No se mergea código con warnings de ESLint.

### 4.2 Tests obligatorios para lógica nueva

- Lógica pura extraída de Services → test unitario con vitest
- Servicios nuevos → test de integración con SQLite in-memory
- No se requiere test para componentes UI (salvo que sean complejos)

Comando:
```bash
npm test         # vitest run
```

### 4.3 Convención de commits

```
feat:     nueva funcionalidad
fix:      corrección de bug
refactor: cambio que no agrega funcionalidad ni corrige bugs
test:     agregar o modificar tests
docs:     documentación
chore:    tooling, configuraciones, dependencias
style:    cambios de formato (espacios, commas, etc.)
```

---

## 5. Workflow en Git

### 5.1 Prohibido commitea directo a `main`

```
main        ← Solo recibe merges desde develop
develop     ← Base para feature branches
feature/*   ← Una rama por cambio
```

> **Protección activa:** desde el 13/08/2026 `main` y `develop` tienen branch
> protection en GitHub: PR obligatorio + 1 aprobación + linear history, sin
> force-push ni commits directos (incluye admins). Los status checks de CI se
> agregan como required al mergear la issue #90. Ver §7.10.

### 5.2 Ciclo de un cambio

1. `git checkout develop && git pull`
2. `git checkout -b feature/<nombre>`
3. Commits con formato convencional
4. `git push origin feature/<nombre>`
5. Crear PR a `develop`
6. Alguien más revisa la PR antes de mergear

### 5.3 Review de PR

El autor de la PR no se mergea su propio código. Mínimo 1 aprobación de otro
integrante antes de mergear.

### 5.4 Prohibido `git commit -a` y `git add` masivos

No usar `git commit -a`, `git add -A`, `git add .` ni wildcards que agreguen
archivos no relacionados al cambio. Cada archivo en el commit debe estar
directamente vinculado a lo que resuelve la issue.

```bash
# ❌ INCORRECTO
git add -A
git commit -m "feat: algo"
git add src/ && git commit -m "feat: algo"

# ✅ CORRECTO
git add src/screens/NuevaScreen.tsx src/components/NuevoComponente.tsx
git commit -m "feat: descripción del cambio"
```

---

## 6. Reglas para la IA

Cuando un agente de IA genere código para este proyecto:

1. **Siempre** leer `docs/CONVENCIONES.md` antes de escribir código
2. **Siempre** cargar el skill del Design System antes de tocar UI
3. **Siempre** leer `docs/Contexto.md` si es la primera vez en el proyecto
4. **Nunca** hardcodear colores, fuentes, o spacing
5. **Nunca** usar `as any` para tipografía — pedir que se arregle el tipo
6. **Siempre** tipar `navigation` y `route` props
7. **Nunca** llamar `getDb()` desde una pantalla
8. **Siempre** registrar los avances en la documentación (ver §7.9): contexto,
   log de decisiones y PRD cuando el cambio los toca

---

## 7. Flujo de resolución de issues

> Reglas para cerrar una issue de punta a punta: quién la toma, cómo se nombra
> la rama, qué se exige antes del PR, cómo se review y mergea, y cómo se integran
> las ramas. Aprobadas por el equipo (13/08/2026).

### 7.1 Ramas actuales

```
main        ← Entrega final. Solo recibe merges desde develop.
develop     ← Rama base para issues de frontend y backend.
feature/*   ← Una rama por cambio. Formato: feature/<tipo>/<numero>-<descripcion>
```

- Issue de **backend** → rama desde `develop` → PR a `develop`.
- Issue de **frontend** → rama desde `develop` → PR a `develop`.
- `main` nunca recibe commits directos.

> `main` y `develop` están protegidos en GitHub: PR obligatorio + 1 aprobación +
> linear history, sin force-push ni commits directos (ni admin).
>
> Nota: la rama `develop2` (backend E2) fue transitoria y quedó **eliminada** al
> unificarse a `develop` (PR #121, issue #120, 18/08/2026).

### 7.2 Cómo se toma una issue (pull rule)

- Cualquier integrante o agente puede tomar una issue **abierta** y **sin assignee**.
- Al tomarla, se **auto-asigna** (assignee en GitHub). No hace falta comentario.
- Labels: se usan las **correspondientes al tipo** (`bug`, `backend`, `frontend`,
  `auth`, `database`, `docs`, `chore`, `refactor`, `feature`, `epic`, `prd`,
  `testing`, `ci`). No se usa `ready-for-agent`.

### 7.3 Rama y punto de partida

Formato: `feature/<tipo>/<numero>-<descripcion>` desde la rama correcta.

```bash
# Backend y frontend (desde develop)
git checkout develop && git pull
git checkout -b fix/67-idempotencia-push

# Frontend (desde develop)
git checkout develop && git pull
git checkout -b feat/78-pantalla-x
```

> El número de issue va en la rama para mantener la trazabilidad con el PR.

### 7.4 Definición de "done" (antes de abrir el PR)

1. La rama toca **solo archivos relacionados a la issue**.
2. Commits con formato convencional (`feat:`, `fix:`, `docs:`, `refactor:`,
   `chore:`, `test:`).
3. `npm run lint` sin errores + `npm run format` aplicado.
4. Tests en verde (backend `npm test`, app `npm test`).
5. Sin scope creep: si durante el trabajo aparece un alcance nuevo (archivo,
   feature, cambio fuera de la issue), **se crea una issue específica primero**
   y se deja para otro PR.

### 7.5 Apertura del PR

1. Cumplir el template `.github/PULL_REQUEST_TEMPLATE.md` (Propósito, Issues
   relacionadas con `Closes #N`, Cambios, Prueba/Evidencia, Checklist pre-merge).
2. PR a la rama correcta (backend y frontend → `develop`).
3. Título con el número de issue: `fix: idempotencia real en push/migrate (#67)`.
4. Body del template completo, incluyendo la **evidencia real** (tests corridos,
   endpoints probados, capturas para UI).
5. El autor **no mergea su propio PR**.

### 7.6 Review y merge

1. Mínimo **1 aprobación de otro integrante**. Los comentarios de review señalan
   puntos que **bloquean** hasta resolverse y responderse.
2. Merge con **squash and merge** (la rama destino queda lineal).
3. La issue se cierra con `Closes #N` (automatizado por CI al mergear a
   `develop`).
4. La aprobación de 1 integrante la exige GitHub (branch protection), no solo la
   convención: sin la aprobación el merge queda bloqueado.
5. Los status checks de CI (lint/typecheck/test) se activan como required al
   mergear la issue #90. Hasta entonces no hay checks obligatorios.

### 7.7 Integración `develop2` → `develop` (completada)

- La integración de `develop2` a `develop` se realizó el **18/08/2026** vía
  **PR #121 (issue #120)**: squash como PR único, resolviendo los conflictos en
  la rama de integración (`feature/chore/integrar-develop2-120`).
- Después de la integración, `develop2` se **congeló y se eliminó**; las issues
  de backend nuevas van a `develop`.

### 7.8 Estados de una issue

1. **Abierta sin label** → recién creada o a la espera de ser pulida.
2. **Con labels** (`bug`, `backend`, etc.) → especificada y accionable.
3. **Con assignee** → en trabajo (pull rule).
4. **Cerrada** → al mergear el PR que la resuelve, o cerrada con motivo si no
   es accionable o se duplica (sin esperar a merge).

### 7.9 Registro de avances (documentación del proyecto)

Cada PR que se mergea a `develop` debe acompañarse del registro
del avance en la documentación del proyecto, para que los docs reflejen el
momento actual del repo:

- **`docs/Contexto.md`** — actualizar estado/código, checklist de E2 y
  decisiones nuevas, solo en los puntos que tocó el cambio. Si el cambio está en
  la app o el backend, marcar/desmarcar los ítems del checklist correspondiente.
- **`docs/Log Decisiones Tecnicas E2.md`** — si el cambio implica una decisión de
  diseño nueva (técnica, contrato, patrón), agregar una entrada nueva en formato
  ADR (DT-XX) al final y sumarla a la tabla de resumen.
- **`docs/Backend E2 PRD.md`** — si el backend cambió endpoints, schema o
  contratos, sincronizar la sección correspondiente (el PRD refleja lo
  implementado, no solo la intención).

Regla de oro: **los docs se actualizan DENTRO de la rama del PR** (son archivos
del cambio, no un post-proceso), o en un commit `docs:` inmediatamente después
del merge. Un PR que cambia el backend y no toca ni PRD ni contexto se rechaza.

### 7.10 Gestión del repo en GitHub (activada el 13/08/2026)

Herramientas de GitHub activadas y cómo afectan el flujo:

- **Branch protection** en `main` y `develop`: PR obligatorio + 1 aprobación +
  linear history; force-push y commits directos bloqueados (incluye admins).
  Los status checks del CI se agregan como required al mergear la issue #90.
- **Dependabot** (`.github/dependabot.yml`): PRs semanales de updates de `npm` y
  `github-actions`. Escanea la default branch (`main`); con el backend ya en
  `develop` (PR #121), sus dependencias quedan cubiertas al mergear a `main`.
- **Seguridad**: vulnerability alerts, Dependabot security updates, secret
  scanning y push protection activos. Push protection bloquea el push si se
  intenta commitear un secret.
- **Issue forms**: `.github/ISSUE_TEMPLATE/` (`bug_report.yml` +
  `feature_request.yml`) reemplazan el single-file. Al crear una issue se elige
  el tipo de plantilla.
- **Milestones**: `Entrega 1` (cerrada), `Entrega 2` (18/08), `Entrega 3`. Cada
  issue se asigna al milestone de su entrega.
- **Releases**: al cerrar una entrega se publica un release desde el tag (ej.
  `entrega-1`) con notas. La convención sigue siendo: merge a `main` + tag.

Rollback (volver al estado anterior si algo se rompe):

```bash
gh api -X DELETE repos/YahirAedo/stepup/branches/{main,develop}/protection
gh api -X DELETE repos/YahirAedo/stepup/vulnerability-alerts
gh api -X DELETE repos/YahirAedo/stepup/automated-security-fixes
gh api -X DELETE repos/YahirAedo/stepup/milestones/{1,2,3}
gh release delete entrega-1
# revertir los archivos del repo (dependabot.yml, ISSUE_TEMPLATE/, SECURITY.md, .gitattributes):
git revert d2c8138
```

---

## Checklist pre-merge

Antes de mergear cualquier PR a `develop`, verificar:

- [ ] No hay colores hardcodeados (usa `grep -r 'backgroundColor: "#\|color: "#' src/screens/`)
- [ ] No hay `as any` en tipografía (usa `grep -r 'as any' src/`)
- [ ] `navigation` y `route` están tipados, no `any`
- [ ] No hay `getDb()` importado en screens
- [ ] Pasa `npm run lint` sin errores
- [ ] Los commits siguen el formato convencional
