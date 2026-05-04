import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Sembrando datos de prueba...")

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@coperativa.com" },
    update: {},
    create: {
      email: "admin@coperativa.com",
      password: await bcrypt.hash("admin123", 10),
      nombre: "Administrador",
      cedula: "9999999999",
      rol: "ADMIN",
    },
  })
  console.log("✅ Admin creado:", admin.email)

  const oficinista = await prisma.usuario.upsert({
    where: { email: "oficinista@coperativa.com" },
    update: {},
    create: {
      email: "oficinista@coperativa.com",
      password: await bcrypt.hash("ofi123", 10),
      nombre: "Oficinista",
      cedula: "8888888888",
      rol: "OFICINISTA",
    },
  })
  console.log("✅ Oficinista creado:", oficinista.email)

  const chofer = await prisma.usuario.upsert({
    where: { email: "chofer@coperativa.com" },
    update: {},
    create: {
      email: "chofer@coperativa.com",
      password: await bcrypt.hash("chofer123", 10),
      nombre: "Chofer",
      cedula: "7777777777",
      rol: "CHOFER",
    },
  })
  console.log("✅ Chofer creado:", chofer.email)

  const cliente = await prisma.usuario.upsert({
    where: { email: "cliente@test.com" },
    update: {},
    create: {
      email: "cliente@test.com",
      password: await bcrypt.hash("cliente123", 10),
      nombre: "Cliente Test",
      cedula: "1234567890",
      rol: "CLIENTE",
    },
  })
  console.log("✅ Cliente creado:", cliente.email)

  console.log("🎉 Seed completado!")
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })