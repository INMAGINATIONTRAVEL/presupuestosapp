import { createClient } from '@/lib/supabase/server'
import HotelesManager from '@/components/admin/HotelesManager'

export default async function HotelesPage() {
  const supabase = await createClient()
  const { data: hoteles } = await supabase
    .from('hoteles_catalogo')
    .select('*')
    .order('orden')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#1C1C2E]">Catálogo de Hoteles</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Gestiona los hoteles disponibles para los presupuestos
        </p>
      </div>
      <HotelesManager hoteles={hoteles || []} />
    </div>
  )
}
