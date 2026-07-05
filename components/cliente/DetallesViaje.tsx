import type { PresupuestoCompleto, VueloEstructurado } from '@/types'
import { esCrucero } from '@/lib/utils'

interface Props {
  presupuesto: PresupuestoCompleto
  dias: number
  noches: number
}

export default function DetallesViaje({ presupuesto, dias, noches }: Props) {
  const crucero = esCrucero(presupuesto.hotel)
  const vuelos = presupuesto.detalles_vuelos
  const vueloEstructurado = vuelos && typeof vuelos === 'object' && 'ida' in vuelos
    ? vuelos as VueloEstructurado
    : null
  const vueloTextoLegacy = typeof vuelos === 'string' ? vuelos : null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Imagen hotel */}
      {presupuesto.hotel_imagen_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={presupuesto.hotel_imagen_url}
            alt={presupuesto.hotel}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-[#1C1C2E] flex items-center gap-1">
            {crucero ? '🚢 Crucero' : '🏨 Hotel + Entradas'}
          </div>
        </div>
      )}

      <div className="p-5">
        <h3 className="font-playfair text-xl font-bold text-[#1C1C2E] mb-1">
          {presupuesto.hotel}
        </h3>

        {presupuesto.tipo_habitacion && (
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold">{presupuesto.tipo_habitacion}</span>
            {!crucero && '. Incluye entradas a parques y tasas.'}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-green-50 rounded-xl px-4 py-2 inline-flex items-center gap-2">
            <span className="text-green-600 text-sm font-bold">✓ INCLUIDO EN PRECIO</span>
          </div>
          {!crucero && presupuesto.photopass && (
            <div className="bg-purple-50 rounded-xl px-4 py-2 inline-flex items-center gap-2">
              <span className="text-purple-600 text-sm font-bold">📸 PHOTOPASS INCLUIDO</span>
            </div>
          )}
        </div>

        {/* Distribución habitaciones */}
        {presupuesto.habitaciones?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
              Distribución:
            </p>
            {presupuesto.habitaciones.map((hab) => (
              <div
                key={hab.num}
                className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-[#1C1C2E] mb-2 flex items-center gap-2"
              >
                <span>{crucero ? '🛳️' : '🛏️'}</span>
                <span>
                  {crucero ? 'Camarote' : 'Habitación'} {hab.num}:{' '}
                  <span className="font-semibold">
                    {hab.adultos} adulto{hab.adultos !== 1 ? 's' : ''}
                    {hab.ninos.length > 0 && (
                      <> y {hab.ninos.length} niño{hab.ninos.length !== 1 ? 's' : ''}{' '}
                      {hab.ninos.map((n, i) => (
                        <span key={i}>de {n.edad} año{n.edad !== 1 ? 's' : ''}{i < hab.ninos.length - 1 ? ', ' : ''}</span>
                      ))}</>
                    )}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Plan de comidas */}
        {presupuesto.plan_comidas && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🍽️</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plan de Comidas</p>
                <p className="font-bold text-[#1C1C2E]">{presupuesto.plan_comidas}</p>
                <div className="mt-2">
                  <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full">✓ INCLUIDO</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vuelos estructurados */}
        {presupuesto.incluye_vuelos && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-playfair text-lg font-bold text-[#1C1C2E] mb-3">✈️ Vuelos Incluidos</h4>

            {vueloEstructurado ? (
              <div className="space-y-3">
                {/* Ida */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">Ida</p>
                  <div className="flex items-center gap-3 text-[#1C1C2E]">
                    <div className="text-center">
                      <p className="font-black text-xl">{vueloEstructurado.ida.origen}</p>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-px flex-1 bg-blue-300"></div>
                      <span className="text-blue-400">✈</span>
                      <div className="h-px flex-1 bg-blue-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-xl">{vueloEstructurado.ida.destino}</p>
                    </div>
                  </div>
                  <p className="text-center text-xs text-blue-600 font-semibold mt-2">
                    {new Date(vueloEstructurado.ida.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>

                {/* Vuelta */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">Vuelta</p>
                  <div className="flex items-center gap-3 text-[#1C1C2E]">
                    <div className="text-center">
                      <p className="font-black text-xl">{vueloEstructurado.vuelta.origen}</p>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-px flex-1 bg-blue-300"></div>
                      <span className="text-blue-400">✈</span>
                      <div className="h-px flex-1 bg-blue-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-xl">{vueloEstructurado.vuelta.destino}</p>
                    </div>
                  </div>
                  <p className="text-center text-xs text-blue-600 font-semibold mt-2">
                    {new Date(vueloEstructurado.vuelta.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            ) : vueloTextoLegacy ? (
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-[#1C1C2E]">
                <pre className="whitespace-pre-wrap font-sans">{vueloTextoLegacy}</pre>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
