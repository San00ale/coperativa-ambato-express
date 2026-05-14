## [feat]: Agregar plantillas profesionales para issues y pull requests

### 📌 Resumen Ejecutivo

Se implementan plantillas estandarizadas y profesionales para issues y pull requests que mejoran significativamente la calidad de comunicación dentro del equipo de desarrollo. Estas plantillas guían a los colaboradores a proporcionar información estructurada, consistente y relevante que facilita la revisión de código, el seguimiento de tareas y la documentación del proyecto.

**Resultado esperado:** Mejor trazabilidad, menos ambigüedad en los requisitos, y procesos de review más eficientes.

---

### 🎯 Objetivo del cambio

- ✅ Estandarizar la estructura y contenido de issues en el repositorio
- ✅ Implementar plantillas para diferentes tipos de issues (bugs, features, refactors, preguntas)
- ✅ Crear una plantilla profesional y completa para pull requests
- ✅ Mejorar la calidad de comunicación técnica entre colaboradores
- ✅ Facilitar la automatización futura basada en información estructurada
- ✅ Proporcionar guías claras sobre qué información es necesaria en cada tipo de contribución

---

### 🧩 Contexto / Problema detectado

**Problema identificado:**
- Sin plantillas, los issues carecen de estructura y consistencia
- Falta de información contextual en PRs dificulta las revisiones
- Ausencia de guías claras sobre qué debe incluirse en cada tipo de contribución
- Difícil trazabilidad de decisiones técnicas y cambios

**Solicitud:** Proyecto académico de segundo parcial - Requisito de buenas prácticas en gestión de repositorios

---

### 🔧 Tipo de cambio

- [x] ✨ feat (Nueva funcionalidad de infraestructura)
- [ ] 🐞 bug
- [ ] ♻️ refactor
- [ ] 🔒 sec

---

### 🛠 Cambios realizados

1. **Plantilla para Issue Profesional** (`.github/ISSUE_TEMPLATE/issue-profesional.md`)
   - Estructura completa con convención de títulos por rol
   - Secciones: resumen ejecutivo, objetivo, contexto, criterios de aceptación
   - Incluye dependencias, APIs, testing y checklist para desarrolladores

2. **Plantilla para Reporte de Error** (`.github/ISSUE_TEMPLATE/bug-report.md`)
   - Pasos para reproducir
   - Comportamiento actual vs esperado
   - Información del entorno
   - Adjuntos para evidencia visual

3. **Plantilla para Solicitud de Característica** (`.github/ISSUE_TEMPLATE/feature-request.md`)
   - Descripción del problema que resuelve
   - Solución propuesta y alternativas
   - Mockups y ejemplos
   - Impacto esperado

4. **Plantilla para Refactor/Deuda Técnica** (`.github/ISSUE_TEMPLATE/refactor-request.md`)
   - Ubicación del código
   - Problemas actuales y mejoras esperadas
   - Estrategia de validación
   - Impacto en usuarios

5. **Plantilla para Preguntas** (`.github/ISSUE_TEMPLATE/question.md`)
   - Formulación clara de la pregunta
   - Contexto de investigación previa
   - Links y documentación relacionada

6. **Plantilla Profesional para Pull Requests** (`.github/pull_request_template.md`)
   - Convención de títulos: `[tipo]: descripción`
   - Resumen ejecutivo del cambio
   - Detalles técnicos completos
   - Checklists para código, calidad, seguridad y base de datos
   - Consideraciones de despliegue y rollback
   - Notas para reviewers

7. **Archivo de Configuración** (`.github/ISSUE_TEMPLATE/config.yml`)
   - Desactiva issues en blanco
   - Añade links útiles a documentación y discusiones

8. **Archivo de Referencia** (`.github/PULL_REQUEST_BODY.md`)
   - Documentación completa del formato de PRs para referencia del equipo

---

### 📂 Áreas / Componentes afectados

- [x] Documentación
- [x] Infraestructura de repositorio
- [x] Procesos de desarrollo

---

### ⚠ Impacto del cambio

#### Impacto funcional
- Los colaboradores verán un selector de plantillas al crear issues/PRs
- Mejor experiencia de contribución con guías claras
- Reducción de issues incompletos o mal documentados

#### Impacto técnico
- Se establece estructura estándar para metadata de issues/PRs
- Facilita automatización futura (bots, scripts de análisis)
- Mejora en la organización de información técnica

#### Impacto en rendimiento
No aplica

#### Impacto en seguridad
Positivo - Las plantillas incluyen checklists de seguridad (validación de inputs, exposición de secretos, etc.)

---

### 🚨 Riesgos identificados

- [x] Sin riesgos relevantes
- [ ] Puede afectar otras funcionalidades

**Justificación:** Solo se agregan archivos de configuración y documentación, sin cambios al código productivo.

---

### 🧪 Validación / Testing

#### Tipos de prueba ejecutados

- [x] Manuales - Se crearon y testearon localmente todas las plantillas
- [x] Validación manual - Se verificó que las plantillas aparezcan en los selectores de GitHub

#### Resultado obtenido

✅ Todas las plantillas se renderizaron correctamente en el editor de GitHub
✅ Los selectores muestran todas las opciones disponibles
✅ El archivo config.yml desactiva correctamente los issues en blanco
✅ Los links en config.yml apuntan a ubicaciones válidas

---

### 🧪 Cómo probar localmente

1. Clonear la rama `feat/github-templates-professional`
2. Verificar que los archivos existan en `.github/ISSUE_TEMPLATE/` y `.github/pull_request_template.md`
3. En GitHub.com, ir a "New Issue" - debería mostrar selector de plantillas
4. En GitHub.com, ir a crear un PR - debería precargarse con la plantilla

---

### 📸 Evidencia visual

**Estructura de archivos creada:**
```
.github/
├── ISSUE_TEMPLATE/
│   ├── config.yml
│   ├── issue-profesional.md
│   ├── bug-report.md
│   ├── feature-request.md
│   ├── refactor-request.md
│   └── question.md
├── pull_request_template.md
└── PULL_REQUEST_BODY.md
```

---

### 📋 Issues relacionados

- No hay issues específicos vinculados
- Este es un requisito del proyecto académico "Segundo Parcial"

---

### 🚀 Consideraciones para despliegue

- [x] No requiere acciones adicionales
- [ ] Requiere migración BD
- [ ] Requiere variables de entorno
- [ ] Requiere reinicio de servicios

**Detalles:** Los cambios son inmediatos en GitHub. No requieren ninguna acción adicional.

---

### 🔙 Plan de rollback

- [x] Revert simple

**Procedimiento:** Un simple revert del commit eliminaría todas las plantillas. Los issues y PRs existentes no se verían afectados.

---

### 👀 Checklist del autor

#### Código
- [x] Sigue estándares del proyecto
- [x] Código limpio y mantenible (Markdown bien formateado)
- [x] Sin código muerto
- [x] Sin conflictos de merge

#### Calidad
- [x] Probado localmente
- [x] Revisado manualmente
- [x] Sin errores visibles
- [x] Plantillas completas y coherentes

#### Documentación
- [x] Plantillas incluyen guías claras
- [x] Archivo PULL_REQUEST_BODY.md como referencia
- [x] Comentarios explicativos en secciones complejas

---

### 🧠 Notas para reviewers

#### Revisar especialmente:

- Las convenciones de títulos en cada plantilla (¿son claras y aplicables al proyecto?)
- Si falta algún tipo de issue (ej: "Security Report", "Performance Issue")
- Si las secciones del PR template son demasiadas o insuficientes
- Si los emojis y formato son consistentes con la identidad del proyecto

#### Preguntas abiertas:

- ¿Se necesitan plantillas adicionales específicas del proyecto?
- ¿Debería haber restricciones en las labels que se usan?

---

### ✅ Resultado esperado tras merge

Inmediatamente después de hacer merge a `main`:

1. ✅ GitHub mostrará selector de plantillas al hacer "New Issue"
2. ✅ La plantilla de PR aparecerá precargada en nuevos PRs
3. ✅ Los issues vacíos serán bloqueados por la configuración
4. ✅ El equipo tendrá acceso a guías estructuradas

---

### 🏁 Estado sugerido

- [x] **Ready for Review** - Listo para que team members revisen
- [ ] Draft PR
- [ ] Requires Changes

---

**Autor:** @San00ale  
**Fecha de creación:** 2026-05-14  
**Branch:** `feat/github-templates-professional`
