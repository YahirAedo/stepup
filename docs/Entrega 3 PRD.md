# PRD — Entrega 3: Sugerencia de pasos con IA + Dashboard de consistencia

*Versión 1.0 — Agosto 2026*

## Problem Statement

Cuando un usuario crea una tarea grande, la fricción más grande está en *dividirla*: el cerebro entra en evitación (*task paralysis*) y la tarea queda sin pasos o con pasos genéricos. Hoy la app resuelve la división después de crear la tarea y a mano, paso por paso. El usuario necesita que el momento de la división sea guiado y rápido.

## Solution

La app incorpora IA (Google Gemini API, tier gratis) en dos capacidades complementarias: **asistente de descripción** (ayuda a estructurar el contexto de la tarea) y **sugeridor de pasos** (propone una secuencia de pasos accionables de 5-25 min, alineados al método Pomodoro). La IA propone, el usuario decide: el resultado es un borrador editable que se confirma para crear la tarea y sus pasos juntos. Además, la app gana un dashboard de consistencia con rachas que refuerza el hábito diario.

## User Stories

1. Como usuario, quiero escribir una descripción de mi tarea para darle contexto a la sugerencia de pasos, para que la IA entienda qué quiero lograr.
2. Como usuario, quiero que el campo de descripción sea opcional, para poder crear una tarea rápido sin tener que completarlo.
3. Como usuario, quiero un botón "Ayudame a describir" que me muestre una estructura/plantilla contextual, para escribir mejores descripciones sin inventar el formato.
4. Como usuario, quiero que la IA sugiera pasos accionables que empiecen con verbo concreto, para saber exactamente qué hacer.
5. Como usuario, quiero que los pasos sugeridos duren entre 5 y 25 minutos, para poder hacer cada uno en una sesión de foco Pomodoro.
6. Como usuario, quiero que la cantidad de pasos sugeridos se adapte al tamaño de la tarea (entre 3 y 8), para que ni sobre ni falte detalle.
7. Como usuario, quiero que los pasos sugeridos cubran el contexto que escribí (no genéricos), para que la secuencia tenga sentido para mi tarea.
8. Como usuario, quiero que los pasos sugeridos tengan una duración estimada, para saber cuánto me va a llevar la tarea.
9. Como usuario, quiero editar, borrar y agregar pasos del borrador antes de confirmar, para quedarme con la secuencia que me sirve.
10. Como usuario, quiero un botón "Otra propuesta" que re-genere la secuencia completa, para cuando la sugerencia no me convence.
11. Como usuario, quiero que el borrador se descarte si salgo sin confirmar, para no guardar cosas a medio hacer.
12. Como usuario, quiero que al confirmar se cree la tarea y sus pasos juntos, para no hacer dos trámites.
13. Como usuario, quiero poder generar pasos con IA desde el detalle de una tarea existente, para aprovechar la IA con tareas viejas que tienen descripción guardada.
14. Como usuario, quiero que si estoy offline el botón de IA no aparezca y la creación manual funcione igual que siempre, para que la IA nunca me bloquee.
15. Como usuario, quiero ver en un dashboard mi racha de días consecutivos con al menos un paso completado, para mantener el hábito.
16. Como usuario, quiero que un día sin actividad no me rompa la racha (1 día de gracia fijo por racha), para que un día malo no me desmotive.
17. Como usuario, quiero ver la tendencia de pasos completados por semana, para entender si avanzo constante o en ráfagas.

## Implementation Decisions

- **Proveedor de IA:** Google Gemini API (AI Studio), modelo `gemini-2.5-flash`, tier gratis permanente. Sin SDK: fetch directo al REST endpoint con `responseMimeType: application/json` para salida estructurada.
- **La key de Gemini vive SOLO en el backend** (variable de entorno en Railway), nunca en el bundle de la app. La app llama a un endpoint propio.
- **Backend nuevo:** ruta autenticada `POST /api/ai/suggest-steps` (+ acción para el asistente de descripción). `AIService` valida input con zod, llama a Gemini con prompt fijo y backoff en 429/5xx, y devuelve pasos sanitizados (`name` + `duration_min`).
- **Prompt engineering:** prompt fijo que codifica las reglas del dominio (verbo concreto, 5-25 min, 3-8 pasos según tamaño, derivar del contexto, orden lógico). Mejora continua de calidad queda como trabajo posterior (issue de seguimiento).
- **Frontend nuevo:** `AIService` que consume el endpoint; el borrador vive en estado temporal de pantalla (no se persiste hasta confirmar).
- **Modelo de datos:** se agrega columna `description` a `tasks` (SQLite local + PostgreSQL remoto + contrato de sync). La descripción es opcional y editable.
- **Flujo de creación:** TaskForm gana campo descripción → "✨ Sugerir pasos con IA" → borrador editable → confirmar → tarea + pasos juntos. Si offline, el botón no aparece y el flujo manual queda intacto.
- **Flujo en detalle:** TaskDetail gana botón "Generar pasos con IA" usando la descripción guardada.
- **Asistente de descripción:** guía de estructura contextual (no texto automático), misma infraestructura de IA.
- **Dashboard de consistencia:** función pura de racha (1 día de gracia fijo, no acumulable, cuenta desde hoy) + gráfico de tendencia semanal reutilizando `LineChart`.

## Testing Decisions

- **Seam 1 (backend):** `POST /api/ai/suggest-steps` testeado con supertest mockeando el cliente HTTP de Gemini (input válido → pasos; input inválido → 400; Gemini caído → 502 con mensaje claro; 429 → retry). Prior art: `backend/src/tests/*.test.ts`.
- **Seam 2 (racha):** función pura `calculateStreak` testeada con vitest (racha activa, rota, día de gracia usado/no usado, sin datos). Prior art: `src/services/stepLogic.ts` + `*.test.ts`.
- **AIService frontend:** tests de integración mockeando `apiFetch`. El resto de UI (borrador, edición) no requiere test por convención.

## Out of Scope

- Refino conversacional de la sugerencia (Opción B) — descartado a favor de re-generar.
- Notificaciones push (FCM).
- Slices 8/10/11 de polish (animaciones, XP, sync conflict review).
- Animaciones de recompensa/descanso post-Pomodoro.
- Motor de timer con fases trabajo/descanso (el Pomodoro solo define el rango de duración).
- IA on-device.

## Further Notes

- **Deuda de E2 priorizada (no eliminada):** Alta → #122 (borde día UTC, alimenta las rachas) y #123 (IDOR seguridad). Media → #124. Baja → #126. #125 (docs PRD) se cierra sin hacer — el PRD se actualiza en E3 de todos modos.
- **Dashboard:** solo consistencia (rachas + tendencia), no volumen.
- **Gemini free tier:** ~10 RPM / 250K TPM / ~250-1500 RPD según modelo; Google entrena con los prompts (aceptable para el proyecto académico; no mandar datos sensibles).
- La división del trabajo se desglosa en issues por slice en GitHub (milestone Entrega 3).

*StepUp — PRD Entrega 3 — Versión 1.0 — Agosto 2026*