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
              <span className="text-purple-600 text-sm font-bold">📸 PHOTOPASS DE REGALO</span>
            </div>
          )}
          {presupuesto.incluye_traslados && (
            <div className="bg-green-50 rounded-xl px-4 py-2 inline-flex items-center gap-2">
              <span className="text-green-600 text-sm font-bold">🚌 TRASLADOS INCLUIDOS</span>
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

        {/* Hoteles adicionales */}
        {presupuesto.hoteles_adicionales && presupuesto.hoteles_adicionales.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">También incluye alojamiento en:</p>
            {presupuesto.hoteles_adicionales.map((h: any, i: number) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
                {h.imagen_url && (
                  <img src={h.imagen_url} alt={h.nombre} className="w-full h-32 object-cover" />
                )}
                <div className="px-4 py-3 bg-gray-50">
                  <p className="font-bold text-[#1C1C2E]">{h.nombre}</p>
                  {h.tipo_habitacion && <p className="text-sm text-gray-500">{h.tipo_habitacion}</p>}
                  {h.plan_comidas && <p className="text-xs text-gray-500 mt-0.5">🍽️ {h.plan_comidas}</p>}
                  {h.observaciones && <p className="text-xs text-gray-400 italic mt-1">{h.observaciones}</p>}
                  {(h.fecha_inicio || h.fecha_fin) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {h.fecha_inicio && new Date(h.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                      {h.fecha_inicio && h.fecha_fin && ' → '}
                      {h.fecha_fin && new Date(h.fecha_fin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Extras personalizados */}
        {presupuesto.extras_personalizados && presupuesto.extras_personalizados.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Extras del viaje:</p>
            <div className="space-y-3">
              {presupuesto.extras_personalizados.map((e: any, i: number) => (
                <div key={i} className="rounded-xl overflow-hidden border border-orange-100 bg-orange-50">
                  {e.imagen_url && (
                    <img src={e.imagen_url} alt={e.nombre} className="w-full h-40 object-cover" />
                  )}
                  <div className="px-4 py-3">
                    <p className="font-bold text-[#1C1C2E]">{e.nombre}</p>
                    {e.descripcion && <p className="text-sm text-gray-500 mt-0.5">{e.descripcion}</p>}
                    {e.precio !== 0 && (
                      <p className={`text-sm font-bold mt-1 ${e.precio < 0 ? 'text-green-600' : 'text-[#F5A623]'}`}>
                        {e.precio > 0 ? '+' : ''}{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(e.precio)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desayuno opcional */}
        {presupuesto.desayuno_opcional && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{presupuesto.desayuno_opcional.tipo === 'parque' ? '🌅' : '🏨'}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Desayuno Opcional</p>
                <p className="font-bold text-[#1C1C2E]">
                  {presupuesto.desayuno_opcional.tipo === 'parque' ? 'Desayuno en el parque' : 'Desayuno en el hotel'}
                </p>
                {presupuesto.desayuno_opcional.precio != null ? (
                  <p className="text-sm font-bold text-[#F5A623] mt-1">
                    +{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(presupuesto.desayuno_opcional.precio)} / persona
                  </p>
                ) : (
                  <div className="mt-2">
                    <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full">✓ INCLUIDO</span>
                  </div>
                )}
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
                      <p className="font-black text-xl">{vueloEstructurado.ida.origen?.toUpperCase()}</p>
                      {vueloEstructurado.ida.hora && (
                        <p className="text-xs font-bold text-blue-700 mt-0.5">Sal. {vueloEstructurado.ida.hora}</p>
                      )}
                      {(vueloEstructurado.ida as any).hora_llegada && (
                        <p className="text-xs text-blue-500 mt-0.5">Ll. {(vueloEstructurado.ida as any).hora_llegada}</p>
                      )}
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-px flex-1 bg-blue-300"></div>
                      <span className="text-blue-400">✈</span>
                      <div className="h-px flex-1 bg-blue-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-xl">{vueloEstructurado.ida.destino?.toUpperCase()}</p>
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
                      <p className="font-black text-xl">{vueloEstructurado.vuelta.origen?.toUpperCase()}</p>
                      {vueloEstructurado.vuelta.hora && (
                        <p className="text-xs font-bold text-blue-700 mt-0.5">Sal. {vueloEstructurado.vuelta.hora}</p>
                      )}
                      {(vueloEstructurado.vuelta as any).hora_llegada && (
                        <p className="text-xs text-blue-500 mt-0.5">Ll. {(vueloEstructurado.vuelta as any).hora_llegada}</p>
                      )}
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-px flex-1 bg-blue-300"></div>
                      <span className="text-blue-400">✈</span>
                      <div className="h-px flex-1 bg-blue-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-xl">{vueloEstructurado.vuelta.destino?.toUpperCase()}</p>
                    </div>
                  </div>
                  <p className="text-center text-xs text-blue-600 font-semibold mt-2">
                    {new Date(vueloEstructurado.vuelta.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>

                {/* Vuelos adicionales */}
                {vueloEstructurado.vuelos_adicionales?.map((v, i) => (
                  <div key={i} className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">{v.label || `Tramo ${i + 3}`}</p>
                    <div className="flex items-center gap-3 text-[#1C1C2E]">
                      <div className="text-center">
                        <p className="font-black text-xl">{v.origen?.toUpperCase()}</p>
                        {v.hora && <p className="text-xs font-bold text-blue-700 mt-0.5">Sal. {v.hora}</p>}
                        {v.hora_llegada && <p className="text-xs text-blue-500 mt-0.5">Ll. {v.hora_llegada}</p>}
                      </div>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="h-px flex-1 bg-blue-300"></div>
                        <span className="text-blue-400">✈</span>
                        <div className="h-px flex-1 bg-blue-300"></div>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-xl">{v.destino?.toUpperCase()}</p>
                      </div>
                    </div>
                    {v.fecha && (
                      <p className="text-center text-xs text-blue-600 font-semibold mt-2">
                        {new Date(v.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    )}
                  </div>
                ))}

                {/* Equipaje */}
                {(vueloEstructurado?.incluye_mochila || vueloEstructurado?.incluye_maleta_cabina) && (
                  <div className="flex gap-2 flex-wrap">
                    {vueloEstructurado.incluye_mochila && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">🎒 Mochila incluida</span>
                    )}
                    {vueloEstructurado.incluye_maleta_cabina && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">🧳 Maleta de cabina incluida</span>
                    )}
                  </div>
                )}

                {/* Observaciones */}
                {vueloEstructurado.observaciones && (
                  <p className="text-xs text-gray-500 italic bg-gray-50 rounded-xl px-4 py-2">{vueloEstructurado.observaciones}</p>
                )}
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
