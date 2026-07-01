import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PresupuestosLista from '@/components/admin/PresupuestosLista'

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

      {/* Lista presupuestos con búsqueda y filtro */}
      <PresupuestosLista presupuestos={presupuestos || []} />
    </div>
  )
}
