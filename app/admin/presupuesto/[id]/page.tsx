import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatPrecio, formatFecha, calcularNoches } from '@/lib/utils'
import Link from 'next/link'
import CopiarLinkBtn from '@/components/admin/CopiarLinkBtn'
import CambiarEstadoBtn from '@/components/admin/CambiarEstadoBtn'

const ESTADO_BADGE: Record<string, { label: string; color: string }> = {
  borrador:   { label: 'Borrador',   color: 'bg-gray-100 text-gray-600' },
  enviado:    { label: 'Enviado',    color: 'bg-blue-100 text-blue-700' },
  visto:      { label: 'Visto',      color: 'bg-yellow-100 text-yellow-700' },
  confirmado: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  expirado:   { label: 'Expirado',   color: 'bg-red-100 text-red-500' },
  cancelado:  { label: 'Cancelado',  color: 'bg-gray-100 text-gray-400' },
}

export default async function PresupuestoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: p } = await supabase
    .from('presupuestos')
    .select('*')
    .eq('id', id)
    .single()

  if (!p) return notFound()

  const { data: extras } = await supabase
    .from('presupuesto_extras')
    .select('*, extra:extras_catalogo(*)')
    .eq('presupuesto_id', id)

  const { data: confirmacion } = await supabase
    .from('confirmaciones')
    .select('*')
    .eq('presupuesto_id', id)
    .single()

  const { data: viajeros } = await supabase
    .from('viajeros')
    .select('*')
    .eq('presupuesto_id', id)
    .order('habitacion_numero')

  const badge = ESTADO_BADGE[p.estado] || ESTADO_BADGE.borrador
  const noches = calcularNoches(p.fecha_inicio, p.fecha_fin)
  const linkPresupuesto = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/presupuesto/${p.token}`

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Volver</Link>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.color}`}>{badge.label}</span>
            {p.veces_visto > 0 && (
              <span className="text-xs text-gray-400">👁 Visto {p.veces_visto} veces</span>
            )}
          </div>
          <h1 className="font-playfair text-2xl font-bold text-[#1C1C2E]">
            #{p.numero} — {p.cliente_nombre}
          </h1>
          <p className="text-gray-500 text-sm">{p.cliente_email}</p>
        </div>
        <CambiarEstadoBtn presupuestoId={p.id} estadoActual={p.estado} />
      </div>

      {/* Link privado */}
      <div className="bg-[#1C1C2E] rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Link privado del cliente</p>
          <p className="text-white text-xs truncate font-mono">{linkPresupuesto}</p>
        </div>
        <CopiarLinkBtn link={linkPresupuesto} />
      </div>

      {/* Info viaje */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#1C1C2E] mb-3 text-sm uppercase tracking-wide">Viaje</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Destino:</span> <b>{p.destino}</b></p>
            <p><span className="text-gray-500">Hotel:</span> <b>{p.hotel}</b></p>
            {p.tipo_habitacion && <p><span className="text-gray-500">Habitación:</span> <b>{p.tipo_habitacion}</b></p>}
            {p.plan_comidas && <p><span className="text-gray-500">Comidas:</span> <b>{p.plan_comidas}</b></p>}
            <p><span className="text-gray-500">Entrada:</span> <b>{formatFecha(p.fecha_inicio)}</b></p>
            <p><span className="text-gray-500">Salida:</span> <b>{formatFecha(p.fecha_fin)}</b></p>
            <p><span className="text-gray-500">Duración:</span> <b>{noches + 1} días / {noches} noches</b></p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#1C1C2E] mb-3 text-sm uppercase tracking-wide">Precio</h3>
          <p className="font-playfair text-3xl font-bold text-[#E8445A]">{formatPrecio(p.precio_total)}</p>
          <p className="text-sm text-gray-500 mt-1">Señal: <b className="text-[#1C1C2E]">{formatPrecio(p.precio_senal)}</b></p>
          {p.fecha_expiracion && (
            <p className="text-xs text-orange-500 mt-2">
              ⏰ Expira: {new Date(p.fecha_expiracion).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      </div>

      {/* Habitaciones */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-[#1C1C2E] mb-3 text-sm uppercase tracking-wide">Distribución</h3>
        <div className="space-y-2">
          {p.habitaciones?.map((hab: any) => (
            <div key={hab.num} className="bg-gray-50 rounded-xl px-4 py-3 text-sm">
              <b>Hab. {hab.num}:</b> {hab.adultos} adulto{hab.adultos !== 1 ? 's' : ''}
              {hab.ninos.length > 0 && ` + ${hab.ninos.map((n: any) => `${n.edad} años`).join(', ')}`}
            </div>
          ))}
        </div>
      </div>

      {/* Extras */}
      {extras && extras.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#1C1C2E] mb-3 text-sm uppercase tracking-wide">Extras</h3>
          <div className="space-y-2">
            {extras.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-[#1C1C2E]">{e.extra?.nombre}</p>
                  {e.seleccionado_cliente && (
                    <span className="text-xs text-green-600 font-bold">✓ Seleccionado por el cliente</span>
                  )}
                </div>
                <p className="font-bold text-[#F5A623]">{formatPrecio(e.precio_personalizado)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmación */}
      {confirmacion && (
        <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
          <h3 className="font-bold text-green-800 mb-3 text-sm uppercase tracking-wide">✅ Reserva Confirmada</h3>
          <div className="space-y-1 text-sm text-green-700">
            <p>Fecha: <b>{new Date(confirmacion.fecha_confirmacion).toLocaleString('es-ES')}</b></p>
            <p>Pago flexible: <b>{confirmacion.pago_flexible ? 'Sí' : 'No'}</b></p>
            {confirmacion.telefono_reserva && <p>Teléfono: <b>{confirmacion.telefono_reserva}</b></p>}
            {confirmacion.notas_cliente && (
              <div className="mt-2 bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500 font-semibold mb-1">NOTAS DEL CLIENTE:</p>
                <p>{confirmacion.notas_cliente}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Viajeros */}
      {viajeros && viajeros.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#1C1C2E] mb-3 text-sm uppercase tracking-wide">Viajeros</h3>
          <div className="space-y-2">
            {viajeros.map((v: any) => (
              <div key={v.id} className="bg-gray-50 rounded-xl px-4 py-3 text-sm">
                <p className="font-semibold text-[#1C1C2E]">{v.nombre} {v.apellidos}</p>
                <p className="text-gray-500 text-xs">
                  {v.tipo === 'nino' ? `Niño (${v.edad} años)` : 'Adulto'} · Hab. {v.habitacion_numero}
                  {v.dni_pasaporte && ` · ${v.dni_pasaporte}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notas internas */}
      {p.notas_internas && (
        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
          <h3 className="font-bold text-yellow-800 mb-2 text-sm uppercase tracking-wide">📝 Notas internas</h3>
          <p className="text-sm text-yellow-700">{p.notas_internas}</p>
        </div>
      )}
    </div>
  )
}
