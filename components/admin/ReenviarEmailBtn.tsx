'use client'

import { useState } from 'react'

export default function ReenviarEmailBtn({ presupuestoId }: { presupuestoId: string }) {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')

  async function handleReenviar() {
    setEstado('enviando')
    try {
      const res = await fetch('/api/enviar-presupuesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: presupuestoId }),
      })
      setEstado(res.ok ? 'ok' : 'error')
    } catch {
      setEstado('error')
    }
    setTimeout(() => setEstado('idle'), 4000)
  }

  return (
    <button
      onClick={handleReenviar}
      disabled={estado === 'enviando'}
      className="text-sm px-4 py-2 rounded-xl border border-[#E8445A] text-[#E8445A] hover:bg-[#E8445A] hover:text-white transition-colors disabled:opacity-50"
    >
      {estado === 'enviando' && '📤 Enviando...'}
      {estado === 'ok' && '✅ Email enviado'}
      {estado === 'error' && '❌ Error al enviar'}
      {estado === 'idle' && '📧 Reenviar enlace'}
    </button>
  )
}
