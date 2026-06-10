'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ESTADOS = ['borrador', 'enviado', 'visto', 'confirmado', 'expirado', 'cancelado']

export default function CambiarEstadoBtn({ presupuestoId, estadoActual }: { presupuestoId: string; estadoActual: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function cambiarEstado(nuevoEstado: string) {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('presupuestos').update({ estado: nuevoEstado }).eq('id', presupuestoId)
    router.refresh()
    setLoading(false)
  }

  return (
    <select value={estadoActual} onChange={e => cambiarEstado(e.target.value)}
      disabled={loading}
      className="text-sm border border-gray-200 rounded-xl px-3 py-2 text-[#1C1C2E] font-semibold focus:outline-none focus:border-[#E8445A] bg-white">
      {ESTADOS.map(e => (
        <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
      ))}
    </select>
  )
}
