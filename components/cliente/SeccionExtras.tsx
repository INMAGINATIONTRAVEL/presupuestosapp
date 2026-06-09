'use client'

import type { PresupuestoExtra } from '@/types'
import { formatPrecio } from '@/lib/utils'

interface Props {
  extras: PresupuestoExtra[]
  seleccionados: Set<string>
  onToggle: (id: string) => void
}

export default function SeccionExtras({ extras, seleccionados, onToggle }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h3 className="font-playfair text-xl font-bold text-[#1C1C2E] mb-1">
          ✨ Añade magia extra
        </h3>
        <p className="text-sm text-gray-500">
          Personaliza tu viaje con estas experiencias únicas
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {extras.map((extra) => {
          const seleccionado = seleccionados.has(extra.id)
          return (
            <button
              key={extra.id}
              onClick={() => onToggle(extra.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 transition-colors text-left ${
                seleccionado ? 'bg-orange-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Imagen o icono */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {extra.extra?.imagen_url ? (
                  <img
                    src={extra.extra.imagen_url}
                    alt={extra.extra.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">✨</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1C1C2E] text-sm">
                  {extra.extra?.nombre}
                </p>
                {extra.extra?.descripcion && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {extra.extra.descripcion}
                  </p>
                )}
                <p className="text-[#F5A623] font-bold text-sm mt-1">
                  {formatPrecio(extra.precio_personalizado)}
                </p>
              </div>

              {/* Toggle */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  seleccionado
                    ? 'bg-[#E8445A] border-[#E8445A]'
                    : 'border-gray-300'
                }`}
              >
                {seleccionado && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {seleccionados.size > 0 && (
        <div className="px-5 py-3 bg-orange-50 border-t border-orange-100">
          <p className="text-sm font-semibold text-[#E8445A]">
            {seleccionados.size} extra{seleccionados.size !== 1 ? 's' : ''} añadido{seleccionados.size !== 1 ? 's' : ''} ✓
          </p>
        </div>
      )}
    </div>
  )
}
