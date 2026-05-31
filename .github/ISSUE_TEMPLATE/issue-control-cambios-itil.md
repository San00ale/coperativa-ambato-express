---
name: "🔄 Control de Cambios ITIL (Completo)"
about: "Plantilla profesional con gestión de cambios, riesgos, rollback, implementación y pruebas"
title: "[ROL]: breve descripción del cambio"
labels: ["tipo: normal", "cambio", "needs-triage"]
assignees: ""
---

<!-- 
  ⚠️ INSTRUCCIONES (léelas antes de completar):
  - Esta plantilla sigue las buenas prácticas de ITIL para gestión de cambios.
  - Todos los campos marcados con `*` son obligatorios para cambios de tipo Normal o Emergencia.
  - Para cambios Estándar (bajo riesgo) puedes omitir secciones como rollback detallado.
  - El título DEBE comenzar con el rol entre corchetes: [ADMIN], [BACKEND], [FRONTEND], etc.
-->

---

## 📋 A. IDENTIFICACIÓN DEL CAMBIO

| Campo | Valor |
|-------|-------|
| **N° de Cambio (CR)** | `CR-{{ date | date('YYYY') }}-XXXX` (se genera automáticamente al crear, déjalo así) |
| **Fecha de solicitud** | {{ date | date('YYYY-MM-DD') }} |
| **Rol asignado** | @(usuario) |
| **Prioridad** | (elige una) `Crítica` / `Alta` / `Media` / `Baja` |
| **Versión / Sprint** | Ej: Sprint 24 / v2.3.0 |
| **Módulo / Componente** | |

---

## 📌 B. RESUMEN EJECUTIVO *
<!-- Explica en 3-5 líneas: qué problema resuelve, por qué es necesario, resultado esperado -->

---

## 🎯 C. OBJETIVO DEL ISSUE

- 
- 
- 

---

## 🧩 D. CONTEXTO / PROBLEMA DETECTADO *

**Tipo de trabajo:** (elige una)
- [ ] Nueva funcionalidad
- [ ] Mejora técnica
- [ ] Corrección de error (bugfix)
- [ ] Optimización de rendimiento
- [ ] Solicitud académica
- [ ] Otro: _____

**Detalle del problema / necesidad:**

---

## ✅ E. CRITERIOS DE ACEPTACIÓN *

- [ ] Criterio 1: 
- [ ] Criterio 2: 
- [ ] Criterio 3: 

---

## 🔗 F. DEPENDENCIAS

**Depende de:** # (número de issue)  
**Bloquea a:** # (número de issue)

**APIs o componentes involucrados** (tabla opcional pero recomendada):

| Tipo | Nombre | Descripción |
|------|--------|-------------|
| API | `GET /api/...` | |
| Componente | `NombreComponente` | |

---

## 📅 G. PLANIFICACIÓN *

| Campo | Valor |
|-------|-------|
| **Fecha de inicio deseada** | DD/MM/YYYY |
| **Fecha límite (fin estimado)** | DD/MM/YYYY |
| **Ventana de implementación** | (si requiere downtime, ej: sábado 02:00-04:00) |
| **Duración estimada de la implementación** | |
| **Recursos necesarios** | (personas, accesos, herramientas) |

---

## 📂 H. ÁREAS AFECTADAS

- [ ] Frontend
- [ ] Backend
- [ ] API
- [ ] Base de datos
- [ ] UI/UX
- [ ] Documentación
- [ ] Infraestructura / DevOps
- [ ] Otro: _____

---

## 🔧 I. PLAN DE IMPLEMENTACIÓN *

**Pasos detallados para ejecutar el cambio** (numerados):

1. 
2. 
3. 

**Criterios de éxito de la implementación:**

**Plan de pruebas post-implementación** (qué y cómo se validará después del despliegue):

---

## ⚠️ J. IMPACTO Y RIESGOS *

**Impacto en disponibilidad:**
- [ ] Requiere tiempo de inactividad (downtime)
- [ ] Requiere migración de base de datos
- [ ] Requiere capacitación de usuarios
- [ ] Requiere actualización de documentación

**Riesgos identificados:**
- [ ] Sin riesgos relevantes
- [ ] Puede afectar otras funcionalidades
- [ ] Requiere validación adicional
- [ ] Otro: _____

**Plan de mitigación:**

---

## 🔄 K. PLAN DE REVERSIÓN (ROLLBACK) - OBLIGATORIO para cambios Normal/Emergencia

**Condiciones que activan el rollback** (ej: tasa de error >1%, fallo en pruebas de humo):

**Pasos para revertir el cambio**:

1. 
2. 
3. 

**Responsable del rollback:** @usuario

**Tiempo estimado de reversión:**

---

## 👀 L. CHECKLIST DEL DESARROLLADOR (antes de entregar)

### Código
- [ ] Sigue estándares del proyecto
- [ ] Código limpio y ordenado
- [ ] Sin console.log / debugger

### Calidad
- [ ] Probado localmente
- [ ] Sin errores visibles
- [ ] Casos edge considerados (sin datos, errores, carga)

### Pruebas
- [ ] Pruebas unitarias actualizadas
- [ ] Pruebas de integración (si aplica)

### Documentación
- [ ] Comentarios agregados donde sea necesario
- [ ] Documentación técnica actualizada (README, wiki, o código)

---

## 📝 M. APROBACIONES (Control de Cambios)

| Rol | Estado (Pendiente / Aprobado / Rechazado) | Fecha | Observaciones |
|-----|-------------------------------------------|-------|----------------|
| **Líder técnico** | | | |
| **Gerente de proyecto** | | | |
| **CCB / CAB** | | | |

---

## 🧠 N. NOTAS ADICIONALES Y EVIDENCIA

**Notas para el desarrollador:**

**Evidencia (mockups, capturas, logs, enlaces):**  
(pega imágenes arrastrándolas aquí)

---

## 📚 O. LECCIONES APRENDIDAS (para cerrar el issue)

*Esta sección se completa al final, cuando el cambio ya está implementado y cerrado.*

- ¿Qué salió bien?
- ¿Qué se puede mejorar?
- ¿Se activó el rollback? ¿Por qué?

---

## 🏷️ P. ETIQUETAS SUGERIDAS (se añadirán automáticamente)

- `tipo: normal` (o `emergencia` / `estandar`)
- `modulo: [rol]`
- `prioridad: alta/media/baja/critica`
- `estado: propuesto`

---

**👤 Asignado a:** @(usuario)  
**📅 Fecha de creación:** {{ date | date('YYYY-MM-DD HH:mm') }}