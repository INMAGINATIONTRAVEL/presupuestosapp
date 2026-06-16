'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  token: string
  emailCliente: string
}

export default function EmailGate({ token }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth-presupuesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        setError('El email no coincide con el asociado a esta oferta.')
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1C1C2E 0%, #2d1b4e 60%, #1C1C2E 100%)' }}>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo letra azul.png" alt="Inmagination Travel" className="h-16 w-auto" />
        </div>

        {/* Título */}
        <h1 className="font-playfair text-2xl font-bold text-center text-[#1C1C2E] mb-2">
          Presupuesto Privado
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
          Por motivos de seguridad, introduce el email asociado a esta solicitud para ver los detalles.
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E8445A] focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          {error && (
            <p className="text-[#E8445A] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors uppercase tracking-wide"
            style={{ background: 'linear-gradient(135deg, #E8445A, #C2185B)' }}
          >
            {loading ? 'Verificando...' : 'Ver mi oferta'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Inmagination Travel · Presupuesto privado
        </p>
      </div>

      {/* Eslogan */}
      <p className="mt-6 text-white/40 text-xs italic text-center">
        "Viajar es invertir en recuerdos"
      </p>
    </div>
  )
}
