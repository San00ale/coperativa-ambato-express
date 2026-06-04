/**
 * Funciones de validación reutilizables en toda la aplicación.
 */

export function validarCedulaEcuatoriana(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0

  for (let i = 0; i < 9; i++) {
    let digito = parseInt(cedula[i], 10) * coeficientes[i]
    if (digito >= 10) digito -= 9
    suma += digito
  }

  const digitoVerificador = (10 - (suma % 10)) % 10
  return parseInt(cedula[9], 10) === digitoVerificador
}

export function validarNombre(nombre: string): boolean {
  return nombre.trim().length >= 3
}

export function validarFechaNoEsPasada(fechaString: string): boolean {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fechaSeleccionada = new Date(fechaString + 'T00:00:00')
  fechaSeleccionada.setHours(0, 0, 0, 0)
  return fechaSeleccionada >= hoy
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validarTelefonoEcuatoriano(telefono: string): boolean {
  return /^\d{9}$/.test(telefono)
}

export function validarArchivoImagen(archivo: File): boolean {
  const tiposValidos = ['image/jpeg', 'image/png', 'image/webp']
  return tiposValidos.includes(archivo.type) && archivo.size <= 5 * 1024 * 1024
}

export function obtenerErrorCedula(cedula: string): string {
  if (!cedula) return 'La cédula es requerida'
  if (!/^\d*$/.test(cedula)) return 'La cédula solo debe contener números'
  if (cedula.length !== 10) return `La cédula debe tener 10 dígitos (${cedula.length} ingresados)`
  return validarCedulaEcuatoriana(cedula) ? '' : 'Cédula inválida'
}

export function obtenerErrorNombre(nombre: string): string {
  if (!nombre.trim()) return 'El nombre es requerido'
  return nombre.trim().length < 3 ? 'El nombre debe tener mínimo 3 caracteres' : ''
}

export function obtenerErrorFecha(fecha: string): string {
  if (!fecha) return 'La fecha es requerida'
  return validarFechaNoEsPasada(fecha) ? '' : 'No se pueden buscar rutas en fechas pasadas'
}
