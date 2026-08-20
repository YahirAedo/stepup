# Security Policy

## Supported Versions

| Version | Support |
|---------|---------|
| `main` (entrega en curso) | Activa |
| `entrega-1` (tag E1) | Histórica (bugs críticos) |

## Reporting a Vulnerability

El repo es público pero el proyecto es de carácter académico. Para reportar
una vulnerabilidad:

1. **No** abras una issue pública con detalles de explotación.
2. Escribí por privado a los mantenedores del proyecto (ver colaboradores del
   repo) con: descripción del problema, pasos para reproducir, impacto y fix
   sugerido.
3. Evaluamos el reporte, priorizamos y coordinamos el fix antes de exponer el
   detalle públicamente.

## Notas de seguridad del stack

- **Backend (E2):** contraseñas con hash, JWT con secret obligatorio en prod
  (fail-closed). Ver issues del epic #64.
- **App (Expo SDK 54):** dependencias auditadas con `npm audit`; Dependabot
  abre PRs de actualización semanales.