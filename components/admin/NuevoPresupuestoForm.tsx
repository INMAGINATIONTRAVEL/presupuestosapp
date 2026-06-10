'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ExtraCatalogo, Habitacion } from '@/types'

interface ExtraConPrecio {
  extra: ExtraCatalogo
  incluido: boolean
  precio: string
}

export default function NuevoPresupuestoForm({ extrasCatalogo }: { extrasCatalogo: ExtraCatalogo[] }) {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // Datos cliente
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteEmail, setClienteEmail] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')

  // Datos viaje
  const [destino, setDestino] = useState('Disneyland Paris')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [hotel, setHotel] = useState('')
  const [hotelImagenUrl, setHotelImagenUrl] = useState('')
  const [tipoHabitacion, setTipoHabitacion] = useState('')
  const [planComidas, setPlanComidas] = useState('')
  const [incluyeVuelos, setIncluyeVuelos] = useState(false)
  const [detallesVuelos, setDetallesVuelos] = useState('')
  const [descripcionOferta, setDescripcionOferta] = useState('')

  // Precios
  const [precioTotal, setPrecioTotal] = useState('')
  const [precioSenal, setPrecioSenal] = useState('')

  // Caducidad
  const [fechaExpiracion, setFechaExpiracion] = useState('')

  // Notas internas
  const [notasInternas, setNotasInternas] = useState('')

  // Habitaciones
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([
    { num: 1, adultos: 2, ninos: [] }
  ])

  // Extras
  const [extras, setExtras] = useState<ExtraConPrecio[]>(
    extrasCatalogo.map(e => ({ extra: e, incluido: false, precio: String(e.precio_referencia) }))
  )

  function addHabitacion() {
    setHabitaciones(prev => [...prev, { num: prev.length + 1, adultos: 2, ninos: [] }])
  }

  function removeHabitacion(index: number) {
    setHabitaciones(prev => prev.filter((_, i) => i !== index).map((h, i) => ({ ...h, num: i + 1 })))
  }

  function updateHabitacion(index: number, campo: 'adultos', valor: number) {
    setHabitaciones(prev => prev.map((h, i) => i === index ? { ...h, [campo]: valor } : h))
  }

  function addNino(habIndex: number) {
    setHabitaciones(prev => prev.map((h, i) =>
      i === habIndex ? { ...h, ninos: [...h.ninos, { edad: 5 }] } : h
    ))
  }

  function removeNino(habIndex: number, ninoIndex: number) {
    setHabitaciones(prev => prev.map((h, i) =>
      i === habIndex ? { ...h, ninos: h.ninos.filter((_, ni) => ni !== ninoIndex) } : h
    ))
  }

  function updateNinoEdad(habIndex: number, ninoIndex: number, edad: number) {
    setHabitaciones(prev => prev.map((h, i) =>
      i === habIndex ? {
        ...h,
        ninos: h.ninos.map((n, ni) => ni === ninoIndex ? { edad } : n)
      } : h
    ))
  }

  function toggleExtra(index: number) {
    setExtras(prev => prev.map((e, i) => i === index ? { ...e, incluido: !e.incluido } : e))
  }

  function updateExtraPrecio(index: number, precio: string) {
    setExtras(prev => prev.map((e, i) => i === index ? { ...e, precio } : e))
  }

  async function handleSubmit(e: React.FormEvent, estado: 'borrador' | 'enviado') {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      const supabase = createClient()

      // Crear presupuesto
      const { data: presupuesto, error: errP } = await supabase
        .from('presupuestos')
        .insert({
          cliente_nombre: clienteNombre.toUpperCase(),
          cliente_email: clienteEmail.toLowerCase().trim(),
          cliente_telefono: clienteTelefono || null,
          destino,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          hotel,
          hotel_imagen_url: hotelImagenUrl || null,
          tipo_habitacion: tipoHabitacion || null,
          plan_comidas: planComidas || null,
          incluye_vuelos: incluyeVuelos,
          detalles_vuelos: incluyeVuelos && detallesVuelos ? detallesVuelos : null,
          descripcion_oferta: descripcionOferta || null,
          habitaciones,
          precio_total: parseFloat(precioTotal),
          precio_senal: parseFloat(precioSenal),
          estado,
          fecha_expiracion: fechaExpiracion || null,
          notas_internas: notasInternas || null,
        })
        .select()
        .single()

      if (errP || !presupuesto) throw new Error(errP?.message || 'Error al crear presupuesto')

      // Añadir extras seleccionados
      const extrasIncluidos = extras.filter(e => e.incluido)
      if (extrasIncluidos.length > 0) {
        await supabase.from('presupuesto_extras').insert(
          extrasIncluidos.map(e => ({
            presupuesto_id: presupuesto.id,
            extra_id: e.extra.id,
            precio_personalizado: parseFloat(e.precio) || e.extra.precio_referencia,
          }))
        )
      }

      router.push(`/admin/presupuesto/${presupuesto.id}`)
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="space-y-6">

      {/* DATOS DEL CLIENTE */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-playfair text-lg font-bold text-[#1C1C2E] mb-4">👤 Datos del Cliente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label-admin">Nombre completo *</label>
            <input value={clienteNombre} onChange={e => setClienteNombre(e.target.value)}
              placeholder="DÉBORA LAMELAS" required className="input-admin" />
          </div>
          <div>
            <label className="label-admin">Email *</label>
            <input type="email" value={clienteEmail} onChange={e => setClienteEmail(e.target.value)}
              placeholder="cliente@email.com" required className="input-admin" />
          </div>
          <div>
            <label className="label-admin">Teléfono</label>
            <input value={clienteTelefono} onChange={e => setClienteTelefono(e.target.value)}
              placeholder="600 000 000" className="input-admin" />
          </div>
        </div>
      </section>

      {/* DATOS DEL VIAJE */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-playfair text-lg font-bold text-[#1C1C2E] mb-4">✈️ Datos del Viaje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label-admin">Destino *</label>
            <input value={destino} onChange={e => setDestino(e.target.value)}
              placeholder="Disneyland Paris" required className="input-admin" />
          </div>
          <div>
            <label className="label-admin">Fecha entrada *</label>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
              required className="input-admin" />
          </div>
          <div>
            <label className="label-admin">Fecha salida *</label>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
              required className="input-admin" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-admin">Hotel *</label>
            <input value={hotel} onChange={e => setHotel(e.target.value)}
              placeholder="Disney Newport Bay Club" required className="input-admin" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-admin">URL imagen hotel</label>
            <input value={hotelImagenUrl} onChange={e => setHotelImagenUrl(e.target.value)}
              placeholder="https://..." className="input-admin" />
          </div>
          <div>
            <label className="label-admin">Tipo habitación</label>
            <input value={tipoHabitacion} onChange={e => setTipoHabitacion(e.target.value)}
              placeholder="Habitación estándar" className="input-admin" />
          </div>
          <div>
            <label className="label-admin">Plan de comidas</label>
            <input value={planComidas} onChange={e => setPlanComidas(e.target.value)}
              placeholder="Pensión Completa Plus" className="input-admin" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-admin">Descripción de la oferta</label>
            <textarea value={descripcionOferta} onChange={e => setDescripcionOferta(e.target.value)}
              rows={3} placeholder="OFERTA ESPECIAL - PLAZAS LIMITADAS&#10;Estancia 3 noches + 4 días de parques..."
              className="input-admin resize-none" />
          </div>

          {/* Vuelos */}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={incluyeVuelos}
                onChange={e => setIncluyeVuelos(e.target.checked)}
                className="w-4 h-4 accent-[#E8445A]" />
              <span className="text-sm font-medium text-[#1C1C2E]">Incluye vuelos</span>
            </label>
            {incluyeVuelos && (
              <textarea value={detallesVuelos} onChange={e => setDetallesVuelos(e.target.value)}
                rows={3} placeholder="IDA: MAD → CDG  09/10 07:30 - 10:15&#10;VUELTA: CDG → MAD  12/10 18:00 - 20:00"
                className="input-admin resize-none mt-2" />
            )}
          </div>
        </div>
      </section>

      {/* HABITACIONES */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-lg font-bold text-[#1C1C2E]">🛏️ Habitaciones</h2>
          <button type="button" onClick={addHabitacion}
            className="text-sm text-[#E8445A] font-semibold hover:underline">
            + Añadir habitación
          </button>
        </div>
        <div className="space-y-4">
          {habitaciones.map((hab, habIdx) => (
            <div key={hab.num} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-[#1C1C2E] text-sm">Habitación {hab.num}</span>
                {habitaciones.length > 1 && (
                  <button type="button" onClick={() => removeHabitacion(habIdx)}
                    className="text-red-400 text-xs hover:underline">Eliminar</button>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <label className="label-admin mb-0">Adultos</label>
                <select value={hab.adultos} onChange={e => updateHabitacion(habIdx, 'adultos', parseInt(e.target.value))}
                  className="input-admin w-20 py-2">
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label-admin mb-0">Niños</label>
                  <button type="button" onClick={() => addNino(habIdx)}
                    className="text-xs text-[#E8445A] font-semibold hover:underline">+ Añadir niño</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hab.ninos.map((nino, ninoIdx) => (
                    <div key={ninoIdx} className="flex items-center gap-1 bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                      <span className="text-xs text-gray-500">Edad:</span>
                      <input type="number" min={0} max={17} value={nino.edad}
                        onChange={e => updateNinoEdad(habIdx, ninoIdx, parseInt(e.target.value))}
                        className="w-10 text-center text-sm font-bold text-[#1C1C2E] border-none outline-none bg-transparent" />
                      <button type="button" onClick={() => removeNino(habIdx, ninoIdx)}
                        className="text-red-400 text-xs ml-1">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRECIOS */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-playfair text-lg font-bold text-[#1C1C2E] mb-4">💰 Precios</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-admin">Precio total (€) *</label>
            <input type="number" step="0.01" value={precioTotal} onChange={e => setPrecioTotal(e.target.value)}
              placeholder="4668" required className="input-admin" />
          </div>
          <div>
            <label className="label-admin">Señal / Depósito (€) *</label>
            <input type="number" step="0.01" value={precioSenal} onChange={e => setPrecioSenal(e.target.value)}
              placeholder="1321" required className="input-admin" />
          </div>
          <div>
            <label className="label-admin">Oferta válida hasta</label>
            <input type="date" value={fechaExpiracion} onChange={e => setFechaExpiracion(e.target.value)}
              className="input-admin" />
          </div>
        </div>
      </section>

      {/* EXTRAS */}
      {extrasCatalogo.length > 0 && (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-playfair text-lg font-bold text-[#1C1C2E] mb-1">✨ Extras para este presupuesto</h2>
          <p className="text-sm text-gray-500 mb-4">Selecciona qué extras proponer y ajusta el precio para este viaje concreto</p>
          <div className="space-y-3">
            {extras.map((item, idx) => (
              <div key={item.extra.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                  item.incluido ? 'border-[#E8445A] bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}>
                <input type="checkbox" checked={item.incluido} onChange={() => toggleExtra(idx)}
                  className="w-4 h-4 accent-[#E8445A] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1C1C2E] text-sm">{item.extra.nombre}</p>
                  <p className="text-xs text-gray-500">Precio referencia: {item.extra.precio_referencia} €</p>
                </div>
                {item.incluido && (
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.01" value={item.precio}
                      onChange={e => updateExtraPrecio(idx, e.target.value)}
                      className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right font-bold" />
                    <span className="text-sm text-gray-500">€</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NOTAS INTERNAS */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-playfair text-lg font-bold text-[#1C1C2E] mb-4">📝 Notas internas</h2>
        <textarea value={notasInternas} onChange={e => setNotasInternas(e.target.value)}
          rows={3} placeholder="Notas privadas del agente (el cliente no las ve)..."
          className="input-admin resize-none" />
      </section>

      {error && (
        <p className="text-[#E8445A] text-sm text-center bg-red-50 p-3 rounded-xl">{error}</p>
      )}

      {/* BOTONES */}
      <div className="flex gap-3 pb-6">
        <button type="button" disabled={guardando}
          onClick={e => handleSubmit(e as any, 'borrador')}
          className="flex-1 border-2 border-[#1C1C2E] text-[#1C1C2E] font-bold py-4 rounded-xl uppercase tracking-wide text-sm hover:bg-[#1C1C2E] hover:text-white transition-colors disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar borrador'}
        </button>
        <button type="button" disabled={guardando}
          onClick={e => handleSubmit(e as any, 'enviado')}
          className="flex-1 bg-[#E8445A] hover:bg-[#C2185B] text-white font-bold py-4 rounded-xl uppercase tracking-wide text-sm transition-colors disabled:opacity-50">
          {guardando ? 'Creando...' : 'Crear y enviar ✨'}
        </button>
      </div>
    </form>
  )
}
