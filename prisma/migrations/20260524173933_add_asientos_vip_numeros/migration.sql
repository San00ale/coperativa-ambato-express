-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "chasis" TEXT NOT NULL,
    "carroceria" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "capacidad" INTEGER NOT NULL,
    "asientosVIP" INTEGER NOT NULL DEFAULT 0,
    "asientosVIPNumeros" TEXT NOT NULL DEFAULT '',
    "activo" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Bus" ("activo", "asientosVIP", "capacidad", "carroceria", "chasis", "fotoUrl", "id", "marca", "numero", "placa") SELECT "activo", "asientosVIP", "capacidad", "carroceria", "chasis", "fotoUrl", "id", "marca", "numero", "placa" FROM "Bus";
DROP TABLE "Bus";
ALTER TABLE "new_Bus" RENAME TO "Bus";
CREATE UNIQUE INDEX "Bus_numero_key" ON "Bus"("numero");
CREATE UNIQUE INDEX "Bus_placa_key" ON "Bus"("placa");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
