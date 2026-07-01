'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

type Presupuesto = {
  id: string
  numero: number
  cliente_nombre: string
  cliente_email: string
  precio_total: number
  estado: string
  fecha_inicio: string
  fecha_fin: string
  veces_visto: number
  created_at: string
}

export default function PresupuestosLista({ presupuestos: inicial }: { presupuestos: Presupuesto[] }) {
  const [lista, setLista] = useState(inicial)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [eliminando, setEliminando] = useState<string | null>(null)
  const router = useRouter()

  const filtrados = lista.filter(p => {
    const coincideBusqueda =
      p.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cliente_email.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(p.numero).includes(busqueda)
    const coincideEstado = filtroEstado === 'todos' || p.estado === filtroEstado
    return coincideBusqueda && coincideEstado
  })

  async function handleEliminar(e: React.MouseEvent, id: string, nombre: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`¿Eliminar el presupuesto de ${nombre}? Esta acción no se puede deshacer.`)) return

    setEliminando(id)
    try {
      const res = await fetch('/api/eliminar-presupuesto', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: id }),
      })
      if (!res.ok) throw new Error()
      setLista(prev => prev.filter(p => p.id !== id))
      router.refresh()
    } catch {
      alert('Error al eliminar el presupuesto')
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Buscador y filtro */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email o nº..."
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8445A] transition-colors"
        />
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8445A] transition-colors"
        >
          <option value="todos">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="enviado">Enviado</option>
          <option value="visto">Visto</option>
          <option value="confirmado">Confirmado</option>
          <option value="expirado">Expirado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">{lista.length === 0 ? 'No hay presupuestos aún' : 'Sin resultados para esta búsqueda'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtrados.map(p => {
              const badge = ESTADO_BADGE[p.estado] || ESTADO_BADGE.borrador
              return (
                <div key={p.id} className="relative group">
                  <Link
                    href={`/admin/presupuesto/${p.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors pr-14"
                  >
                    <div className="w-10 h-10 bg-[#1C1C2E] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">#{p.numero}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1C1C2E] truncate">{p.cliente_nombre}</p>
                      <p className="text-xs text-gray-500 truncate">{p.cliente_email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(p.fecha_inicio).toLocaleDateString('es-ES')} →{' '}
                        {new Date(p.fecha_fin).toLocaleDateString('es-ES')}
                      </p>
                    </div>
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

                  {/* Botón eliminar — aparece en hover */}
                  <button
                    onClick={e => handleEliminar(e, p.id, p.cliente_nombre)}
                    disabled={eliminando === p.id}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                    title="Eliminar presupuesto"
                  >
                    {eliminando === p.id ? '⏳' : '🗑'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {filtrados.length > 0 && (
        <p className="text-xs text-gray-400 text-right">{filtrados.length} presupuesto{filtrados.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
