# 🚌 Cooperativa Ambato Express

Sistema web para la gestión y venta de pasajes de transporte interprovincial en Ecuador.

## 📌 Descripción

Aplicación desarrollada como proyecto académico para la materia de **Gestión de Configuración del Software**. Permite a diferentes roles (administrador, oficinista, chofer, cliente) gestionar la venta de boletos de manera eficiente.

## 🛠️ Tecnologías utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 14.x | Framework principal |
| TypeScript | 5.x | Tipado seguro |
| Tailwind CSS | 3.x | Estilos responsive |
| Prisma | 5.22.0 | ORM para base de datos |
| SQLite | 3.x | Base de datos local |
| NextAuth | 4.x | Autenticación |
| QRCode | 1.x | Generación de códigos QR |
| Cloudinary | - | Subida de comprobantes |
| Resend | - | Envío de correos |

## 📋 Requisitos previos

- Node.js (versión 20 o superior)
- Git

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/San00ale/coperativa-ambato-express.git
cd coperativa-ambato-express

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Generar base de datos
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed

# Iniciar el proyecto
npm run dev

🔐 Credenciales de prueba
Rol	Correo	Contraseña
Administrador	admin@coperativa.com	admin123
Oficinista	oficinista@coperativa.com	ofi123
Chofer	chofer@coperativa.com	chofer123
Cliente	cliente@test.com	cliente123

📡 APIs disponibles
Método	Endpoint	Descripción
POST	/api/boletos	Crear boleto
GET	/api/boletos/mis-compras	Historial del cliente
GET	/api/boletos/pendientes	Pagos pendientes (oficinista)
PUT	/api/boletos/[id]/aprobar	Aprobar pago y generar QR
POST	/api/ventas-chofer	Venta en ruta (chofer)
POST	/api/boletos/validar	Validar QR (chofer)
POST	/api/upload	Subir comprobante

👥 Equipo de desarrollo
Integrante	Rol	GitHub
San00ale	Líder - Backend	@San00ale
DavidPe1307	Frontend - Cliente	@DavidPe1307
killer13233	Frontend - Oficinista	@killer13233
Jonathan305g	Frontend - Chofer	@Jonathan305g
Zizheyla	Frontend - Admin	@Zzzheyla

📅 Entregas
Fecha	Evento	Tag
03/05/2026	Backend base	v0.1.0
06/05/2026	APIs completas	v0.2.0
14/05/2026	Prototipo funcional	v1.0.0
22/05/2026	Producto final	v2.0.0

📄 Licencia
MIT License - Ver archivo LICENSE