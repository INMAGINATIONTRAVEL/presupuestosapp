import { createClient } from '@/lib/supabase/server'
import ExtrasManager from '@/components/admin/ExtrasManager'

export default async function ExtrasPage() {
  const supabase = await createClient()
  const { data: extras } = await supabase
    .from('extras_catalogo')
    .select('*')
    .order('orden')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#1C1C2E]">Catálogo de Extras</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Gestiona los extras que puedes proponer en cada presupuesto
        </p>
      </div>
      <ExtrasManager extras={extras || []} />
    </div>
  )
}
