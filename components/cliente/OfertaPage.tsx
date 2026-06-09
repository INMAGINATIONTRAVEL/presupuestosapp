'use client'
// TODO: se construye en el siguiente paso
import type { PresupuestoCompleto } from '@/types'

export default function OfertaPage({ presupuesto }: { presupuesto: PresupuestoCompleto }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Cargando oferta #{presupuesto.numero}...</p>
    </div>
  )
}
