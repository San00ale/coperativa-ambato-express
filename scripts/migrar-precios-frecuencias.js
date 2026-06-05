import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando migración de precios base para frecuencias...')

  const frecuenciasSinPrecio = await prisma.frecuencia.findMany({
    where: { precioBase: null }
  })

  console.log(`Encontradas ${frecuenciasSinPrecio.length} frecuencias sin precio base`)

  for (const frecuencia of frecuenciasSinPrecio) {
    await prisma.frecuencia.update({
      where: { id: frecuencia.id },
      data: { precioBase: 5.00 }
    })
    console.log(`Asignado precio base de $5.00 a frecuencia: ${frecuencia.origen} → ${frecuencia.destino}`)
  }

  console.log('Migración completada exitosamente')
}

main()
  .catch((e) => {
    console.error('Error durante la migración:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })