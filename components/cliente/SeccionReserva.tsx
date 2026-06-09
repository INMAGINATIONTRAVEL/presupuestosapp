'use client'

import { useState } from 'react'
import type { PresupuestoCompleto, Viajero } from '@/types'
import { formatPrecio } from '@/lib/utils'

interface Props {
  presupuesto: PresupuestoCompleto
  extrasSeleccionados: Set<string>
  totalFinal: number
  onVolver: () => void
}

export default function SeccionReserva({ presupuesto, extrasSeleccionados, totalFinal, onVolver }: Props) {
  const [paso, setPaso] = useState<'contacto' | 'viajeros' | 'resumen'>('contacto')
  const [telefono, setTelefono] = useState(presupuesto.cliente_telefono || '')
  const [notasCliente, setNotasCliente] = useState('')
  const [pagoFlexible, setPagoFlexible] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [confirmado, setConfirmado] = useState(false)

  // Generar viajeros vacíos a partir de habitaciones
  const [viajeros, setViajeros] = useState<Viajero[]>(() => {
    const lista: Viajero[] = []
    presupuesto.habitaciones.forEach((hab) => {
      for (let i = 0; i < hab.adultos; i++) {
        lista.push({ habitacion_numero: hab.num, tipo: 'adulto', nombre: '', apellidos: '', dni_pasaporte: '' })
      }
      hab.ninos.forEach((nino) => {
        lista.push({ habitacion_numero: hab.num, tipo: 'nino', nombre: '', apellidos: '', dni_pasaporte: '', edad: nino.edad })
      })
    })
    return lista
  })

  function actualizarViajero(index: number, campo: keyof Viajero, valor: string) {
    setViajeros(prev => prev.map((v, i) => i === index ? { ...v, [campo]: valor } : v))
  }

  async function confirmar() {
    setEnviando(true)
    try {
      const res = await fetch('/api/confirmar-reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presupuesto_id: presupuesto.id,
          token: presupuesto.token,
          viajeros,
          extras_seleccionados: Array.from(extrasSeleccionados),
          pago_flexible: pagoFlexible,
          notas_cliente: notasCliente,
          telefono_reserva: telefono,
        }),
      })
      if (res.ok) setConfirmado(true)
    } catch (e) {
      alert('Error al enviar. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (confirmado) {
    return (
      <div className="min-h-screen bg-[#1C1C2E] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="font-playfair text-3xl font-bold text-white mb-3">
            ¡Reserva recibida!
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Tu agente de Inmagination Travel te contactará en breve para gestionar el pago y confirmar todos los detalles.
          </p>
          <div className="bg-white/10 rounded-2xl p-4 text-left">
            <p className="text-[#F5A623] font-bold text-sm mb-1">Reserva segura</p>
            <p className="text-white/60 text-xs">
              No se realizará ningún cargo automático. Tu agente se encargará de todo.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={onVolver} className="text-gray-500 hover:text-gray-700">
          ←
        </button>
        <div>
          <p className="font-bold text-[#1C1C2E] text-sm">Finalizar Reserva</p>
          <p className="text-xs text-gray-500">
            {presupuesto.destino} · {presupuesto.cliente_nombre}
          </p>
        </div>
      </div>

      {/* Banner agencia */}
      <div className="bg-gradient-to-r from-[#C2185B] to-[#E8445A] mx-4 mt-4 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-lg">✨</span>
        </div>
        <div>
          <p className="font-bold text-white text-sm">Inmagination Travel</p>
          <p className="text-white/80 text-xs leading-relaxed mt-1">
            Una vez recibidos tus datos, te asignaremos un{' '}
            <b>agente especializado</b>. Él se encargará de coordinar cada detalle:
            traslados, vuelos, estancia, pensiones y entradas.
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-5">

        {/* Paso 1: Contacto */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-playfair text-lg font-bold text-[#1C1C2E] mb-4">
            Datos de Contacto
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Nombre Titular</label>
              <div className="mt-1 px-4 py-3 bg-gray-50 rounded-xl text-[#1C1C2E] font-semibold">
                {presupuesto.cliente_nombre}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email</label>
              <div className="mt-1 px-4 py-3 bg-gray-50 rounded-xl text-[#1C1C2E] font-semibold">
                {presupuesto.cliente_email}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Teléfono móvil</label>
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="Teléfono para la reserva"
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-[#1C1C2E] focus:border-[#E8445A] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Paso 2: Viajeros */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair text-lg font-bold text-[#1C1C2E]">
              👥 Datos de los Viajeros
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
              Según DNI/Pasaporte
            </span>
          </div>

          {presupuesto.habitaciones.map((hab) => {
            const viajerosHab = viajeros.filter(v => v.habitacion_numero === hab.num)
            const adultosHab = viajerosHab.filter(v => v.tipo === 'adulto')
            const ninosHab = viajerosHab.filter(v => v.tipo === 'nino')

            return (
              <div key={hab.num} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-[#E8445A] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{hab.num}</span>
                  </div>
                  <p className="font-semibold text-[#1C1C2E] text-sm">
                    Habitación {hab.num}
                  </p>
                </div>

                {adultosHab.map((viajero, relIdx) => {
                  const idx = viajeros.indexOf(viajero)
                  return (
                    <div key={idx} className="mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Adulto {relIdx + 1}
                      </p>
                      <div className="space-y-2">
                        <input
                          placeholder="Nombre"
                          value={viajero.nombre}
                          onChange={e => actualizarViajero(idx, 'nombre', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#E8445A] transition-colors"
                        />
                        <input
                          placeholder="Apellidos"
                          value={viajero.apellidos}
                          onChange={e => actualizarViajero(idx, 'apellidos', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#E8445A] transition-colors"
                        />
                        <input
                          placeholder="DNI / Pasaporte"
                          value={viajero.dni_pasaporte}
                          onChange={e => actualizarViajero(idx, 'dni_pasaporte', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#E8445A] transition-colors"
                        />
                      </div>
                    </div>
                  )
                })}

                {ninosHab.map((viajero, relIdx) => {
                  const idx = viajeros.indexOf(viajero)
                  return (
                    <div key={idx} className="mb-4">
                      <p className="text-xs font-bold text-[#F5A623] uppercase tracking-wider mb-2">
                        😊 Niño {relIdx + 1} ({viajero.edad} años)
                      </p>
                      <div className="space-y-2">
                        <input
                          placeholder="Nombre"
                          value={viajero.nombre}
                          onChange={e => actualizarViajero(idx, 'nombre', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#E8445A] transition-colors"
                        />
                        <input
                          placeholder="Apellidos"
                          value={viajero.apellidos}
                          onChange={e => actualizarViajero(idx, 'apellidos', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#E8445A] transition-colors"
                        />
                        <input
                          placeholder="DNI / Pasaporte"
                          value={viajero.dni_pasaporte}
                          onChange={e => actualizarViajero(idx, 'dni_pasaporte', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#E8445A] transition-colors"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Resumen final */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div
            className="px-5 py-4 text-center text-white font-bold"
            style={{ background: 'linear-gradient(135deg, #C2185B, #E8445A)' }}
          >
            ✨ Tu viaje mágico
          </div>
          <div className="p-5 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Alojamiento</p>
              <p className="font-bold text-[#1C1C2E]">{presupuesto.hotel}</p>
              {presupuesto.plan_comidas && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {presupuesto.plan_comidas}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Fechas</p>
              <p className="font-semibold text-[#1C1C2E] flex items-center gap-2">
                🗓️ {new Date(presupuesto.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} —{' '}
                {new Date(presupuesto.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Presupuesto</p>
              <p className="font-playfair text-3xl font-bold text-[#E8445A]">
                {formatPrecio(totalFinal)}
              </p>
              <p className="text-xs text-green-600 font-semibold mt-1">✓ Mejor precio garantizado</p>
            </div>

            {/* Toggle pago flexible */}
            <button
              onClick={() => setPagoFlexible(!pagoFlexible)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${
                pagoFlexible ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${pagoFlexible ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {pagoFlexible && <span className="text-white text-xs">✓</span>}
                </span>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#1C1C2E]">
                    Pago Flexible {pagoFlexible ? 'ACTIVO' : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    Pagas solo {formatPrecio(presupuesto.precio_senal)} ahora
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${pagoFlexible ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${pagoFlexible ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Botón confirmar */}
        <button
          onClick={confirmar}
          disabled={enviando}
          className="w-full bg-[#1C1C2E] hover:bg-[#2d2d4e] disabled:opacity-50 text-white font-bold py-5 rounded-2xl uppercase tracking-widest transition-colors shadow-lg"
        >
          {enviando ? 'Enviando...' : 'Confirmar y Reservar →'}
        </button>
        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          🔒 Reserva segura. No se realizará ningún cargo automático.
          Tu agente de Inmagination Travel te contactará para gestionar el pago.
        </p>

      </div>
    </div>
  )
}
