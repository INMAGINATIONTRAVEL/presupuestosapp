'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ExtraCatalogo } from '@/types'

export default function ExtrasManager({ extras: extrasIniciales }: { extras: ExtraCatalogo[] }) {
  const [extras, setExtras] = useState(extrasIniciales)
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [guardando, setGuardando] = useState(false)
  const router = useRouter()

  async function crearExtra(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('extras_catalogo')
      .insert({
        nombre,
        descripcion: descripcion || null,
        precio_referencia: parseFloat(precio),
        imagen_url: imagenUrl || null,
        orden: extras.length + 1,
      })
      .select()
      .single()

    if (data) {
      setExtras(prev => [...prev, data])
      setNombre(''); setDescripcion(''); setPrecio(''); setImagenUrl('')
      setShowForm(false)
    }
    setGuardando(false)
  }

  async function toggleActivo(extra: ExtraCatalogo) {
    const supabase = createClient()
    await supabase.from('extras_catalogo').update({ activo: !extra.activo }).eq('id', extra.id)
    setExtras(prev => prev.map(e => e.id === extra.id ? { ...e, activo: !e.activo } : e))
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este extra del catálogo?')) return
    const supabase = createClient()
    await supabase.from('extras_catalogo').delete().eq('id', id)
    setExtras(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {extras.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">✨</div>
            <p>No hay extras en el catálogo</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {extras.map(extra => (
              <div key={extra.id} className={`flex items-center gap-4 px-5 py-4 ${!extra.activo ? 'opacity-50' : ''}`}>
                {extra.imagen_url ? (
                  <img src={extra.imagen_url} alt={extra.nombre} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">✨</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1C1C2E]">{extra.nombre}</p>
                  {extra.descripcion && <p className="text-xs text-gray-500 truncate">{extra.descripcion}</p>}
                  <p className="text-sm font-bold text-[#F5A623]">{extra.precio_referencia} € (referencia)</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActivo(extra)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                      extra.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {extra.activo ? 'Activo' : 'Inactivo'}
                  </button>
                  <button onClick={() => eliminar(extra.id)}
                    className="text-red-400 hover:text-red-600 text-sm px-2 py-1">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario nuevo extra */}
      {showForm ? (
        <form onSubmit={crearExtra} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-playfair text-lg font-bold text-[#1C1C2E]">Nuevo extra</h3>
          <div>
            <label className="label-admin">Nombre *</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} required
              placeholder="Desayuno con princesas" className="input-admin" />
          </div>
          <div>
            <label className="label-admin">Descripción</label>
            <input value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Descripción breve..." className="input-admin" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-admin">Precio referencia (€) *</label>
              <input type="number" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} required
                placeholder="89" className="input-admin" />
            </div>
            <div>
              <label className="label-admin">URL imagen</label>
              <input value={imagenUrl} onChange={e => setImagenUrl(e.target.value)}
                placeholder="https://..." className="input-admin" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={guardando}
              className="flex-1 bg-[#E8445A] hover:bg-[#C2185B] text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
              {guardando ? 'Guardando...' : 'Añadir extra'}
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-300 hover:border-[#E8445A] text-gray-500 hover:text-[#E8445A] font-semibold py-4 rounded-2xl text-sm transition-colors">
          + Añadir nuevo extra al catálogo
        </button>
      )}
    </div>
  )
}
