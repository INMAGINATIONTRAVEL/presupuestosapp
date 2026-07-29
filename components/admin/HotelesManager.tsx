'use client'

import { useState, useRef } from 'react'

interface Hotel {
  id: string
  nombre: string
  imagen_url: string | null
  activo: boolean
  orden: number
}

export default function HotelesManager({ hoteles: hotelesIniciales }: { hoteles: Hotel[] }) {
  const [hoteles, setHoteles] = useState(hotelesIniciales)
  const [showNuevo, setShowNuevo] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [editNombre, setEditNombre] = useState('')
  const [subiendoId, setSubiendoId] = useState<string | null>(null)
  const [importando, setImportando] = useState(false)
  const dragIndex = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  async function api(method: string, body: object) {
    const res = await fetch('/api/admin/hoteles', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Error desconocido')
    return json
  }

  async function subirImagen(hotelId: string, file: File, onUrl: (url: string) => void) {
    setSubiendoId(hotelId)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/hoteles/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al subir la imagen')
      onUrl(json.url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubiendoId(null)
    }
  }

  async function crear() {
    if (!nuevoNombre.trim()) return
    setGuardando(true)
    setError('')
    try {
      const nuevo = await api('POST', { nombre: nuevoNombre.trim(), orden: hoteles.length + 1 })
      setHoteles(prev => [...prev, nuevo])
      setNuevoNombre('')
      setShowNuevo(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  async function guardarNombre(id: string) {
    try {
      await api('PATCH', { id, nombre: editNombre })
      setHoteles(prev => prev.map(h => h.id === id ? { ...h, nombre: editNombre } : h))
      setEditandoId(null)
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function actualizarImagen(id: string, url: string) {
    try {
      await api('PATCH', { id, imagen_url: url })
      setHoteles(prev => prev.map(h => h.id === id ? { ...h, imagen_url: url } : h))
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function toggleActivo(hotel: Hotel) {
    try {
      await api('PATCH', { id: hotel.id, activo: !hotel.activo })
      setHoteles(prev => prev.map(h => h.id === hotel.id ? { ...h, activo: !h.activo } : h))
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este hotel del catálogo?')) return
    try {
      await api('DELETE', { id })
      setHoteles(prev => prev.filter(h => h.id !== id))
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function importarHoteles() {
    setImportando(true)
    setError('')
    try {
      const res = await fetch('/api/admin/hoteles/seed', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      const { data } = await fetch('/api/admin/hoteles').then(r => r.json().then(d => ({ data: d })))
      setHoteles(data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setImportando(false)
    }
  }

  async function reordenar(fromIndex: number, toIndex: number) {
    const nuevos = [...hoteles]
    const [moved] = nuevos.splice(fromIndex, 1)
    nuevos.splice(toIndex, 0, moved)
    setHoteles(nuevos)
    await Promise.all(nuevos.map((h, i) =>
      api('PATCH', { id: h.id, orden: i + 1 })
    ))
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {hoteles.length === 0 ? (
          <div className="text-center py-12 text-gray-400 space-y-4">
            <div className="text-4xl">🏨</div>
            <p>No hay hoteles en el catálogo</p>
            <button
              onClick={importarHoteles}
              disabled={importando}
              className="mx-auto flex items-center gap-2 bg-[#1C1C2E] hover:bg-[#2d2d45] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {importando ? '⏳ Importando...' : '📋 Importar lista de hoteles predeterminada'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {hoteles.map((hotel, idx) => (
              <div
                key={hotel.id}
                draggable
                onDragStart={() => { dragIndex.current = idx }}
                onDragOver={e => { e.preventDefault(); setDragOver(idx) }}
                onDrop={() => {
                  if (dragIndex.current !== null && dragIndex.current !== idx) reordenar(dragIndex.current, idx)
                  dragIndex.current = null; setDragOver(null)
                }}
                onDragEnd={() => { dragIndex.current = null; setDragOver(null) }}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${dragOver === idx ? 'bg-purple-50' : ''} ${!hotel.activo ? 'opacity-50' : ''}`}
              >
                <span className="text-gray-300 cursor-grab active:cursor-grabbing text-xl select-none flex-shrink-0">⠿</span>

                {/* Imagen con botón de cambio */}
                <label className={`relative flex-shrink-0 cursor-pointer group ${subiendoId === hotel.id ? 'opacity-50' : ''}`}>
                  {hotel.imagen_url ? (
                    <img src={hotel.imagen_url} alt={hotel.nombre} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl">🏨</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs">{subiendoId === hotel.id ? '⏳' : '📎'}</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" disabled={subiendoId === hotel.id}
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        subirImagen(hotel.id, e.target.files[0], url => actualizarImagen(hotel.id, url))
                      }
                    }} />
                </label>

                {/* Nombre */}
                <div className="flex-1 min-w-0">
                  {editandoId === hotel.id ? (
                    <div className="flex gap-2">
                      <input value={editNombre} onChange={e => setEditNombre(e.target.value)}
                        className="input-admin text-sm py-1 flex-1"
                        onKeyDown={e => { if (e.key === 'Enter') guardarNombre(hotel.id) }}
                        autoFocus />
                      <button onClick={() => guardarNombre(hotel.id)}
                        className="text-xs bg-[#E8445A] text-white px-3 py-1 rounded-lg font-bold">✓</button>
                      <button onClick={() => setEditandoId(null)}
                        className="text-xs text-gray-400 px-2">✕</button>
                    </div>
                  ) : (
                    <p className="font-semibold text-[#1C1C2E] text-sm truncate">{hotel.nombre}</p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActivo(hotel)}
                    className={`text-xs px-2 py-1 rounded-full font-semibold transition-colors hidden sm:block ${hotel.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {hotel.activo ? 'Activo' : 'Inac.'}
                  </button>
                  <button onClick={() => { setEditandoId(hotel.id); setEditNombre(hotel.nombre) }}
                    title="Editar nombre" className="text-gray-400 hover:text-[#E8445A] transition-colors p-1.5 text-sm">✏️</button>
                  <button onClick={() => eliminar(hotel.id)}
                    title="Eliminar" className="text-red-400 hover:text-red-600 text-xs p-1.5">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNuevo ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8445A]/30 space-y-3">
          <h3 className="font-playfair text-lg font-bold text-[#1C1C2E]">Nuevo hotel</h3>
          <input value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)}
            placeholder="Nombre del hotel" className="input-admin"
            onKeyDown={e => { if (e.key === 'Enter') crear() }} autoFocus />
          <div className="flex gap-3">
            <button onClick={() => { setShowNuevo(false); setNuevoNombre(''); setError('') }}
              className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={crear} disabled={guardando || !nuevoNombre.trim()}
              className="flex-1 bg-[#E8445A] hover:bg-[#C2185B] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNuevo(true)}
          className="w-full border-2 border-dashed border-gray-300 hover:border-[#E8445A] text-gray-500 hover:text-[#E8445A] font-semibold py-4 rounded-2xl text-sm transition-colors">
          + Añadir hotel al catálogo
        </button>
      )}
    </div>
  )
}
