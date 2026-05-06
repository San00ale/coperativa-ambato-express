# Guía para Colaboradores

## 📌 Reglas generales

1. **Nunca trabajar directamente en la rama `develop` o `main`**
2. **Siempre crear ramas `feature/` para nuevas funcionalidades**
3. **Los commits deben estar en PRESENTE y ser descriptivos**

## 🌿 Estructura de ramas

| Rama | Propósito |
|------|-----------|
| `main` | Versión estable del proyecto |
| `develop` | Integración de cambios |
| `feature/*` | Nuevas funcionalidades |
| `fix/*` | Correcciones de errores |

## 📝 Formato de commits

### Tipos permitidos:
- `feat` - Nueva funcionalidad
- `fix` - Corrección de error
- `style` - Cambios visuales (CSS, diseño)
- `refactor` - Mejora interna
- `docs` - Documentación
- `chore` - Tareas de configuración

### Ejemplos correctos:
```bash
feat(admin): agrega listado de buses
fix(login): corrige error de autenticación
style(cliente): diseña buscador de rutas

🔀 Pull Requests
Subir la rama a GitHub

Crear Pull Request hacia develop

En la descripción incluir Closes #N (N = número del issue)

El líder revisa y aprueba

📋 Issues
Usar etiquetas: tipo: normal, tipo: estandar, tipo: emergencia

Asignar a un integrante

Cerrar automáticamente con Closes #N en el PR

✅ Flujo diario
bash
git checkout develop
git pull upstream develop
git checkout -b feature/tu-tarea
# trabajar...
git add .
git commit -m "feat(modulo): descripcion"
git push origin feature/tu-tarea
# crear Pull Request en GitHub
📸 Capturas de pantalla
Tomar capturas de:

Código en VS Code

Pantalla funcionando en navegador

Pull Request creado

Issue cerrado

🆘 ¿Ayuda?
Preguntar en el grupo antes de quedarse atascado más de 30 minutos.