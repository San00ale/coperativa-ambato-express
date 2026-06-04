# Gestión de Configuración

## Propósito y Alcance

Este documento define el proceso de gestión de configuración del software. Su alcance incluye el control de versiones de todos los componentes del sistema (código fuente, documentación, scripts, configuraciones), la gestión de solicitudes de cambio y la definición de la política de lanzamiento. Se aplica a todo el equipo de desarrollo y durante todo el ciclo de vida del proyecto.

## Objetivos

- Determinar la versión actual de cada componente del software en todo momento.
- Establecer el proceso formal para gestionar solicitudes de cambio, incluyendo evaluación, aprobación, implementación y verificación.
- Definir la política de versionado y lanzamiento (ej: SemVer).
- Asegurar la trazabilidad entre requisitos, cambios y versiones.
- Proveer mecanismos de auditoría para verificar la integridad de la configuración.

## Roles y Responsabilidades

| Rol | Responsabilidades |
|-----|-------------------|
| Gestor de configuración | Lidera la planificación, control, auditoría y aprobación de cambios en los elementos de configuración. Define el plan de gestión. |
| Coordinador de configuración | Asegura que todos los elementos estén registrados en el repositorio. Verifica consistencia, reporta irregularidades y mantiene la línea base. |
| Responsable de elementos de configuración | Verifica que los cambios en sus componentes sigan el proceso definido. Trabaja para corregir discrepancias. Aprueba cambios en sus áreas. |

## Herramientas

- **Control de versiones:** Git + GitHub (repositorio central).
- **Gestión de cambios:** Issues y Projects de GitHub.
- **Construcción y despliegue:** GitHub Actions (para generación automática de documentación).
- **Documentación:** Markdown + MkDocs (generador de sitio estático).

## Política de Versionado

Se usará Versionado Semántico (SemVer) con formato `vMAYOR.MENOR.PARCHE`.

- **MAYOR:** cambios incompatibles con versiones anteriores.
- **MENOR:** funcionalidad nueva compatible hacia atrás.
- **PARCHE:** correcciones de errores compatibles.

Cada release se etiquetará en GitHub con el tag correspondiente.

## Proceso de Gestión de Cambios

1. **Solicitud:** Se abre un Issue en GitHub describiendo el cambio, justificación e impacto estimado.
2. **Evaluación:** El Gestor de configuración y el Coordinador analizan viabilidad, riesgo y prioridad.
3. **Aprobación/Rechazo:** Se etiqueta el Issue como aprobado o rechazado y se notifica al solicitante.
4. **Implementación:** El responsable del elemento crea una rama (branch) desde la última línea base, desarrolla el cambio y abre un Pull Request.
5. **Verificación:** Se ejecutan pruebas automatizadas y revisión por pares.
6. **Cierre y actualización de línea base:** Se fusiona el PR, se cierra el Issue y se actualiza la documentación de configuración.

## Elementos de Configuración

Todos los siguientes elementos están bajo control de versiones y se registran en el repositorio:

- Código fuente (`.py`, `.js`, `.java`, etc.)
- Scripts de base de datos
- Documentación del proyecto (este documento, manuales, guías)
- Archivos de configuración (`config.yml`, `.env`, etc.)
- Pruebas automatizadas
- Workflows de GitHub Actions (`.github/workflows/*.yml`)

## Auditorías

Cada dos semanas se realizará una auditoría de configuración que verificará:

- Que todos los elementos de configuración estén versionados.
- Que no haya cambios sin Issue asociado.
- Que las versiones de los releases coincidan con los tags.

El reporte de auditoría se guardará en la carpeta `docs/audits/`.

## Reportes

Se generarán los siguientes reportes:

- **Reporte de línea base:** lista de versiones actuales de cada elemento.
- **Reporte de cambios pendientes:** Issues abiertos y su estado.
- **Reporte de auditoría:** resultados de la última auditoría.

Todos los reportes se publican automáticamente en la página de documentación.