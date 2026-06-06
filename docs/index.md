# Bienvenido al Sistema de Gestión de Proyectos

## Cooperativa Ambato Express

Este sitio contiene la documentación oficial del proyecto **Cooperativa Ambato Express**, un sistema de gestión de transporte cooperativo que permite la venta de boletos, asignación de rutas, gestión de pasajeros y administración eficiente del servicio de transporte.

La documentación está alineada con las mejores prácticas de **ITIL (Information Technology Infrastructure Library)** para garantizar una gestión profesional de configuración, cambios y calidad del software.

---

## 📋 Índice de Contenidos

### 🚀 Documentación Principal
- [Gestión de Configuración](configuracion.md) - Plan de gestión de configuración ITIL
- [Reportes Automáticos](reportes.md) - Métricas y estadísticas del proyecto

### 👥 Equipo de Desarrollo

| Miembro | Rol | Módulo Responsable |
|---------|-----|-------------------|
| **Santiago Gamboa** | Líder del Equipo | Backend, Login, Register |
| **Martin Palacios** | Desarrollador | Oficinista |
| **Sheyla Pacha** | Desarrolladora | Admin |
| **Jonathan Gamboa** | Desarrollador | Chofer |
| **David Perez** | Desarrollador | Cliente |

### 📦 Módulos del Sistema

#### Backend (Santiago Gamboa)
- API RESTful endpoints
- Autenticación y autorización
- Gestión de base de datos
- Lógica de negocio compartida

#### Login/Register (Santiago Gamboa)
- Páginas de autenticación
- Registro de usuarios
- Validaciones de cédula ecuatoriana
- Recuperación de contraseña

#### Oficinista (Martin Palacios)
- Dashboard de oficinista
- Gestión de pagos pendientes
- Venta de boletos
- Aprobación de transferencias

#### Admin (Sheyla Pacha)
- Panel de administración
- Gestión de usuarios
- Gestión de buses
- Gestión de rutas y frecuencias
- Configuración del sistema

#### Chofer (Jonathan Gamboa)
- Aplicación móvil para choferes
- Escaneo de códigos QR
- Validación de pasajeros
- Venta de boletos en ruta
- Gestión de rutas asignadas

#### Cliente (David Perez)
- Aplicación web para clientes
- Búsqueda de rutas
- Selección múltiple de asientos
- Pago en línea
- Historial de compras

---

## 🔧 Herramientas y Tecnologías

### Stack Tecnológico
- **Frontend:** Next.js 16.2.4, React, TypeScript
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** SQLite (desarrollo), PostgreSQL (producción)
- **Autenticación:** NextAuth.js
- **Control de Versiones:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Documentación:** Markdown + MkDocs

### Herramientas de Gestión
- **Gestión de Configuración:** Git Flow, GitHub Issues
- **Gestión de Cambios:** GitHub Issues + Pull Requests
- **Reportes de Usuarios:** Formulario `/reportar.html` → GitHub Issues
- **Auditorías:** Verificaciones semanales de configuración

---

## 📊 Flujo de Trabajo (Git Flow)

### Ramas Principales
- **master:** Versiones estables de producción
- **develop:** Código de la próxima versión

### Ramas de Soporte
- **feature/nombre:** Nuevas características
- **release/vX.Y.X:** Preparación para release
- **hotfix/vX.Y.Z:** Correcciones urgentes
- **cleanup/nombre:** Limpieza de código
- **optimization/nombre:** Optimización sin impacto funcional

### Proceso de Desarrollo
1. El líder (Santiago) crea Issues en GitHub
2. Los desarrolladores crean ramas feature desde develop
3. Desarrollan la funcionalidad asignada
4. Abren Pull Requests hacia develop
5. Santiago (y ocasionalmente Martin) revisan y aprueban los PRs
6. Se fusionan a develop tras pasar pruebas
7. Para releases, se crea rama release desde develop
8. Se fusiona a master y develop para producción

---

## 🎯 Cumplimiento ITIL

Este proyecto sigue las siguientes prácticas de ITIL:

### SACM (Service Asset and Configuration Management)
- Gestión completa de activos y configuración
- Base de datos de configuración (CMDB) mantenida
- Identificación y control de elementos de configuración

### Change Management
- Proceso formal de solicitudes de cambio (SCR)
- Evaluación de impacto y riesgo
- Aprobación y seguimiento de cambios

### Release Management
- Política de versionado SemVer (vMAYOR.MENOR.PARCHE)
- Control de liberaciones
- Gestión de versiones y tags

### Configuration Audit
- Auditorías semanales de configuración
- Verificación de integridad y consistencia
- Reportes de no conformidades

---

## 📝 Reportes y Métricas

El sistema genera automáticamente los siguientes reportes:

- **Reporte de línea base:** Versiones actuales por módulo
- **Reporte de cambios pendientes:** Issues abiertos por módulo
- **Reporte de auditoría:** Resultados de auditorías
- **Reporte de actividad del equipo:** Commits, PRs, Issues por desarrollador
- **Reporte de incidencias:** Issues generados desde `/reportar.html`
- **Métricas de calidad ITIL:** Tiempos de respuesta, porcentajes de cumplimiento

Ver [Reportes Automáticos](reportes.md) para más detalles.

---

## 🐛 Reportar Problemas

Los usuarios pueden reportar problemas o sugerencias mediante el formulario disponible en:

**[https://san00ale.github.io/coperativa-ambato-express/reportar.html](https://san00ale.github.io/coperativa-ambato-express/reportar.html)**

Los reportes se convierten automáticamente en Issues de GitHub para su seguimiento y gestión.

---

## 📚 Documentación Adicional

- [Plan de Gestión de Configuración](configuracion.md) - Políticas y procedimientos ITIL
- [Reportes Automáticos](reportes.md) - Métricas y estadísticas del proyecto
- [Ver README en GitHub](https://github.com/San00ale/coperativa-ambato-express/blob/main/README.md) - Información general del proyecto

---

## 📞 Contacto

Para consultas sobre el proyecto o la documentación, contacte al líder del equipo:

- **Santiago Gamboa** - Líder del Equipo
- **Email:** (configurar en proyecto)
- **GitHub:** [@San00ale](https://github.com/San00ale)

---

**Última actualización:** Junio 2026  
**Versión de documentación:** 1.0.0  
_Control y gestión de cambios – Versión vigente: 1.0_