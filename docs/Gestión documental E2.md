**StepUp**

*Documento de Gestión Documental — Entrega 2*

Iteración 2 | Julio – Agosto 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Agosto 2026*

# 1. Introducción

## 1.1 Propósito

Este documento describe dónde vive cada artefacto del proyecto StepUp (repositorio, Drive, sistema de diseño), las convenciones de versionado y cómo se distribuyen los documentos de la Entrega 2.

# 2. Repositorios y Plataformas

| Plataforma | Uso | Ubicación |
| --- | --- | --- |
| GitHub | Código, issues, PRs, CI, releases | https://github.com/YahirAedo/stepup |
| Google Drive | Documentación, capturas, feedback, manuales | Carpeta del proyecto (7 carpetas) |
| Railway | Backend de producción | stepup-backend-api-production.up.railway.app |
| Sistema de diseño | Prototipos HTML y tokens Zenith Vitality | `stitch_stepup_design_system/` en el repo |

# 3. Estructura de Google Drive

La carpeta compartida del proyecto tiene 7 carpetas:

| Carpeta | Contenido |
| --- | --- |
| **Ambiente de pruebas** | Credenciales de prueba, datos de seed, pasos para reproducir la demo |
| **Arquitectura** | Documento de Arquitectura E2, diagramas, decisiones técnicas |
| **Desarrollo** | README, decisiones técnicas, guías de setup, PRDs |
| **Feedback de usuarios** | Minutas con el docente, comentarios de pruebas |
| **Manual de usuario** | Manual E2 (evolutivo) y capturas de pantalla |
| **Requerimientos** | Documento de Requerimientos E2 y anexos |
| **Testing** | Casos de prueba, resultados y bug list de E2 |

# 4. Mapa de Documentos E2

| Documento | Archivo (repo) | Carpeta Drive |
| --- | --- | --- |
| Requerimientos E2 | `docs/Requerimientos E2.md` | Requerimientos |
| Arquitectura E2 | `docs/Arquitectura E2.md` | Arquitectura |
| Log de Decisiones Técnicas E2 | `docs/Log Decisiones Tecnicas E2.md` | Desarrollo |
| Testing E2 | `docs/Testing E2.md` | Testing |
| Repositorio y Desarrollo E2 | `docs/Repositorio y Desarrollo E2.md` | Desarrollo |
| Manual de Usuario E2 | `docs/Manual de usuario E2.md` | Manual de usuario |
| Minutas y Feedback E2 | `docs/Minutas y Feedback E2.md` | Feedback de usuarios |
| Gestión Documental E2 | `docs/Gestión documental E2.md` | Gestion |
| Backend E2 PRD | `docs/Backend E2 PRD.md` | Desarrollo |
| Checklists B1/B2 | `docs/B1 - Railway deploy checklist.md`, `docs/B2 - Auth flow checklist.md` | Testing |
| Inception Deck | `docs/` (E1) | Gestion |

Todos los entregables de la entrega se exportan además a **.docx** para subir a Drive.

# 5. Convenciones de Versionado

- Nomenclatura de archivos en Drive: `NN_Nombre_vX.Y.docx` (ej: `02_Arquitectura_E2_v1.1.docx`).
- Al actualizar, se **incrementa la versión**; no se sobreescribe la anterior.
- En el repo, cada documento lleva su versión en el pie y una **nota de versión** en el header cuando cambia (ej: Arquitectura E2 v1.0 → v1.1).
- Las decisiones de arquitectura se versionan aparte en el Log de Decisiones (DT-XX) y se referencian desde los documentos.

# 6. Flujo de Publicación de un Documento

1. Redactar/actualizar el `.md` en `docs/`
2. Commit en rama `feature/*` desde `develop` → PR → revisión → merge
3. Exportar a `.docx` con la misma versión
4. Subir a la carpeta correspondiente del Drive

# 7. Checklist de la Entrega 2

| # | Artefacto | Estado |
| --- | --- | --- |
| 1 | Requerimientos E2 (.md + .docx) | ✅ v1.1 |
| 2 | Arquitectura E2 (.md + .docx) | ✅ v1.1 |
| 3 | Log Decisiones Técnicas E2 (.md + .docx) | ✅ v1.2 |
| 4 | Testing E2 (.md + .docx) | ✅ v1.1 |
| 5 | Repositorio y Desarrollo E2 (.md + .docx) | ✅ v1.0 |
| 6 | Manual de Usuario E2 (.md + .docx) | ✅ v1.0 |
| 7 | Minutas y Feedback E2 (.md + .docx) | ✅ v1.0 |
| 8 | Gestión Documental E2 (.md + .docx) | ✅ v1.0 |
| 9 | Presentación E2 (PPTX) | En elaboración |
| 10 | Capturas reales de la app | En elaboración |

*StepUp — Gestión Documental E2 — Versión 1.0 — Agosto 2026*