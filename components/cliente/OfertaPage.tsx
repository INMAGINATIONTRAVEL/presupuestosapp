'use client'

import { useState } from 'react'
import type { PresupuestoCompleto } from '@/types'
import { formatPrecio, formatFecha, calcularNoches, calcularDias } from '@/lib/utils'
import BarraPrecio from './BarraPrecio'
import HeroOferta from './HeroOferta'
import DetallesViaje from './DetallesViaje'
import SeccionExtras from './SeccionExtras'
import SeccionReserva from './SeccionReserva'

interface Props {
  presupuesto: PresupuestoCompleto
}

export default function OfertaPage({ presupuesto }: Props) {
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<Set<string>>(new Set())
  const [mostrarReserva, setMostrarReserva] = useState(false)

  const noches = calcularNoches(presupuesto.fecha_inicio, presupuesto.fecha_fin)
  const dias = calcularDias(presupuesto.fecha_inicio, presupuesto.fecha_fin)

  // Calcular total con extras seleccionados
  const totalExtras = presupuesto.extras
    .filter(e => extrasSeleccionados.has(e.id))
    .reduce((acc, e) => acc + e.precio_personalizado, 0)

  const totalFinal = presupuesto.precio_total + totalExtras

  function toggleExtra(extraId: string) {
    setExtrasSeleccionados(prev => {
      const next = new Set(prev)
      if (next.has(extraId)) {
        next.delete(extraId)
      } else {
        next.add(extraId)
      }
      return next
    })
  }

  if (mostrarReserva) {
    return (
      <SeccionReserva
        presupuesto={presupuesto}
        extrasSeleccionados={extrasSeleccionados}
        totalFinal={totalFinal}
        onVolver={() => setMostrarReserva(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero */}
      <HeroOferta
        nombre={presupuesto.cliente_nombre}
        numero={presupuesto.numero}
        destino={presupuesto.destino}
      />

      {/* Barra de precio sticky */}
      <BarraPrecio
        total={totalFinal}
        senal={presupuesto.precio_senal}
        onReservar={() => setMostrarReserva(true)}
      />

      {/* Contenido principal */}
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Número de oferta */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✨</span>
            <h2 className="font-playfair text-xl font-bold text-[#1C1C2E]">
              Oferta N.º {presupuesto.numero}
            </h2>
          </div>

          {/* Fecha presupuesto */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-3">
            <span>📅</span>
            <span className="text-sm font-medium text-gray-600">
              PRESUPUESTADO: {new Date(presupuesto.created_at).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric'
              }).replace(/\//g, '-')}
            </span>
          </div>

          {/* Fechas del viaje */}
          <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-3 mb-3">
            <span>🗓️</span>
            <span className="text-sm font-bold text-[#1C1C2E]">
              {formatFecha(presupuesto.fecha_inicio)} — {formatFecha(presupuesto.fecha_fin)}
            </span>
          </div>

          {/* Hotel y duración */}
          <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-4 py-3 mb-3">
            <span>🏨</span>
            <span className="text-sm font-bold text-[#C2185B] uppercase">
              {presupuesto.hotel}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-3">
            <span>⏱️</span>
            <span className="text-sm font-bold text-green-700 uppercase">
              {dias} días / {noches} noches
            </span>
          </div>
        </div>

        {/* Detalles del viaje */}
        <DetallesViaje presupuesto={presupuesto} dias={dias} noches={noches} />

        {/* Oferta especial / descripción */}
        {presupuesto.descripcion_oferta && (
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <h3 className="font-bold text-[#1C1C2E] mb-3 uppercase text-sm tracking-wide">
              El viaje incluye
            </h3>
            <p className="text-[#1C1C2E] font-semibold text-sm leading-relaxed whitespace-pre-line">
              {presupuesto.descripcion_oferta}
            </p>
          </div>
        )}

        {/* Extras seleccionables */}
        {presupuesto.extras.length > 0 && (
          <SeccionExtras
            extras={presupuesto.extras}
            seleccionados={extrasSeleccionados}
            onToggle={toggleExtra}
          />
        )}

        {/* Sección ¿Deseas cambios? */}
        <div className="bg-[#1C1C2E] rounded-2xl p-5">
          <h3 className="font-playfair text-lg font-bold text-white mb-2">
            ¿Deseas realizar cambios?
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Si quieres añadir alguna opción mágica, cambiar fechas o el hotel, escríbenos aquí:
          </p>
          <textarea
            id="notas-cambios"
            placeholder="Ej: Me gustaría añadir el desayuno con princesas..."
            rows={3}
            className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none border border-gray-700 focus:border-[#E8445A] transition-colors"
          />
          <button className="mt-3 w-full border border-white text-white font-bold py-3 rounded-xl uppercase tracking-wide text-sm hover:bg-white hover:text-[#1C1C2E] transition-colors">
            Enviar solicitud
          </button>
        </div>

        {/* Resumen precio */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Valor total</p>
          <p className="font-playfair text-4xl font-bold text-[#E8445A]">
            {formatPrecio(totalFinal)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Impuestos y tasas incluidos</p>
        </div>

        {/* Pago flexible */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <span>💳</span>
            <span className="font-bold text-[#1C1C2E] text-sm uppercase tracking-wide">
              Pago Flexible
            </span>
          </div>
          <p className="text-sm text-[#1C1C2E]">
            Reserva hoy con solo{' '}
            <span className="font-bold text-[#E8445A]">{formatPrecio(presupuesto.precio_senal)}</span>.
            El resto, págalo a tu ritmo y con la frecuencia que tú quieras,
            cómodamente hasta 30 días antes de viajar.
          </p>
        </div>

        {/* Botón principal */}
        <button
          onClick={() => setMostrarReserva(true)}
          className="w-full bg-[#E8445A] hover:bg-[#C2185B] text-white font-bold py-5 rounded-2xl uppercase tracking-widest text-base transition-colors shadow-lg"
        >
          Continuar reserva →
        </button>
        <p className="text-center text-xs text-gray-500 -mt-2">
          En el siguiente paso solo te pediremos los <b>datos de los viajeros</b> para formalizar tu presupuesto.
        </p>

        {/* Contacto */}
        <div className="text-center space-y-3 pb-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest">¿Tienes alguna duda?</p>
          <a
            href="https://wa.me/34000000000"
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-colors"
          >
            <span>💬</span> Escríbenos por WhatsApp
          </a>
          <p className="text-xs text-gray-400">O llámanos</p>
          <a href="tel:34000000000" className="font-bold text-[#1C1C2E]">
            000 000 000
          </a>
        </div>

      </div>
    </div>
  )
}
