import NuevoPresupuestoForm from '@/components/admin/NuevoPresupuestoForm'
import { createClient } from '@/lib/supabase/server'

export default async function NuevoPresupuestoPage() {
  const supabase = await createClient()
  const { data: extras } = await supabase
    .from('extras_catalogo')
    .select('*')
    .eq('activo', true)
    .order('orden')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#1C1C2E]">
          Nuevo Presupuesto
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Rellena los datos para crear el presupuesto del cliente
        </p>
      </div>
      <NuevoPresupuestoForm extrasCatalogo={extras || []} />
    </div>
  )
}
