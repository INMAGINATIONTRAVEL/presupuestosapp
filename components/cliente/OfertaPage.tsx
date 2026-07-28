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
  variantes?: { id: string; variante: string; hotel: string; precio_total: number }[]
}

export default function OfertaPage({ presupuesto: presupuestoInicial, variantes = [] }: Props) {
  const [presupuesto, setPresupuesto] = useState(presupuestoInicial)
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<Set<string>>(new Set())
  const [mostrarReserva, setMostrarReserva] = useState(false)
  const [notasCambio, setNotasCambio] = useState('')

  const noches = calcularNoches(presupuesto.fecha_inicio, presupuesto.fecha_fin)
  const dias = calcularDias(presupuesto.fecha_inicio, presupuesto.fecha_fin)

  const extrasElegidos = presupuesto.extras.filter(e => extrasSeleccionados.has(e.id))
  const totalExtras = extrasElegidos.reduce((acc, e) => acc + e.precio_personalizado, 0)
  const totalFinal = presupuesto.precio_total + totalExtras

  const totalSegurosSeleccionados = extrasElegidos
    .filter(e => e.extra?.es_seguro)
    .reduce((acc, e) => acc + e.precio_personalizado, 0)
  const senalTotal = presupuesto.precio_senal + totalSegurosSeleccionados

  function toggleExtra(extraId: string) {
    setExtrasSeleccionados(prev => {
      const next = new Set(prev)
      if (next.has(extraId)) next.delete(extraId)
      else next.add(extraId)
      return next
    })
  }

  async function cambiarVariante(varianteId: string) {
    if (varianteId === presupuesto.id) return
    const res = await fetch(`/api/variante-datos?id=${varianteId}`)
    if (!res.ok) return
    const data = await res.json()
    setPresupuesto(data)
    setExtrasSeleccionados(new Set())
  }

  if (mostrarReserva) {
    return (
      <SeccionReserva
        presupuesto={presupuesto}
        extrasSeleccionados={extrasSeleccionados}
        totalFinal={totalFinal}
        senalTotal={senalTotal}
        onVolver={() => setMostrarReserva(false)}
      />
    )
  }

  const todasVariantes = variantes.length > 0 ? variantes : []

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <HeroOferta
        nombre={presupuesto.cliente_nombre}
        numero={presupuesto.numero}
        destino={presupuesto.destino}
      />

      <BarraPrecio
        total={totalFinal}
        senal={senalTotal}
        onReservar={() => setMostrarReserva(true)}
      />

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Pestañas variantes A / B / C */}
        {todasVariantes.length > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
              Tienes {todasVariantes.length} opciones disponibles
            </p>
            <div className="flex gap-2">
              {todasVariantes.map(v => (
                <button
                  key={v.id}
                  onClick={() => cambiarVariante(v.id)}
                  className={`flex-1 rounded-xl py-3 px-2 text-center transition-colors border-2 ${
                    v.id === presupuesto.id
                      ? 'bg-[#1C1C2E] border-[#1C1C2E] text-white'
                      : 'border-gray-200 text-gray-600 hover:border-[#E8445A] hover:text-[#E8445A]'
                  }`}
                >
                  <p className="font-black text-lg">Opción {v.variante}</p>
                  <p className="text-xs opacity-70 leading-tight">{v.hotel}</p>
                  <p className={`text-sm font-bold mt-0.5 ${v.id === presupuesto.id ? 'text-[#F5A623]' : 'text-[#E8445A]'}`}>
                    {formatPrecio(v.precio_total)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resumen oferta */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✨</span>
            <h2 className="font-playfair text-xl font-bold text-[#1C1C2E]">
              Oferta N.º {presupuesto.numero}{todasVariantes.length > 1 ? ` · Opción ${presupuesto.variante}` : ''}
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-3">
            <span>📅</span>
            <span className="text-sm font-medium text-gray-600">
              PRESUPUESTADO: {new Date(presupuesto.created_at).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric'
              }).replace(/\//g, '-')}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-3 mb-3">
            <span>🗓️</span>
            <span className="text-sm font-bold text-[#1C1C2E]">
              {formatFecha(presupuesto.fecha_inicio)} — {formatFecha(presupuesto.fecha_fin)}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-4 py-3 mb-3">
            <span>🏨</span>
            <span className="text-sm font-bold text-[#C2185B] uppercase">{presupuesto.hotel}</span>
          </div>

          <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-3">
            <span>⏱️</span>
            <span className="text-sm font-bold text-green-700 uppercase">
              {dias} días / {noches} noches
            </span>
          </div>
        </div>

        <DetallesViaje presupuesto={presupuesto} dias={dias} noches={noches} />

        {presupuesto.descripcion_oferta && (
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <h3 className="font-bold text-[#1C1C2E] mb-3 uppercase text-sm tracking-wide">El viaje incluye</h3>
            <p className="text-[#1C1C2E] font-semibold text-sm leading-relaxed whitespace-pre-line">
              {presupuesto.descripcion_oferta}
            </p>
          </div>
        )}

        {/* Observaciones para el cliente */}
        {presupuesto.observaciones && (
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <h3 className="font-bold text-amber-800 mb-3 uppercase text-sm tracking-wide">📌 Observaciones</h3>
            <p className="text-amber-900 text-sm leading-relaxed whitespace-pre-line">
              {presupuesto.observaciones}
            </p>
          </div>
        )}

        {presupuesto.extras.length > 0 && (
          <SeccionExtras
            extras={presupuesto.extras}
            seleccionados={extrasSeleccionados}
            onToggle={toggleExtra}
          />
        )}

        {/* ¿Deseas cambios? */}
        <div className="bg-[#1C1C2E] rounded-2xl p-5">
          <h3 className="font-playfair text-lg font-bold text-white mb-2">¿Deseas realizar cambios?</h3>
          <p className="text-gray-400 text-sm mb-4">
            Si quieres añadir alguna opción mágica, cambiar fechas o el hotel, escríbenos aquí:
          </p>
          <textarea
            value={notasCambio}
            onChange={e => setNotasCambio(e.target.value)}
            placeholder="Ej: Me gustaría añadir el desayuno con princesas..."
            rows={3}
            className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none border border-gray-700 focus:border-[#E8445A] transition-colors"
          />
          <button
            onClick={() => {
              const msg = encodeURIComponent(
                `Hola! Te escribo sobre mi presupuesto #${presupuesto.numero} (${presupuesto.cliente_nombre}).\n\n${notasCambio}`
              )
              window.open(`https://wa.me/34${process.env.NEXT_PUBLIC_WHATSAPP_AGENCIA}?text=${msg}`, '_blank')
            }}
            className="mt-3 w-full border border-white text-white font-bold py-3 rounded-xl uppercase tracking-wide text-sm hover:bg-white hover:text-[#1C1C2E] transition-colors"
          >
            💬 Enviar solicitud por WhatsApp
          </button>
        </div>

        {/* Precio total */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Valor total</p>
          <p className="font-playfair text-4xl font-bold text-[#E8445A]">{formatPrecio(totalFinal)}</p>
          <p className="text-xs text-gray-400 mt-1">Impuestos y tasas incluidos</p>
        </div>

        {/* Pago flexible */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <span>💳</span>
            <span className="font-bold text-[#1C1C2E] text-sm uppercase tracking-wide">Pago Flexible</span>
          </div>
          <p className="text-sm text-[#1C1C2E]">
            Reserva hoy con solo{' '}
            <span className="font-bold text-[#E8445A]">{formatPrecio(presupuesto.precio_senal)}</span>.
            El resto, págalo a tu ritmo hasta 30 días antes de viajar.
          </p>
        </div>

        <button
          onClick={() => setMostrarReserva(true)}
          className="w-full bg-[#E8445A] hover:bg-[#C2185B] text-white font-bold py-5 rounded-2xl uppercase tracking-widest text-base transition-colors shadow-lg"
        >
          Continuar reserva →
        </button>
        <p className="text-center text-xs text-gray-500 -mt-2">
          En el siguiente paso solo te pediremos los <b>datos de los viajeros</b>.
        </p>

        <div className="text-center space-y-3 pb-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest">¿Tienes alguna duda?</p>
          <a
            href={`https://wa.me/34${process.env.NEXT_PUBLIC_WHATSAPP_AGENCIA || '635593582'}?text=Hola%2C%20tengo%20una%20duda%20sobre%20mi%20presupuesto`}
            className="flex items-center justify-center gap-2 w-full text-white font-bold py-4 rounded-2xl transition-colors"
            style={{ background: '#25D366' }}
          >
            <span>💬</span> Escríbenos por WhatsApp
          </a>
          <p className="text-xs text-gray-400">O llámanos</p>
          <a href={`tel:34${process.env.NEXT_PUBLIC_WHATSAPP_AGENCIA || '635593582'}`} className="font-bold text-[#1C1C2E]">
            {process.env.NEXT_PUBLIC_WHATSAPP_AGENCIA || '635593582'}
          </a>
        </div>

        <div className="text-center pb-8">
          <p className="text-xs text-gray-400 italic">"Viajar es invertir en recuerdos"</p>
          <p className="text-xs text-gray-300 mt-1">Inmagination Travel</p>
        </div>
      </div>
    </div>
  )
}
