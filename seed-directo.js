const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcryptjs')
const path = require('path')

// Conectar directamente a la base de datos SQLite
const dbPath = path.join(__dirname, 'dev.db')
const db = new sqlite3.Database(dbPath)

// Función para hashear contraseñas
async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

// Función principal
async function main() {
  console.log("🌱 Sembrando datos de prueba directamente a SQLite...")
  
  // Hashear contraseñas
  const adminPass = await hashPassword('admin123')
  const ofiPass = await hashPassword('ofi123')
  const choferPass = await hashPassword('chofer123')
  const clientePass = await hashPassword('cliente123')
  
  // Insertar usuarios
  db.serialize(() => {
    // Admin
    db.run(`INSERT OR REPLACE INTO Usuario (id, email, password, nombre, cedula, rol, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['1', 'admin@coperativa.com', adminPass, 'Administrador', '9999999999', 'ADMIN', new Date().toISOString()])
    
    // Oficinista
    db.run(`INSERT OR REPLACE INTO Usuario (id, email, password, nombre, cedula, rol, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['2', 'oficinista@coperativa.com', ofiPass, 'Oficinista', '8888888888', 'OFICINISTA', new Date().toISOString()])
    
    // Chofer
    db.run(`INSERT OR REPLACE INTO Usuario (id, email, password, nombre, cedula, rol, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['3', 'chofer@coperativa.com', choferPass, 'Chofer', '7777777777', 'CHOFER', new Date().toISOString()])
    
    // Cliente
    db.run(`INSERT OR REPLACE INTO Usuario (id, email, password, nombre, cedula, rol, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['4', 'cliente@test.com', clientePass, 'Cliente Test', '1234567890', 'CLIENTE', new Date().toISOString()])
    
    console.log("✅ Admin creado: admin@coperativa.com")
    console.log("✅ Oficinista creado: oficinista@coperativa.com")
    console.log("✅ Chofer creado: chofer@coperativa.com")
    console.log("✅ Cliente creado: cliente@test.com")
    console.log("🎉 Seed completado!")
  })
  
  db.close()
}

main().catch(console.error)