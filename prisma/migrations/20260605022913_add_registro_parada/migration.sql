-- CreateTable
CREATE TABLE "RegistroParada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rutaId" TEXT NOT NULL,
    "paradaId" TEXT NOT NULL,
    "llegada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroParada_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegistroParada_paradaId_fkey" FOREIGN KEY ("paradaId") REFERENCES "ParadaFrecuencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
