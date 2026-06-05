# Gestión de Configuración - Cooperativa Ambato Express

## Propósito y Alcance

Este documento define el proceso de gestión de configuración del software para el proyecto **Cooperativa Ambato Express**, alineado con las mejores prácticas de **ITIL (Information Technology Infrastructure Library)**. Su alcance incluye el control de versiones de todos los componentes del sistema (código fuente, documentación, scripts, configuraciones), la gestión de solicitudes de cambio y la definición de la política de lanzamiento. Se aplica a todo el equipo de desarrollo durante todo el ciclo de vida del proyecto.

## Objetivos (ITIL - SACM)

- Determinar la versión actual de cada componente del software en todo momento (CMDB).
- Establecer el proceso formal para gestionar solicitudes de cambio (ITIL - Gestión de Cambios).
- Definir la política de versionado y lanzamiento (ITIL - Gestión de Versiones).
- Asegurar la trazabilidad entre requisitos, cambios y versiones (ITIL - Gestión de Activos).
- Proveer mecanismos de auditoría para verificar la integridad de la configuración (ITIL - Auditoría de Configuración).
- Mantener una base de datos de gestión de configuración (CMDB) actualizada.

## Equipo de Desarrollo y Módulos

| Miembro | Rol en Equipo | Módulo Responsable | Responsabilidades Específicas |
|---------|---------------|-------------------|------------------------------|
| **Santiago Gamboa** | Líder del Equipo | Backend, Login, Register | Gestión de configuración, creación de Issues, revisión y aprobación de PRs, arquitectura backend |
| **Martin Palacios** | Desarrollador | Oficinista | Módulo de oficinista, revisión ocasional de PRs, soporte en gestión de cambios |
| **Sheyla Pacha** | Desarrolladora | Admin | Módulo de administración, gestión de usuarios y configuraciones del sistema |
| **Jonathan Gamboa** | Desarrollador | Chofer | Módulo de chofer, escaneo QR, gestión de rutas asignadas |
| **David Perez** | Desarrollador | Cliente | Módulo de cliente, compra de boletos, selección de asientos |

## Roles y Responsabilidades (ITIL - SACM)

### Gestor de Configuración (Configuration Manager)
**Asignado a:** Santiago Gamboa (Líder del Equipo)

**Responsabilidades:**
- Lidera la planificación, identificación, control, seguimiento y auditoría de todos los elementos de configuración.
- Desarrolla y mantiene el plan de gestión de configuración.
- Promueve el uso efectivo de la base de datos de configuración (CMDB).
- Monitorea y reporta cambios no autorizados sobre elementos de configuración.
- Asegura la consistencia e integridad de los datos de configuración.
- Lidera actividades de evaluación del proceso y aprueba cambios estructurales.
- Crea Issues en GitHub para asignar tareas a los miembros del equipo.
- Realiza revisión y aprobación de Pull Requests (PRs) de los compañeros.

### Coordinador de Configuración (Configuration Coordinator)
**Asignado a:** Martin Palacios (apoyo ocasional)

**Responsabilidades:**
- Asegura que todos los elementos de configuración estén registrados adecuadamente.
- Verifica consistencia e integridad de datos y estructura del sistema.
- Reporta discrepancias o no conformidades al Gestor de Configuración.
- Participa en la mejora continua del proceso de gestión de configuración.
- Apoya en revisión y aprobación de PRs cuando el líder no está disponible.

### Responsable de Elementos de Configuración (Configuration Item Owner)
**Asignado a:** Cada desarrollador según su módulo

**Responsabilidades:**
- Asegura que los elementos de configuración de su módulo estén registrados con estado y datos apropiados.
- Verifica que los cambios en sus componentes sigan el proceso definido.
- Asegura la idoneidad e integridad de los elementos de su responsabilidad.
- Trabaja con el Gestor de Configuración para identificar causas de discrepancias.
- Implementa cambios aprobados en su módulo específico.

### Gestor de Cambios (Change Manager)
**Asignado a:** Santiago Gamboa (Líder del Equipo)

**Responsabilidades:**
- Evalúa el impacto y riesgo de los cambios propuestos.
- Asegura que los responsables actualicen los históricos de configuración.
- Aprueba o rechaza solicitudes de cambio (SCR).
- Coordina la implementación de cambios aprobados.

## Herramientas

- **Control de versiones:** Git + GitHub (repositorio central)
- **Gestión de cambios:** Issues y Projects de GitHub (ITIL - Change Management)
- **Construcción y despliegue:** GitHub Actions (CI/CD)
- **Documentación:** Markdown + MkDocs (generador de sitio estático)
- **Base de datos de configuración (CMDB):** GitHub Issues etiquetados + documentación del proyecto
- **Reportes de usuarios:** Formulario en `/reportar.html` que genera Issues automáticamente en GitHub

## Política de Versionado (ITIL - Release Management)

Se usará Versionado Semántico (SemVer) con formato `vMAYOR.MENOR.PARCHE`.

- **MAYOR:** cambios incompatibles con versiones anteriores (cambios arquitectónicos mayores)
- **MENOR:** funcionalidad nueva compatible hacia atrás (nuevas características)
- **PARCHE:** correcciones de errores compatibles (bug fixes)

Cada release se etiquetará en GitHub con el tag correspondiente.

## Estrategia de Ramas (Git Flow)

### Ramas Principales
- **master:** Versiones estables del producto, listas para producción
- **develop:** Código de la próxima versión, versiones inestables en desarrollo

### Ramas de Soporte
- **feature/nombre:** Nuevas características (ej: `feature/seleccion-multiple-asientos`)
- **release/vX.Y.X:** Preparación para release, testing final
- **hotfix/vX.Y.Z:** Correcciones urgentes en producción
- **cleanup/nombre:** Limpieza de código y documentación
- **optimization/nombre:** Optimización sin impacto funcional

### Flujo de Trabajo
1. Las ramas **feature** se originan desde **develop** y se fusionan de vuelta a **develop**
2. Las ramas **release** se originan desde **develop** y se fusionan a **master** y **develop**
3. Las ramas **hotfix** se originan desde **master** y se fusionan a **master** y **develop**
4. El líder del equipo (Santiago) crea los Issues y asigna a los desarrolladores
5. Los desarrolladores crean ramas feature desde develop y abren PRs
6. Santiago (y ocasionalmente Martin) revisan y aprueban los PRs
7. Solo se fusionan PRs que pasen pruebas y revisión de código

## Proceso de Gestión de Cambios (ITIL - Change Management)

### 1. Solicitud de Cambio (SCR)
- El líder del equipo (Santiago) crea un Issue en GitHub describiendo el cambio
- El Issue incluye: descripción, justificación, impacto estimado, prioridad y módulo afectado
- Los usuarios también pueden reportar bugs/sugerencias mediante `/reportar.html`
- Los reportes de usuarios se convierten automáticamente en Issues en GitHub

### 2. Evaluación de Impacto
- El Gestor de Cambios (Santiago) analiza viabilidad, riesgo y prioridad
- Se evalúa el impacto en otros módulos y dependencias
- Se determina si el cambio requiere coordinación entre múltiples desarrolladores

### 3. Aprobación/Rechazo
- El Gestor de Cambios aprueba o rechaza la solicitud
- Se etiqueta el Issue como `aprobado` o `rechazado`
- Se notifica al responsable del módulo

### 4. Implementación
- El responsable crea una rama feature desde develop
- Desarrolla el cambio siguiendo los estándares del proyecto
- Abre un Pull Request con descripción detallada del cambio
- El PR debe pasar pruebas automatizadas (lint, build, tests)

### 5. Revisión y Verificación
- Santiago (y ocasionalmente Martin) revisan el código del PR
- Se ejecutan pruebas manuales si es necesario
- Se verifica que el cambio no afecte otros módulos

### 6. Fusión y Actualización de Línea Base
- Se fusiona el PR a develop
- Se cierra el Issue asociado
- Se actualiza la documentación de configuración si es necesario
- Se genera un nuevo tag si es un release

## Elementos de Configuración (CMDB)

### Por Módulo

**Backend (Santiago Gamboa):**
- API endpoints (`src/app/api/`)
- Autenticación (`src/lib/auth.ts`)
- Base de datos (`prisma/schema.prisma`)
- Lógica de negocio compartida

**Login/Register (Santiago Gamboa):**
- Páginas de autenticación (`src/app/login/`, `src/app/registro/`)
- Validaciones (`src/lib/validations.ts`)
- NextAuth configuration

**Oficinista (Martin Palacios):**
- Dashboard de oficinista (`src/app/oficinista/`)
- Gestión de pagos pendientes
- Venta de boletos

**Admin (Sheyla Pacha):**
- Panel de administración (`src/app/admin/`)
- Gestión de usuarios, buses, rutas, frecuencias
- Configuración del sistema

**Chofer (Jonathan Gamboa):**
- App de chofer (`src/app/chofer/`)
- Escaneo QR (`src/app/chofer/escanear/`)
- Validación de pasajeros
- Venta en ruta

**Cliente (David Perez):**
- App de cliente (`src/app/cliente/`)
- Búsqueda de rutas
- Selección de asientos
- Pago y compras

### Elementos Generales
- Código fuente (`.ts`, `.tsx`, `.js`)
- Scripts de base de datos (`prisma/`)
- Documentación del proyecto (`docs/`)
- Archivos de configuración (`.env`, `next.config.ts`, etc.)
- Pruebas y validaciones
- Workflows de GitHub Actions (`.github/workflows/`)
- Formulario de reportes (`public/reportar.html`)

## Auditorías (ITIL - Configuration Audit)

### Frecuencia
- Auditorías semanales de configuración
- Auditorías antes de cada release mayor
- Auditorías ad-hoc cuando se detectan problemas

### Verificaciones
- Que todos los elementos de configuración estén versionados
- Que no haya cambios sin Issue asociado
- Que las versiones de los releases coincidan con los tags
- Que los módulos de cada desarrollador estén actualizados
- Que la documentación refleje el estado actual del sistema

### Reporte
El reporte de auditoría se genera automáticamente y se publica en la página de documentación.

## Reportes (ITIL - Reporting)

Se generarán los siguientes reportes automáticamente:

- **Reporte de línea base:** Lista de versiones actuales de cada elemento por módulo
- **Reporte de cambios pendientes:** Issues abiertos por módulo y su estado
- **Reporte de auditoría:** Resultados de la última auditoría
- **Reporte de actividad del equipo:** Commits, PRs y Issues por desarrollador
- **Reporte de incidencias:** Issues generados desde `/reportar.html`

Todos los reportes se publican automáticamente en la página de documentación del proyecto.

## Cumplimiento ITIL

Este proceso de gestión de configuración cumple con las siguientes prácticas de ITIL:

- **SACM (Service Asset and Configuration Management):** Gestión completa de activos y configuración
- **Change Management:** Proceso formal para gestión de cambios
- **Release Management:** Política de versionado y liberación controlada
- **Configuration Audit:** Verificación regular de la configuración
- **CMDB:** Base de datos de configuración mantenida y actualizada