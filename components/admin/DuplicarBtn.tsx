'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DuplicarBtn({ presupuestoId }: { presupuestoId: string }) {
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'error'>('idle')
  const router = useRouter()

  async function handleDuplicar() {
    if (!confirm('¿Duplicar este presupuesto como borrador?')) return
    setEstado('cargando')
    try {
      const res = await fetch('/api/duplicar-presupuesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: presupuestoId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/admin/presupuesto/${data.id}`)
    } catch {
      setEstado('error')
      setTimeout(() => setEstado('idle'), 3000)
    }
  }

  return (
    <button
      onClick={handleDuplicar}
      disabled={estado === 'cargando'}
      className="text-sm px-3 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      {estado === 'cargando' ? 'Duplicando...' : estado === 'error' ? '❌ Error' : '📋 Duplicar'}
    </button>
  )
}
