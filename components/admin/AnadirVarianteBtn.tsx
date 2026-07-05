'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnadirVarianteBtn({
  presupuestoId,
  variantesExistentes,
}: {
  presupuestoId: string
  variantesExistentes: string[]
}) {
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'error'>('idle')
  const router = useRouter()

  const letras = ['A', 'B', 'C']
  const siguienteLetra = letras.find(l => !variantesExistentes.includes(l))

  if (!siguienteLetra) return null // Ya hay A, B y C

  async function handleAnadir() {
    setEstado('cargando')
    try {
      const res = await fetch('/api/duplicar-presupuesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: presupuestoId, como_variante: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/admin/editar/${data.id}`)
    } catch {
      setEstado('error')
      setTimeout(() => setEstado('idle'), 3000)
    }
  }

  return (
    <button
      onClick={handleAnadir}
      disabled={estado === 'cargando'}
      className="text-sm px-3 py-2 rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors disabled:opacity-50"
    >
      {estado === 'cargando' ? 'Creando...' : estado === 'error' ? '❌ Error' : `＋ Variante ${siguienteLetra}`}
    </button>
  )
}
