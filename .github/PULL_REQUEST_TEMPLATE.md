<!-- ⚠️ Borrá esta sección antes de crear el PR.
     Título sugerido: feat(scope): verbo en presente, primera persona, ≤ 72 chars
     Ej: feat(navigation): agrega GlassTabBar base -->

## Propósito

<!-- Qué resuelve este cambio y por qué. Una frase que se entienda sin mirar el código. -->

## Issues relacionadas

<!-- OBLIGATORIO si resuelve una issue. Usá la keyword para que CI cierre la issue
     automáticamente al mergear a develop:
     Closes #N  |  Fixes #N  |  Resolves #N -->

- Fixes #0

## Cambios incluidos

- [ ] Listar los cambios principales (1 línea c/u)

## Prueba / Evidencia

<!-- Qué verificaste. Para UI: capturas, video o Expo. Para backend: endpoints probados. -->

- [ ] Tests unitarios/integración (`npm test`)
- [ ] Verificado en dispositivo/emulador

## Checklist pre-merge (CONVENCIONES.md)

- [ ] Sin colores hardcodeados (tokens del theme) ni `as any` en tipografía
- [ ] `navigation`/`route` tipados, no `any`
- [ ] Sin `getDb()` en screens (lógica en Services)
- [ ] `npm run lint` sin errores y `npm run format` aplicado
- [ ] Commits con formato convencional y solo archivos del cambio (prohibido `git add -A`)
- [ ] Revisado por un integrante (nadie mergea su propio PR)

## Nota para el reviewer

<!-- Contexto útil: decisiones, tradeoffs, puntos a mirar. -->