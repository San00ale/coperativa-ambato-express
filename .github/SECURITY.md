# Política de Seguridad - Cooperativa Ambato Express

## Reportar Vulnerabilidades de Seguridad

Si descubres una vulnerabilidad de seguridad en Cooperativa Ambato Express, **por favor NO la publiques en issues públicas**. En su lugar:

### 📧 Contacto de Seguridad

1. **Envía un correo a**: santiago.gamboas@outlook.com
2. **Asunto**: `[SECURITY] Vulnerabilidad en Cooperativa Ambato Express`
3. **Incluye**:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de solución (si las tienes)

### ⏱️ Tiempo de Respuesta

Nos comprometemos a:

- **24 horas**: Reconocer el reporte
- **48 horas**: Evaluación inicial
- **7 días**: Plan de remediación
- **14 días**: Parche o corrección (cuando sea posible)

### 🔒 Confidencialidad

- El reporte será tratado de forma confidencial
- Solo lo conocerán los miembros del equipo de seguridad
- No se publicará hasta que se haya aplicado la corrección
- Se te creditará en el aviso de seguridad (si lo deseas)

---

## Prácticas de Seguridad del Proyecto

### 🔐 Autenticación y Autorización

- **NextAuth.js**: Implementación segura de autenticación
- **Contraseñas**: Almacenadas con hash bcrypt
- **Sesiones**: Tokens JWT con expiración
- **Roles**: Control de acceso basado en roles (RBAC)
  - `ADMIN`: Acceso total
  - `OFICINISTA`: Gestión de rutas y ventas
  - `CHOFER`: Operación de rutas
  - `CLIENTE`: Compra de pasajes

### 📊 Base de Datos

- **SQLite + Prisma**: ORM con validación de esquema
- **Variables de Entorno**: Credenciales no committeadas
- **Migrations**: Control de versiones de BD
- **Backups**: Recomendado para producción

### 🔗 APIs

- **Validación de Entrada**: Todos los endpoints validan datos
- **Rate Limiting**: Protección contra fuerza bruta (implementar)
- **CORS**: Configurado para origen específico
- **HTTPS**: Obligatorio en producción
- **Headers de Seguridad**: Implementar en respuestas

### 🖼️ Archivos y Media

- **Cloudinary**: Almacenamiento seguro de comprobantes
- **Validación de Tipo**: Solo imágenes permitidas
- **Límite de Tamaño**: Máximo 2 MB
- **Scaneo de Malware**: Recomendado configurar

### 💳 Pagos

- **No Almacenar PCI**: No guardar datos completos de tarjetas
- **Validación de Transacciones**: Verificar comprobantes de pago
- **Logs Seguros**: Sin datos sensibles

### 🚀 Deployment

- **Variables de Entorno**: `.env.local` en `.gitignore`
- **Secretos**: Usar servicios seguros (GitHub Secrets, etc.)
- **Actualizaciones**: Mantener dependencias actualizadas
- **Monitoreo**: Registrar accesos y errores

---

## Dependencias y Vulnerabilidades

### Verificación Regular

```bash
# Auditar dependencias
npm audit

# Actualizar dependencias seguras
npm update
```

### Políticas de Actualización

- **Patches de Seguridad (X.Y.Z)**: Actualizar inmediatamente
- **Minor Updates (X.Y)**: Actualizar dentro de 1 semana
- **Major Updates (X)**: Evaluar y planificar

---

## Checklist de Seguridad Pre-Producción

Antes de desplegar a producción:

- [ ] Todas las variables sensibles en `.env.local`
- [ ] `console.log` y debug removidos del código
- [ ] Dependencies auditadas (`npm audit`)
- [ ] HTTPS habilitado
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado
- [ ] Logs de seguridad configurados
- [ ] Backup de BD planificado
- [ ] Plan de incident response documentado

---

## Códigos de Error Seguros

**No exponer información sensible en mensajes de error:**

❌ **Incorrecto**:
```
Error: Usuario no encontrado. Usuario ID: 123 en BD: production_db
```

✅ **Correcto**:
```
Error: No se pudo procesar su solicitud. Por favor intente más tarde.
```

---

## Contactos de Seguridad del Equipo

| Rol | Nombre | GitHub | Email |
|-----|--------|--------|-------|
| Líder/Backend | Santiago Alejandro | @San00ale | santiago.gamboas@outlook.com |
| Responsable de Seguridad | San00ale | @San00ale | santiago.gamboas@outlook.com |

---

## Referencias de Seguridad

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 28-05-2026 | Versión inicial |

---

**Última actualización**: 28 de mayo de 2026  
**Vigencia**: A partir del 28 de mayo de 2026
