import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatPrecio } from '@/lib/utils'

const ESTADO_BADGE: Record<string, { label: string; color: string }> = {
  borrador:   { label: 'Borrador',   color: 'bg-gray-100 text-gray-600' },
  enviado:    { label: 'Enviado',    color: 'bg-blue-100 text-blue-700' },
  visto:      { label: 'Visto',      color: 'bg-yellow-100 text-yellow-700' },
  confirmado: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  expirado:   { label: 'Expirado',   color: 'bg-red-100 text-red-500' },
  cancelado:  { label: 'Cancelado',  color: 'bg-gray-100 text-gray-400' },
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: presupuestos } = await supabase
    .from('presupuestos')
    .select('id, numero, cliente_nombre, cliente_email, precio_total, estado, fecha_inicio, fecha_fin, veces_visto, created_at')
    .order('created_at', { ascending: false })

  const stats = {
    total:      presupuestos?.length || 0,
    enviados:   presupuestos?.filter(p => p.estado === 'enviado').length || 0,
    vistos:     presupuestos?.filter(p => p.estado === 'visto').length || 0,
    confirmados:presupuestos?.filter(p => p.estado === 'confirmado').length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#1C1C2E]">
            Presupuestos
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Gestiona y envía presupuestos a tus clientes
          </p>
        </div>
        <Link
          href="/admin/nuevo"
          className="bg-[#E8445A] hover:bg-[#C2185B] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Nuevo presupuesto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#1C1C2E]' },
          { label: 'Enviados', value: stats.enviados, color: 'text-blue-600' },
          { label: 'Vistos', value: stats.vistos, color: 'text-yellow-600' },
          { label: 'Confirmados', value: stats.confirmados, color: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`font-playfair text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lista presupuestos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {!presupuestos?.length ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium">No hay presupuestos aún</p>
            <p className="text-sm mt-1">Crea el primero pulsando "+ Nuevo presupuesto"</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {presupuestos.map(p => {
              const badge = ESTADO_BADGE[p.estado] || ESTADO_BADGE.borrador
              return (
                <Link
                  key={p.id}
                  href={`/admin/presupuesto/${p.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Número */}
                  <div className="w-10 h-10 bg-[#1C1C2E] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">#{p.numero}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1C1C2E] truncate">{p.cliente_nombre}</p>
                    <p className="text-xs text-gray-500 truncate">{p.cliente_email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.fecha_inicio).toLocaleDateString('es-ES')} →{' '}
                      {new Date(p.fecha_fin).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  {/* Precio + estado */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#E8445A]">{formatPrecio(p.precio_total)}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                    {p.veces_visto > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">👁 {p.veces_visto}x</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
