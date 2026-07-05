'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ExtraCatalogo, Habitacion, Presupuesto, VueloEstructurado } from '@/types'
import { esCrucero } from '@/lib/utils'

interface ExtraConPrecio {
  extra: ExtraCatalogo
  incluido: boolean
  precio: string
}

interface EditandoData {
  id: string
  presupuesto: Presupuesto & { observaciones?: string; photopass?: boolean; grupo_id?: string; variante?: string }
  extrasActuales: { extra_id: string; precio_personalizado: number }[]
}

interface Props {
  extrasCatalogo: ExtraCatalogo[]
  editando?: EditandoData
}

const HOTELES_DISNEY = [
  'Disneyland Hotel',
  'Disney Hotel New York – The Art of Marvel',
  'Disney Newport Bay Club',
  'Disney Sequoia Lodge',
  'Disney Hotel Cheyenne',
  'Disney Hotel Santa Fe',
  'Disney Davy Crockett Ranch',
]

const HOTELES_PARTNER = [
  'Villages Nature Paris',
  'Hôtel l\'Elysée Val d\'Europe',
  'Staycity Aparthotels Paris Marne-la-Vallée',
  'Ki Space Hotel & Spa',
  'Aparthotel Adagio Val d\'Europe',
  'B&B Hotel près de Disneyland Paris',
  'Campanile Val de France',
  'Explorers Hotel',
  'Grand Magic Hotel',
  'Dream Castle Hotel',
  'Aparthotel Adagio Serris Val d\'Europe',
  'Hôtel AKENA Serris Val d\'Europe',
]

const CRUCEROS = [
  'Disney Cruise Line',
  'Royal Caribbean',
  'MSC Cruceros',
  'Costa Cruceros',
]

export default function NuevoPresupuestoForm({ extrasCatalogo, editando }: Props) {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const p = editando?.presupuesto

  // Datos cliente
  const [clienteNombre, setClienteNombre] = useState(p?.cliente_nombre || '')
  const [clienteEmail, setClienteEmail] = useState(p?.cliente_email || '')
  const [clienteTelefono, setClienteTelefono] = useState(p?.cliente_telefono || '')

  // Datos viaje
  const [destino, setDestino] = useState(p?.destino || 'Disneyland Paris')
  const [fechaInicio, setFechaInicio] = useState(p?.fecha_inicio || '')
  const [fechaFin, setFechaFin] = useState(p?.fecha_fin || '')

  // Hotel — detectar si es manual (no está en ninguna lista)
  const todasListas = [...HOTELES_DISNEY, ...HOTELES_PARTNER, ...CRUCEROS]
  const hotelInicial = p?.hotel || ''
  const esManualInicial = hotelInicial !== '' && !todasListas.includes(hotelInicial)
  const [hotelSelect, setHotelSelect] = useState(esManualInicial ? '__manual__' : hotelInicial)
  const [hotelManual, setHotelManual] = useState(esManualInicial ? hotelInicial : '')
  const hotel = hotelSelect === '__manual__' ? hotelManual : hotelSelect

  const [hotelImagenUrl, setHotelImagenUrl] = useState(p?.hotel_imagen_url || '')
  const [tipoHabitacion, setTipoHabitacion] = useState(p?.tipo_habitacion || '')
  const [planComidas, setPlanComidas] = useState(p?.plan_comidas || '')
  const [incluyeVuelos, setIncluyeVuelos] = useState(p?.incluye_vuelos || false)
  const [descripcionOferta, setDescripcionOferta] = useState(p?.descripcion_oferta || '')
  const [observaciones, setObservaciones] = useState(p?.observaciones || '')
  const [photopass, setPhotopass] = useState(p?.photopass || false)

  // Vuelos estructurados
  const vuelosObj = p?.detalles_vuelos && typeof p.detalles_vuelos === 'object' && 'ida' in p.detalles_vuelos
    ? p.detalles_vuelos as VueloEstructurado
    : null
  const [vueloIda, setVueloIda] = useState(vuelosObj?.ida || { origen: '', fecha: '', destino: '' })
  const [vueloVuelta, setVueloVuelta] = useState(vuelosObj?.vuelta || { origen: '', fecha: '', destino: '' })

  // Precios
  const [precioTotal, setPrecioTotal] = useState(p ? String(p.precio_total) : '')
  const [precioSenal, setPrecioSenal] = useState(p ? String(p.precio_senal) : '')
  const [fechaExpiracion, setFechaExpiracion] = useState(p?.fecha_expiracion || '')
  const [notasInternas, setNotasInternas] = useState(p?.notas_internas || '')

  // Habitaciones
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>(
    p?.habitaciones || [{ num: 1, adultos: 2, ninos: [] }]
  )

  // Extras
  const [extras, setExtras] = useState<ExtraConPrecio[]>(
    extrasCatalogo.map(e => {
      const actual = editando?.extrasActuales.find(ea => ea.extra_id === e.id)
      return { extra: e, incluido: !!actual, precio: actual ? String(actual.precio_personalizado) : String(e.precio_referencia) }
    })
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
      i === habIndex ? { ...h, ninos: h.ninos.map((n, ni) => ni === ninoIndex ? { edad } : n) } : h
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

    const detalles_vuelos = incluyeVuelos
      ? { ida: vueloIda, vuelta: vueloVuelta }
      : null

    const datos = {
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
      detalles_vuelos,
      descripcion_oferta: descripcionOferta || null,
      observaciones: observaciones || null,
      photopass,
      habitaciones,
      precio_total: parseFloat(precioTotal),
      precio_senal: parseFloat(precioSenal),
      estado,
      fecha_expiracion: fechaExpiracion || null,
      notas_internas: notasInternas || null,
    }

    try {
      const supabase = createClient()

      if (editando) {
        // MODO EDICIÓN: UPDATE
        const { error: errU } = await supabase
          .from('presupuestos')
          .update(datos)
          .eq('id', editando.id)

        if (errU) throw new Error(errU.message)

        // Reemplazar extras
        await supabase.from('presupuesto_extras').delete().eq('presupuesto_id', editando.id)
        const extrasIncluidos = extras.filter(e => e.incluido)
        if (extrasIncluidos.length > 0) {
          await supabase.from('presupuesto_extras').insert(
            extrasIncluidos.map(e => ({
              presupuesto_id: editando.id,
              extra_id: e.extra.id,
              precio_personalizado: parseFloat(e.precio) || e.extra.precio_referencia,
            }))
          )
        }

        if (estado === 'enviado') {
          await fetch('/api/enviar-presupuesto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ presupuesto_id: editando.id }),
          })
        }

        router.push(`/admin/presupuesto/${editando.id}`)
      } else {
        // MODO CREACIÓN: INSERT
        const { data: presupuesto, error: errP } = await supabase
          .from('presupuestos')
          .insert(datos)
          .select()
          .single()

        if (errP || !presupuesto) throw new Error(errP?.message || 'Error al crear presupuesto')

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

        if (estado === 'enviado') {
          await fetch('/api/enviar-presupuesto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ presupuesto_id: presupuesto.id }),
          })
        }

        router.push(`/admin/presupuesto/${presupuesto.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const esCruceroSeleccionado = esCrucero(hotel)

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

          {/* Hotel */}
          <div className="sm:col-span-2">
            <label className="label-admin">Hotel / Crucero *</label>
            <select value={hotelSelect} onChange={e => setHotelSelect(e.target.value)} required className="input-admin">
              <option value="">— Selecciona —</option>
              <option value="__manual__">✏️ Escribir manualmente</option>
              <optgroup label="🏰 Hoteles Disney">
                {HOTELES_DISNEY.map(h => <option key={h}>{h}</option>)}
              </optgroup>
              <optgroup label="🏨 Hoteles Partner">
                {HOTELES_PARTNER.map(h => <option key={h}>{h}</option>)}
              </optgroup>
              <optgroup label="🚢 Cruceros">
                {CRUCEROS.map(h => <option key={h}>{h}</option>)}
              </optgroup>
            </select>
            {hotelSelect === '__manual__' && (
              <input
                value={hotelManual}
                onChange={e => setHotelManual(e.target.value)}
                placeholder="Nombre del hotel o crucero"
                className="input-admin mt-2"
                required
              />
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="label-admin">URL imagen hotel <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input value={hotelImagenUrl} onChange={e => setHotelImagenUrl(e.target.value)}
              placeholder="https://..." className="input-admin" />
          </div>
          <div>
            <label className="label-admin">{esCruceroSeleccionado ? 'Tipo de camarote' : 'Tipo habitación'}</label>
            <input value={tipoHabitacion} onChange={e => setTipoHabitacion(e.target.value)}
              placeholder={esCruceroSeleccionado ? 'Camarote interior' : 'Habitación estándar'} className="input-admin" />
          </div>
          <div>
            <label className="label-admin">Plan de comidas</label>
            <input value={planComidas} onChange={e => setPlanComidas(e.target.value)}
              placeholder="Pensión Completa Plus" className="input-admin" />
          </div>

          {/* Photopass — solo para no cruceros */}
          {!esCruceroSeleccionado && (
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer bg-purple-50 rounded-xl px-4 py-3 border border-purple-100">
                <input type="checkbox" checked={photopass} onChange={e => setPhotopass(e.target.checked)}
                  className="w-4 h-4 accent-purple-600" />
                <div>
                  <span className="text-sm font-semibold text-purple-800">📸 Incluye PhotoPass</span>
                  <p className="text-xs text-purple-500">Fotos profesionales incluidas en el precio</p>
                </div>
              </label>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="label-admin">Descripción de la oferta / Lo que incluye</label>
            <textarea value={descripcionOferta} onChange={e => setDescripcionOferta(e.target.value)}
              rows={3} placeholder="OFERTA ESPECIAL - PLAZAS LIMITADAS&#10;Estancia 3 noches + 4 días de parques..."
              className="input-admin resize-none" />
          </div>

          <div className="sm:col-span-2">
            <label className="label-admin">Observaciones para el cliente <span className="text-gray-400 font-normal">(visible en la propuesta)</span></label>
            <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
              rows={2} placeholder="Ej: Precio sujeto a disponibilidad. Plazas limitadas."
              className="input-admin resize-none" />
          </div>

          {/* Vuelos */}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={incluyeVuelos} onChange={e => setIncluyeVuelos(e.target.checked)}
                className="w-4 h-4 accent-[#E8445A]" />
              <span className="text-sm font-medium text-[#1C1C2E]">Incluye vuelos</span>
            </label>

            {incluyeVuelos && (
              <div className="mt-3 space-y-3">
                {/* Ida */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">✈️ Ida</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="label-admin text-xs">Origen</label>
                      <input value={vueloIda.origen} onChange={e => setVueloIda(v => ({ ...v, origen: e.target.value }))}
                        placeholder="MAD" className="input-admin text-center font-bold uppercase" maxLength={4} />
                    </div>
                    <div>
                      <label className="label-admin text-xs">Fecha</label>
                      <input type="date" value={vueloIda.fecha} onChange={e => setVueloIda(v => ({ ...v, fecha: e.target.value }))}
                        className="input-admin" />
                    </div>
                    <div>
                      <label className="label-admin text-xs">Destino</label>
                      <input value={vueloIda.destino} onChange={e => setVueloIda(v => ({ ...v, destino: e.target.value }))}
                        placeholder="CDG" className="input-admin text-center font-bold uppercase" maxLength={4} />
                    </div>
                  </div>
                </div>

                {/* Vuelta */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">✈️ Vuelta</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="label-admin text-xs">Origen</label>
                      <input value={vueloVuelta.origen} onChange={e => setVueloVuelta(v => ({ ...v, origen: e.target.value }))}
                        placeholder="CDG" className="input-admin text-center font-bold uppercase" maxLength={4} />
                    </div>
                    <div>
                      <label className="label-admin text-xs">Fecha</label>
                      <input type="date" value={vueloVuelta.fecha} onChange={e => setVueloVuelta(v => ({ ...v, fecha: e.target.value }))}
                        className="input-admin" />
                    </div>
                    <div>
                      <label className="label-admin text-xs">Destino</label>
                      <input value={vueloVuelta.destino} onChange={e => setVueloVuelta(v => ({ ...v, destino: e.target.value }))}
                        placeholder="MAD" className="input-admin text-center font-bold uppercase" maxLength={4} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HABITACIONES */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-lg font-bold text-[#1C1C2E]">
            {esCruceroSeleccionado ? '🛳️ Camarotes' : '🛏️ Habitaciones'}
          </h2>
          <button type="button" onClick={addHabitacion}
            className="text-sm text-[#E8445A] font-semibold hover:underline">
            + Añadir {esCruceroSeleccionado ? 'camarote' : 'habitación'}
          </button>
        </div>
        <div className="space-y-4">
          {habitaciones.map((hab, habIdx) => (
            <div key={hab.num} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-[#1C1C2E] text-sm">
                  {esCruceroSeleccionado ? 'Camarote' : 'Habitación'} {hab.num}
                </span>
                {habitaciones.length > 1 && (
                  <button type="button" onClick={() => removeHabitacion(habIdx)}
                    className="text-red-400 text-xs hover:underline">Eliminar</button>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <label className="label-admin mb-0">Adultos</label>
                <select value={hab.adultos} onChange={e => updateHabitacion(habIdx, 'adultos', parseInt(e.target.value))}
                  className="input-admin w-20 py-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
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
          <h2 className="font-playfair text-lg font-bold text-[#1C1C2E] mb-1">✨ Extras</h2>
          <p className="text-sm text-gray-500 mb-4">Selecciona qué extras proponer y ajusta el precio</p>
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
                  <p className="text-xs text-gray-500">Ref: {item.extra.precio_referencia} €</p>
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
          rows={3} placeholder="Notas privadas (el cliente no las ve)..."
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
          {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar borrador'}
        </button>
        <button type="button" disabled={guardando}
          onClick={e => handleSubmit(e as any, 'enviado')}
          className="flex-1 bg-[#E8445A] hover:bg-[#C2185B] text-white font-bold py-4 rounded-xl uppercase tracking-wide text-sm transition-colors disabled:opacity-50">
          {guardando ? 'Guardando...' : editando ? 'Guardar y enviar ✨' : 'Crear y enviar ✨'}
        </button>
      </div>
    </form>
  )
}
