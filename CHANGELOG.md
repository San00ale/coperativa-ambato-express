# Registro de Cambios - Cooperativa Ambato Express

Todos los cambios notables en este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.0.0] - 2026-05-22 (Producto Final)

### 🎉 Agregado

- **Módulo Chofer - Completo**
  - Dashboard de mis rutas
  - Botones Iniciar/Finalizar viaje
  - Venta de boletos en ruta
  - Validación de QR de boletos
  - Hora de llegada estimada

- **Módulo Oficinista - Completo**
  - Hoja de ruta diaria
  - Venta múltiple de boletos
  - Selección múltiple de asientos
  - Gestión de asientos VIP
  - Visualización de rutas

- **Módulo Cliente - Completo**
  - Búsqueda y compra de boletos
  - Selección de asientos (incluyendo VIP)
  - Métodos de pago (transferencia y efectivo)
  - Subida de comprobantes
  - Historial de compras
  - Validación de QR

- **Módulo Admin - Completo**
  - Dashboard con estadísticas
  - Gestión de rutas
  - Gestión de buses
  - Gestión de choferes y oficinistas
  - Gestión de frecuencias
  - Asientos VIP por bus

### 🔧 Mejorado

- Interfaz responsiva en todos los módulos
- Rendimiento optimizado
- Validaciones de datos mejoradas
- Manejo de errores consistente

### 📚 Documentación

- README con instrucciones completas
- Guía para colaboradores (CONTRIBUTING.md)
- Código de conducta del proyecto
- Política de seguridad

---

## [1.0.0] - 2026-05-14 (Prototipo Funcional)

### 🎉 Agregado

- **Autenticación**
  - NextAuth.js configurado
  - Registro y login de usuarios
  - Roles de usuario (Admin, Oficinista, Chofer, Cliente)
  - Protección de rutas

- **Base de Datos**
  - Schema Prisma completo
  - Migraciones iniciales
  - Seeders con datos de prueba

- **Módulo Admin (MVP)**
  - Dashboard básico
  - Gestión de rutas
  - Gestión de buses
  - Gestión de frecuencias

- **Módulo Oficinista (MVP)**
  - Hoja de ruta
  - Venta de boletos
  - Visualización de rutas

- **Módulo Chofer (MVP)**
  - Mis rutas
  - Validación de boletos

- **Módulo Cliente (MVP)**
  - Búsqueda de rutas
  - Compra de boletos
  - Selección de asientos
  - Historial de compras

- **Componentes Comunes**
  - Navbar con navegación
  - Footer
  - Autenticación visual
  - Tema responsivo

---

## [0.2.0] - 2026-05-06 (APIs Completas)

### 🎉 Agregado

- **Backend APIs**
  - `POST /api/boletos` - Crear boleto
  - `GET /api/boletos/mis-compras` - Historial del cliente
  - `GET /api/boletos/pendientes` - Pagos pendientes (oficinista)
  - `PUT /api/boletos/[id]/aprobar` - Aprobar pago y generar QR
  - `POST /api/ventas-chofer` - Venta en ruta (chofer)
  - `POST /api/boletos/validar` - Validar QR (chofer)
  - `POST /api/upload` - Subir comprobante
  - `GET /api/rutas` - Obtener rutas
  - `GET /api/buses` - Obtener buses
  - `GET /api/frecuencias` - Obtener frecuencias

- **Integración de Servicios**
  - Cloudinary para subida de archivos
  - Resend para envío de correos
  - QRCode para generación de códigos QR
  - Prisma como ORM

### 🔧 Mejorado

- Validación de datos en backend
- Manejo de errores consistente
- Respuestas JSON estructuradas

---

## [0.1.0] - 2026-05-03 (Backend Base)

### 🎉 Agregado

- **Setup Inicial**
  - Next.js 14 configurado
  - TypeScript integrado
  - Tailwind CSS configurado
  - Prisma ORM setup
  - SQLite como BD local

- **Autenticación Base**
  - NextAuth.js configurado
  - Proveedores de auth
  - Protección de API routes

- **Base de Datos Schema**
  - User (Usuarios)
  - Bus (Buses)
  - Ruta (Rutas)
  - Frecuencia (Frecuencias)
  - Boleto (Boletos)
  - Transaccion (Transacciones)

- **Estructura de Proyecto**
  - Carpetas organizadas
  - Componentes React base
  - Utilidades comunes
  - Variables de entorno

---

## Cambios Planificados (Próximas Versiones)

### [2.1.0] - Sprint 5 (En Progreso)

#### 🚨 Emergencias (0 cambios)

#### 🔴 Estándar (0 cambios)

#### 🟡 Normales (10 cambios)

1. **[CHOFER]** Mostrar hora de llegada estimada en rutas
2. **[CHOFER]** Excluir rutas completadas del selector de venta en ruta
3. **[CHOFER]** Añadir botones "Iniciar viaje" y "Finalizar viaje"
4. **[OFICINISTA]** Confirmar visualización de rutas de hoy
5. **[OFICINISTA]** Asegurar selección múltiple con asientos VIP
6. **[CLIENTE]** Mejorar experiencia de subida de comprobante
7. **[CLIENTE]** Verificar recargo de precio en asientos VIP
8. **[ADMIN]** Crear interfaz para gestionar choferes y oficinistas
9. **[ADMIN]** Mejorar bloque de estadísticas de ventas
10. (1 cambio adicional pendiente)

**Fecha Límite**: 31 de mayo de 2026

---

## Cómo Reportar Cambios

Para cada cambio completado, crear un Pull Request con:

```markdown
## Cambio Completado

- **Número de Issue**: #XXX
- **Tipo**: [EMERGENCIA | ESTÁNDAR | NORMAL]
- **Módulo**: [ADMIN | OFICINISTA | CHOFER | CLIENTE]
- **Descripción**: Resumen del cambio
- **Archivos Modificados**: Lista de archivos
- **Testing**: Cómo se probó
- **Impacto**: Posibles efectos secundarios
```

---

## Notas de Versiones

### Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@coperativa.com | admin123 |
| Oficinista | oficinista@coperativa.com | ofi123 |
| Chofer | chofer@coperativa.com | chofer123 |
| Cliente | cliente@test.com | cliente123 |

### Actualizaciones de Dependencias

```bash
# Última actualización: 28-05-2026
npm list
```

---

## Historial Completo

- **2026-05-03**: v0.1.0 - Backend base ✅
- **2026-05-06**: v0.2.0 - APIs completas ✅
- **2026-05-14**: v1.0.0 - Prototipo funcional ✅
- **2026-05-22**: v2.0.0 - Producto final ✅
- **2026-05-28**: v2.1.0 (sprint) - En progreso 🔄

---

**Última actualización**: 28 de mayo de 2026
