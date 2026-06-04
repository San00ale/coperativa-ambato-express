interface Props {
  capacidad: number
  asientosVIP: number
  asientosVIPNumeros?: string
  asientosOcupados: string[]
  asientoSeleccionado: string | null
  onAsientoClick: (asiento: string) => void
  precioBase?: number
  onPrecioChange?: (precio: number) => void
}

export default function AsientosGrid({
  capacidad,
  asientosVIP,
  asientosVIPNumeros,
  asientosOcupados,
  asientoSeleccionado,
  onAsientoClick,
  precioBase = 0,
  onPrecioChange
}: Props) {
  const columnas = 5
  const asientosNormales = Math.max(capacidad - asientosVIP, 0)

  const esVIP = (numeroAsiento: number): boolean => {
    if (asientosVIPNumeros) {
      const vipNumeros = asientosVIPNumeros
        .split(',')
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !Number.isNaN(n))
      return vipNumeros.includes(numeroAsiento)
    }

    return numeroAsiento > asientosNormales
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-100">FRENTE DEL BUS</h3>

      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-4 shadow-inner">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: capacidad }).map((_, i) => {
            const numeroAsiento = i + 1
            const esOcupado = asientosOcupados.includes(numeroAsiento.toString())
            const esSeleccionado = asientoSeleccionado === numeroAsiento.toString()
            const esVIPAsiento = esVIP(numeroAsiento)
            const posicionColumna = ((numeroAsiento - 1) % 4) < 2
              ? ((numeroAsiento - 1) % 4)
              : (((numeroAsiento - 1) % 4) + 1)

            return (
              <button
                key={numeroAsiento}
                type="button"
                onClick={() => !esOcupado && onAsientoClick(numeroAsiento.toString())}
                disabled={esOcupado}
                style={{ gridColumn: `${posicionColumna + 1}` }}
                className={`relative flex h-14 items-center justify-center rounded-xl border text-sm font-semibold shadow-sm transition ${
                  esOcupado
                    ? 'cursor-not-allowed border-red-500 bg-red-600 text-white'
                    : esSeleccionado
                      ? 'border-blue-400 bg-blue-600 text-white shadow-blue-900/50'
                      : esVIPAsiento
                        ? 'border-amber-400 bg-amber-500/90 text-gray-950 hover:bg-amber-400'
                        : 'border-emerald-400 bg-emerald-500 text-white hover:bg-emerald-400'
                }`}
              >
                {numeroAsiento}
                {esVIPAsiento && <span className="absolute right-1 top-1 text-[10px]">⭐</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 flex-wrap text-sm text-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <span>VIP</span>
        </div>
      </div>
    </div>
  )
}