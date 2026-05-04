-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'CLIENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "chasis" TEXT NOT NULL,
    "carroceria" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "capacidad" INTEGER NOT NULL,
    "asientosVIP" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Frecuencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "tipoViaje" TEXT NOT NULL DEFAULT 'DIRECTO',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ParadaFrecuencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frecuenciaId" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    CONSTRAINT "ParadaFrecuencia_frecuenciaId_fkey" FOREIGN KEY ("frecuenciaId") REFERENCES "Frecuencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frecuenciaId" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "busId" TEXT NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Ruta_frecuenciaId_fkey" FOREIGN KEY ("frecuenciaId") REFERENCES "Frecuencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ruta_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Boleto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rutaId" TEXT NOT NULL,
    "pasajeroId" TEXT NOT NULL,
    "asiento" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    "tipoPasajero" TEXT NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "comprobanteUrl" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE_APROBACION',
    "qrUrl" TEXT,
    "vendidoPor" TEXT,
    "vendidoPorChoferId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Boleto_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Boleto_pasajeroId_fkey" FOREIGN KEY ("pasajeroId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Boleto_vendidoPorChoferId_fkey" FOREIGN KEY ("vendidoPorChoferId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cedula_key" ON "Usuario"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_numero_key" ON "Bus"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_placa_key" ON "Bus"("placa");
