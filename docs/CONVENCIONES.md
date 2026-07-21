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
3. **Siempre** leer `docs/Contexto cambiable.md` si es la primera vez en el proyecto
4. **Nunca** hardcodear colores, fuentes, o spacing
5. **Nunca** usar `as any` para tipografía — pedir que se arregle el tipo
6. **Siempre** tipar `navigation` y `route` props
7. **Nunca** llamar `getDb()` desde una pantalla

---

## Checklist pre-merge

Antes de mergear cualquier PR a `develop`, verificar:

- [ ] No hay colores hardcodeados (usa `grep -r 'backgroundColor: "#\|color: "#' src/screens/`)
- [ ] No hay `as any` en tipografía (usa `grep -r 'as any' src/`)
- [ ] `navigation` y `route` están tipados, no `any`
- [ ] No hay `getDb()` importado en screens
- [ ] Pasa `npm run lint` sin errores
- [ ] Los commits siguen el formato convencional
