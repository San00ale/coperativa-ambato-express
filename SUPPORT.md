# Soporte y Ayuda - Cooperativa Ambato Express

¿Necesitas ayuda con Cooperativa Ambato Express? Aquí hay varios canales para obtener soporte.

---

## 🆘 Tipos de Soporte

### 🐛 **Reportar un Error (Bug)**

Si encontraste un bug en el proyecto:

1. **Verifica que no exista un issue similar**:
   - Busca en [Issues](https://github.com/San00ale/coperativa-ambato-express/issues)
   - Usa palabras clave relacionadas al error

2. **Crea un nuevo issue** siguiendo la plantilla de `bug_report.md`:
   - Título descriptivo: `[MÓDULO]: descripción breve`
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Capturas o videos (si es posible)
   - Sistema operativo y navegador

3. **Ejemplo de buen reporte**:
   ```
   Título: [CLIENTE]: La opción de asiento VIP no muestra el precio recargado
   
   Pasos para reproducir:
   1. Iniciar sesión como cliente
   2. Seleccionar una ruta con asientos VIP
   3. Hacer clic en un asiento VIP
   4. Ir a la página de pago
   
   Resultado esperado: Mostrar precio con 20% de recargo
   Resultado actual: Muestra precio base sin recargo
   ```

### 💡 **Solicitar una Característica (Feature Request)**

Para sugerir una nueva funcionalidad:

1. **Crea un issue** con la plantilla `feature_request.md`
2. **Describe**:
   - Qué problema resuelve
   - Cómo debería funcionar
   - Casos de uso
   - Beneficios para el proyecto

3. **Ejemplo**:
   ```
   Título: [CHOFER]: Agregar notificación cuando está próximo a llegar a destino
   
   Descripción: Los choferes necesitan saber cuándo están cerca del destino
   para avisar a los pasajeros.
   
   Solución propuesta: Mostrar una notificación cuando falten 10 minutos
   para llegar (basado en el cálculo de hora de llegada).
   ```

### 🎓 **Preguntas Generales o Documentación**

Para preguntas sobre cómo usar el proyecto o funcionamiento:

1. **Revisa la documentación**:
   - [README.md](README.md) - Guía de instalación
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Cómo contribuir
   - [Comentarios en el código](src/)

2. **Contacta al líder**:
   - Correo: santiago.gamboas@outlook.com
   - GitHub: @San00ale

3. **Reunión con el equipo**:
   - Solicita una sesión de dudas en el grupo

### 🔒 **Reportar una Vulnerabilidad de Seguridad**

⚠️ **IMPORTANTE**: No publiques vulnerabilidades en issues públicas.

- Lee [SECURITY.md](.github/SECURITY.md)
- Contacta: santiago.gamboas@outlook.com
- Asunto: `[SECURITY] Vulnerabilidad en Cooperativa Ambato Express`

---

## 📞 Canales de Contacto

### Miembros del Equipo

| Rol | Nombre | GitHub | Email |
|-----|--------|--------|-------|
| **Líder Backend** | Santiago Alejandro | @San00ale | santiago.gamboas@outlook.com |
| **Frontend Cliente** | David | @DavidPe1307 | - |
| **Frontend Oficinista** | - | @killer13233 | - |
| **Frontend Chofer** | Jonathan | @Jonathan305g | - |
| **Frontend Admin** | Sheyla | @Zzzheyla | - |

### Respuesta Esperada

| Tipo de Solicitud | Tiempo de Respuesta |
|------------------|-------------------|
| Bug Crítico | 24 horas |
| Bug Normal | 48 horas |
| Feature Request | 3-5 días |
| Pregunta General | 2-3 días |
| Vulnerabilidad | 24 horas |

---

## 🔍 Solucionar Problemas Comunes

### Instalación y Setup

#### Problema: `npm install` falla

```bash
# Solución 1: Limpiar caché
rm -rf node_modules package-lock.json
npm install

# Solución 2: Usar versión específica de Node
node --version  # Debe ser 20+
nvm use 20
npm install
```

#### Problema: Prisma no migra correctamente

```bash
# Solución: Regenerar cliente de Prisma
npx prisma generate
npx prisma migrate dev --name fix_migration
npx prisma db seed
```

### Desarrollo Local

#### Problema: Variables de entorno no cargadas

```bash
# Asegurate de que exista .env.local
cp .env.example .env.local

# Verifica que contenga:
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=tu_secreto_aqui
NEXTAUTH_URL=http://localhost:3000
```

#### Problema: Base de datos corrupta

```bash
# Limpia y recrea la BD
rm prisma/dev.db
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Conectividad y API

#### Problema: API no responde

1. Verifica que el servidor esté corriendo: `npm run dev`
2. Revisa los logs en la terminal
3. Abre `http://localhost:3000` en el navegador
4. Comprueba `http://localhost:3000/api/boletos`

#### Problema: CORS error

- Verifica `NEXTAUTH_URL` en `.env.local`
- Asegurate de que el frontend hace requests a `http://localhost:3000`
- Verifica la configuración de CORS en `next.config.js`

### Autenticación

#### Problema: No puedo iniciar sesión

1. Verifica las credenciales de prueba:
   - Admin: `admin@coperativa.com` / `admin123`
   - Cliente: `cliente@test.com` / `cliente123`

2. Comprueba si el usuario existe:
   ```bash
   npx prisma studio  # Abre interfaz visual de BD
   ```

3. Regenera la BD si es necesario

---

## 📚 Recursos Útiles

### Documentación Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Prisma ORM](https://www.prisma.io/docs/)
- [NextAuth.js](https://next-auth.js.org/getting-started/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Herramientas Recomendadas

- [VS Code](https://code.visualstudio.com/) + [Extensiones](CONTRIBUTING.md)
- [Postman](https://www.postman.com/) - Prueba de APIs
- [GitHub Desktop](https://desktop.github.com/) - Gestión de Git
- [Prisma Studio](https://www.prisma.io/studio) - Visualizar BD

### Tutoriales

- [Next.js Tutorial](https://nextjs.org/learn/basics/getting-started)
- [Prisma Tutorial](https://www.prisma.io/docs/getting-started)
- [Git Workflow](https://guides.github.com/introduction/git-handbook/)

---

## 📋 Checklist Antes de Reportar un Problema

Antes de contactar con soporte, verifica:

- [ ] ¿Seguí los pasos de instalación correctamente?
- [ ] ¿Ejecuté `npm install` y `npx prisma migrate dev`?
- [ ] ¿Tengo Node.js 20 o superior?
- [ ] ¿El servidor está corriendo (`npm run dev`)?
- [ ] ¿Limpié caché del navegador (Ctrl+Shift+Del)?
- [ ] ¿Busqué el problema en [issues existentes](https://github.com/San00ale/coperativa-ambato-express/issues)?
- [ ] ¿Incluí suficiente información en mi reporte?

---

## 🤝 Cómo Contribuir

Si quieres ayudar a resolver problemas o agregar funcionalidades:

1. Lee [CONTRIBUTING.md](CONTRIBUTING.md)
2. Elige un issue abierto
3. Comenta que trabajarás en él
4. Crea un Pull Request siguiendo las normas
5. Espera revisión del líder

---

## 📞 Contacto Directo

Si ninguno de los anteriores canales funciona:

**Email**: santiago.gamboas@outlook.com  
**Asunto**: `[SOPORTE] Tu pregunta aquí`

---

## 🎯 Objetivos de Soporte

Nos esforzamos por:

✅ Responder rápidamente a reportes de bugs  
✅ Mantener documentación clara y actualizada  
✅ Proporcionar soluciones prácticas  
✅ Ser respetuosos y constructivos  
✅ Mejorar continuamente basándose en feedback  

---

**Última actualización**: 28 de mayo de 2026
