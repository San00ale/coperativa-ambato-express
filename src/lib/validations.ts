/**
 * Valida una cédula ecuatoriana usando el algoritmo módulo 10.
 */
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

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD (zona horaria local).
 */
export function getFechaHoy(): string {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
}

/**
 * Retorna true si la fecha dada (YYYY-MM-DD) es anterior a hoy.
 */
export function esFechaPasada(fecha: string): boolean {
  return fecha < getFechaHoy();
}