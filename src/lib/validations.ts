/**
 * Funciones de validación reutilizables en toda la aplicación.
 */

// ----- VALIDACIÓN DE CÉDULA ECUATORIANA (versión completa) -----
export function validarCedulaEcuatoriana(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito >= 6) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = parseInt(cedula[9], 10);
  const residuo = suma % 10;
  const calculado = residuo === 0 ? 0 : 10 - residuo;

  return calculado === digitoVerificador;
}

// ----- UTILIDADES DE FECHA -----
export function getFechaHoy(): string {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
}

export function esFechaPasada(fecha: string): boolean {
  return fecha < getFechaHoy();
}

export function validarFechaNoEsPasada(fechaString: string): boolean {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSeleccionada = new Date(fechaString + 'T00:00:00');
  fechaSeleccionada.setHours(0, 0, 0, 0);
  return fechaSeleccionada >= hoy;
}

// ----- OTRAS VALIDACIONES -----
export function validarNombre(nombre: string): boolean {
  return nombre.trim().length >= 3;
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarTelefonoEcuatoriano(telefono: string): boolean {
  return /^\d{9}$/.test(telefono);
}

export function validarArchivoImagen(archivo: File): boolean {
  const tiposValidos = ['image/jpeg', 'image/png', 'image/webp'];
  return tiposValidos.includes(archivo.type) && archivo.size <= 5 * 1024 * 1024;
}

// ----- OBTENER MENSAJES DE ERROR -----
export function obtenerErrorCedula(cedula: string): string {
  if (!cedula) return 'La cédula es requerida';
  if (!/^\d*$/.test(cedula)) return 'La cédula solo debe contener números';
  if (cedula.length !== 10) return `La cédula debe tener 10 dígitos (${cedula.length} ingresados)`;
  return validarCedulaEcuatoriana(cedula) ? '' : 'Cédula inválida';
}

export function obtenerErrorNombre(nombre: string): string {
  if (!nombre.trim()) return 'El nombre es requerido';
  return nombre.trim().length < 3 ? 'El nombre debe tener mínimo 3 caracteres' : '';
}

export function obtenerErrorFecha(fecha: string): string {
  if (!fecha) return 'La fecha es requerida';
  return validarFechaNoEsPasada(fecha) ? '' : 'No se pueden buscar rutas en fechas pasadas';
}

// ----- VALIDACIÓN DE EMAIL CORPORATIVO -----
export function validarEmailCoperativa(email: string): boolean {
  return /^[^\s@]+@coperativa\.com$/.test(email);
}

export function obtenerErrorEmailCoperativa(email: string): string {
  if (!email) return 'El email es requerido';
  if (!validarEmail(email)) return 'Email inválido';
  if (!validarEmailCoperativa(email)) return 'El email debe ser del dominio @coperativa.com';
  return '';
}

// ----- VALIDACIÓN DE CONTRASEÑA -----
export function validarContrasena(password: string): boolean {
  return password.length >= 6;
}

export function obtenerErrorContrasena(password: string): string {
  if (!password) return 'La contraseña es requerida';
  if (!validarContrasena(password)) return 'La contraseña debe tener al menos 6 caracteres';
  return '';
}

export function validarConfirmacionContrasena(password: string, confirmacion: string): boolean {
  return password === confirmacion && password.length >= 6;
}

export function obtenerErrorConfirmacionContrasena(password: string, confirmacion: string): string {
  if (!confirmacion) return 'Debe confirmar la contraseña';
  if (password !== confirmacion) return 'Las contraseñas no coinciden';
  if (!validarContrasena(confirmacion)) return 'La contraseña debe tener al menos 6 caracteres';
  return '';
}