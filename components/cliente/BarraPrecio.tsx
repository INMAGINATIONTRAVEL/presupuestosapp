'use client'

import { formatPrecio } from '@/lib/utils'

interface Props {
  total: number
  senal: number
  onReservar: () => void
}

export default function BarraPrecio({ total, senal, onReservar }: Props) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider leading-none mb-0.5">Total</p>
          <p className="font-playfair text-xl font-bold text-[#E8445A] leading-none">
            {formatPrecio(total)}
          </p>
          <p className="text-xs text-[#F5A623] font-semibold">
            Reserva hoy por solo {formatPrecio(senal)}
          </p>
        </div>
        <button
          onClick={onReservar}
          className="bg-[#E8445A] hover:bg-[#C2185B] text-white font-bold px-6 py-3 rounded-2xl uppercase tracking-wider text-sm transition-colors whitespace-nowrap shadow-md"
        >
          Reservar
        </button>
      </div>
    </div>
  )
}
