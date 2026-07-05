import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NuevoPresupuestoForm from '@/components/admin/NuevoPresupuestoForm'

export default async function EditarPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: presupuesto } = await supabase
    .from('presupuestos')
    .select('*')
    .eq('id', id)
    .single()

  if (!presupuesto) return notFound()

  const { data: extrasActuales } = await supabase
    .from('presupuesto_extras')
    .select('extra_id, precio_personalizado')
    .eq('presupuesto_id', id)

  const { data: extrasCatalogo } = await supabase
    .from('extras_catalogo')
    .select('*')
    .eq('activo', true)
    .order('orden')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#1C1C2E]">
          Editar presupuesto #{presupuesto.numero}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{presupuesto.cliente_nombre}</p>
      </div>
      <NuevoPresupuestoForm
        extrasCatalogo={extrasCatalogo || []}
        editando={{
          id,
          presupuesto,
          extrasActuales: extrasActuales || [],
        }}
      />
    </div>
  )
}
