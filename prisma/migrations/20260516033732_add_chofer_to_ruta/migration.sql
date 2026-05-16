-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ruta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frecuenciaId" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "busId" TEXT NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "precio" REAL,
    "choferId" TEXT,
    CONSTRAINT "Ruta_frecuenciaId_fkey" FOREIGN KEY ("frecuenciaId") REFERENCES "Frecuencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ruta_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ruta_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ruta" ("busId", "completada", "fecha", "frecuenciaId", "id", "precio") SELECT "busId", "completada", "fecha", "frecuenciaId", "id", "precio" FROM "Ruta";
DROP TABLE "Ruta";
ALTER TABLE "new_Ruta" RENAME TO "Ruta";
CREATE INDEX "Ruta_choferId_idx" ON "Ruta"("choferId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
