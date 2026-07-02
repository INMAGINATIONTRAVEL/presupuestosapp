'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CambiarPasswordForm() {
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'ok' | 'error'>('idle')
  const [mensaje, setMensaje] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMensaje('')

    if (nueva.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.')
      setEstado('error')
      return
    }
    if (nueva !== confirmar) {
      setMensaje('Las contraseñas no coinciden.')
      setEstado('error')
      return
    }

    setEstado('cargando')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: nueva })

    if (error) {
      setMensaje(error.message)
      setEstado('error')
    } else {
      setNueva('')
      setConfirmar('')
      setMensaje('Contraseña actualizada correctamente.')
      setEstado('ok')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label className="label-admin">Nueva contraseña</label>
        <input
          type="password"
          value={nueva}
          onChange={e => setNueva(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
          className="input-admin"
        />
      </div>
      <div>
        <label className="label-admin">Confirmar contraseña</label>
        <input
          type="password"
          value={confirmar}
          onChange={e => setConfirmar(e.target.value)}
          placeholder="Repite la contraseña"
          required
          className="input-admin"
        />
      </div>

      {mensaje && (
        <p className={`text-sm px-4 py-3 rounded-xl ${
          estado === 'ok'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {estado === 'ok' ? '✅ ' : '❌ '}{mensaje}
        </p>
      )}

      <button
        type="submit"
        disabled={estado === 'cargando'}
        className="bg-[#E8445A] hover:bg-[#C2185B] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
      >
        {estado === 'cargando' ? 'Guardando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
