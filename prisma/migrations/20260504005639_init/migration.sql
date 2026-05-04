-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Boleto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rutaId" TEXT NOT NULL,
    "pasajeroId" TEXT NOT NULL,
    "asiento" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    "tipoPasajero" TEXT NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "comprobanteUrl" TEXT,
    "estado" TEXT NOT NULL,
    "qrUrl" TEXT,
    "vendidoPor" TEXT,
    "vendidoPorChoferId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Boleto_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Boleto_pasajeroId_fkey" FOREIGN KEY ("pasajeroId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Boleto_vendidoPorChoferId_fkey" FOREIGN KEY ("vendidoPorChoferId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Boleto" ("asiento", "comprobanteUrl", "createdAt", "descuento", "estado", "id", "metodoPago", "pasajeroId", "precio", "qrUrl", "rutaId", "tipoPasajero", "vendidoPor", "vendidoPorChoferId") SELECT "asiento", "comprobanteUrl", "createdAt", "descuento", "estado", "id", "metodoPago", "pasajeroId", "precio", "qrUrl", "rutaId", "tipoPasajero", "vendidoPor", "vendidoPorChoferId" FROM "Boleto";
DROP TABLE "Boleto";
ALTER TABLE "new_Boleto" RENAME TO "Boleto";
CREATE TABLE "new_Frecuencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "tipoViaje" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Frecuencia" ("activa", "createdAt", "destino", "hora", "id", "origen", "tipoViaje") SELECT "activa", "createdAt", "destino", "hora", "id", "origen", "tipoViaje" FROM "Frecuencia";
DROP TABLE "Frecuencia";
ALTER TABLE "new_Frecuencia" RENAME TO "Frecuencia";
CREATE TABLE "new_Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Usuario" ("cedula", "createdAt", "email", "id", "nombre", "password", "rol") SELECT "cedula", "createdAt", "email", "id", "nombre", "password", "rol" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX "Usuario_cedula_key" ON "Usuario"("cedula");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
