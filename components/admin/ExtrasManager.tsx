'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ExtraCatalogo } from '@/types'

interface FormData {
  nombre: string
  descripcion: string
  precio: string
  imagenUrl: string
  esSeguro: boolean
  subiendo: boolean
}

const FORM_VACIO: FormData = { nombre: '', descripcion: '', precio: '', imagenUrl: '', esSeguro: false, subiendo: false }

function extraToForm(e: ExtraCatalogo): FormData {
  return {
    nombre: e.nombre,
    descripcion: e.descripcion ?? '',
    precio: String(e.precio_referencia),
    imagenUrl: e.imagen_url ?? '',
    esSeguro: e.es_seguro ?? false,
    subiendo: false,
  }
}

function FormExtra({
  titulo,
  initial,
  guardando,
  onSubmit,
  onCancel,
}: {
  titulo: string
  initial: FormData
  guardando: boolean
  onSubmit: (data: FormData) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof Omit<FormData, 'subiendo'>) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  async function subirImagen(file: File) {
    setForm(prev => ({ ...prev, subiendo: true }))
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `extras-catalogo/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('IMAGENES').upload(path, file, { upsert: true })
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('IMAGENES').getPublicUrl(path)
        setForm(prev => ({ ...prev, imagenUrl: urlData.publicUrl, subiendo: false }))
      } else {
        setForm(prev => ({ ...prev, subiendo: false }))
      }
    } catch {
      setForm(prev => ({ ...prev, subiendo: false }))
    }
  }

  return (
    <form
      onSubmit={ev => { ev.preventDefault(); onSubmit(form) }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8445A]/30 space-y-3"
    >
      <h3 className="font-playfair text-lg font-bold text-[#1C1C2E]">{titulo}</h3>
      <div>
        <label className="label-admin">Nombre *</label>
        <input value={form.nombre} onChange={set('nombre')} required
          placeholder="Desayuno con princesas" className="input-admin" />
      </div>
      <div>
        <label className="label-admin">Descripción</label>
        <input value={form.descripcion} onChange={set('descripcion')}
          placeholder="Descripción breve..." className="input-admin" />
      </div>
      <div>
        <label className="label-admin">Precio referencia (€) *</label>
        <input type="number" step="0.01" value={form.precio} onChange={set('precio')} required
          placeholder="89" className="input-admin" />
      </div>
      <div>
        <label className="flex items-center gap-3 cursor-pointer select-none py-1">
          <input
            type="checkbox"
            checked={form.esSeguro}
            onChange={e => setForm(prev => ({ ...prev, esSeguro: e.target.checked }))}
            className="w-4 h-4 accent-[#E8445A]"
          />
          <span className="text-sm font-semibold text-[#1C1C2E]">🛡️ Es un seguro (se suma a la señal)</span>
        </label>
      </div>
      <div>
        <label className="label-admin">Imagen</label>
        <label className={`flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-3 py-3 cursor-pointer hover:border-[#E8445A] transition-colors text-sm text-gray-500 font-semibold mb-2 ${form.subiendo ? 'opacity-50' : ''}`}>
          {form.subiendo ? '⏳ Subiendo...' : '📎 Subir foto'}
          <input type="file" accept="image/*" className="hidden" disabled={form.subiendo}
            onChange={e => { if (e.target.files?.[0]) subirImagen(e.target.files[0]) }} />
        </label>
        <input value={form.imagenUrl} onChange={set('imagenUrl')}
          placeholder="O pega una URL de imagen" className="input-admin text-xs" />
        {form.imagenUrl && (
          <img src={form.imagenUrl} alt="preview" className="mt-2 h-24 w-auto rounded-xl object-cover" />
        )}
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={guardando || form.subiendo}
          className="flex-1 bg-[#E8445A] hover:bg-[#C2185B] text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default function ExtrasManager({ extras: extrasIniciales }: { extras: ExtraCatalogo[] }) {
  const [extras, setExtras] = useState(extrasIniciales)
  const [showNuevo, setShowNuevo] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const dragIndex = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  async function crearExtra(data: FormData) {
    setGuardando(true)
    const supabase = createClient()
    const { data: nuevo } = await supabase
      .from('extras_catalogo')
      .insert({
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        precio_referencia: parseFloat(data.precio),
        imagen_url: data.imagenUrl || null,
        es_seguro: data.esSeguro,
        orden: extras.length + 1,
      })
      .select()
      .single()

    if (nuevo) {
      setExtras(prev => [...prev, nuevo])
      setShowNuevo(false)
    }
    setGuardando(false)
  }

  async function guardarEdicion(id: string, data: FormData) {
    setGuardando(true)
    const supabase = createClient()
    const { data: actualizado } = await supabase
      .from('extras_catalogo')
      .update({
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        precio_referencia: parseFloat(data.precio),
        imagen_url: data.imagenUrl || null,
        es_seguro: data.esSeguro,
      })
      .eq('id', id)
      .select()
      .single()

    if (actualizado) {
      setExtras(prev => prev.map(e => e.id === id ? actualizado : e))
      setEditandoId(null)
    }
    setGuardando(false)
  }

  async function duplicarExtra(extra: ExtraCatalogo) {
    setGuardando(true)
    const supabase = createClient()
    const { data: nuevo } = await supabase
      .from('extras_catalogo')
      .insert({
        nombre: extra.nombre + ' (copia)',
        descripcion: extra.descripcion || null,
        precio_referencia: extra.precio_referencia,
        imagen_url: extra.imagen_url || null,
        orden: extras.length + 1,
      })
      .select()
      .single()

    if (nuevo) {
      setExtras(prev => [...prev, nuevo])
      setEditandoId(nuevo.id)
      setShowNuevo(false)
    }
    setGuardando(false)
  }

  async function toggleActivo(extra: ExtraCatalogo) {
    const supabase = createClient()
    await supabase.from('extras_catalogo').update({ activo: !extra.activo }).eq('id', extra.id)
    setExtras(prev => prev.map(e => e.id === extra.id ? { ...e, activo: !e.activo } : e))
  }

  async function reordenar(fromIndex: number, toIndex: number) {
    const nuevos = [...extras]
    const [moved] = nuevos.splice(fromIndex, 1)
    nuevos.splice(toIndex, 0, moved)
    setExtras(nuevos)
    const supabase = createClient()
    await Promise.all(nuevos.map((e, i) =>
      supabase.from('extras_catalogo').update({ orden: i + 1 }).eq('id', e.id)
    ))
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
            {extras.map((extra, idx) => (
              <div
                key={extra.id}
                draggable={editandoId !== extra.id}
                onDragStart={() => { dragIndex.current = idx }}
                onDragOver={e => { e.preventDefault(); setDragOver(idx) }}
                onDrop={() => {
                  if (dragIndex.current !== null && dragIndex.current !== idx) {
                    reordenar(dragIndex.current, idx)
                  }
                  dragIndex.current = null
                  setDragOver(null)
                }}
                onDragEnd={() => { dragIndex.current = null; setDragOver(null) }}
                className={`transition-colors ${dragOver === idx ? 'bg-purple-50' : ''}`}
              >
                {editandoId === extra.id ? (
                  <div className="p-4">
                    <FormExtra
                      titulo={`Editar: ${extra.nombre}`}
                      initial={extraToForm(extra)}
                      guardando={guardando}
                      onSubmit={data => guardarEdicion(extra.id, data)}
                      onCancel={() => setEditandoId(null)}
                    />
                  </div>
                ) : (
                  <div className={`flex items-center gap-4 px-5 py-4 ${!extra.activo ? 'opacity-50' : ''}`}>
                    <span className="text-gray-300 cursor-grab active:cursor-grabbing text-lg select-none flex-shrink-0">⠿</span>
                    {extra.imagen_url ? (
                      <img src={extra.imagen_url} alt={extra.nombre}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">✨</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1C1C2E]">{extra.nombre}</p>
                        {extra.es_seguro && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">🛡️ Seguro</span>}
                      </div>
                      {extra.descripcion && <p className="text-xs text-gray-500 truncate">{extra.descripcion}</p>}
                      <p className="text-sm font-bold text-[#F5A623]">{extra.precio_referencia} € (referencia)</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleActivo(extra)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                          extra.activo
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}>
                        {extra.activo ? 'Activo' : 'Inactivo'}
                      </button>
                      <button
                        onClick={() => duplicarExtra(extra)}
                        title="Duplicar"
                        className="text-gray-400 hover:text-blue-500 transition-colors px-2 py-1 text-base">
                        📋
                      </button>
                      <button
                        onClick={() => { setEditandoId(extra.id); setShowNuevo(false) }}
                        title="Editar"
                        className="text-gray-400 hover:text-[#E8445A] transition-colors px-2 py-1 text-base">
                        ✏️
                      </button>
                      <button onClick={() => eliminar(extra.id)}
                        title="Eliminar"
                        className="text-red-400 hover:text-red-600 text-sm px-2 py-1">
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario nuevo extra */}
      {showNuevo ? (
        <FormExtra
          titulo="Nuevo extra"
          initial={FORM_VACIO}
          guardando={guardando}
          onSubmit={crearExtra}
          onCancel={() => setShowNuevo(false)}
        />
      ) : (
        <button
          onClick={() => { setShowNuevo(true); setEditandoId(null) }}
          className="w-full border-2 border-dashed border-gray-300 hover:border-[#E8445A] text-gray-500 hover:text-[#E8445A] font-semibold py-4 rounded-2xl text-sm transition-colors">
          + Añadir nuevo extra al catálogo
        </button>
      )}
    </div>
  )
}
