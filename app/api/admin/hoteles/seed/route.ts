import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const HOTELES_INICIALES = [
  'Disneyland Hotel',
  'Disney Hotel New York – The Art of Marvel',
  'Disney Newport Bay Club',
  'Disney Sequoia Lodge',
  'Disney Hotel Cheyenne',
  'Disney Hotel Santa Fe',
  'Disney Davy Crockett Ranch',
  'Villages Nature Paris',
  "Hôtel l'Elysée Val d'Europe",
  'Staycity Aparthotels Paris Marne-la-Vallée',
  'Ki Space Hotel & Spa',
  "Aparthotel Adagio Val d'Europe",
  'B&B Hotel près de Disneyland Paris',
  'Campanile Val de France',
  'Explorers Hotel',
  'Grand Magic Hotel',
  'Dream Castle Hotel',
  "Aparthotel Adagio Serris Val d'Europe",
  'Hôtel AKENA Serris Val d\'Europe',
  'Disney Cruise Line',
  'Royal Caribbean',
  'MSC Cruceros',
  'Costa Cruceros',
]

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()

  const { data: existentes } = await admin.from('hoteles_catalogo').select('nombre')
  const nombresExistentes = new Set((existentes || []).map((h: any) => h.nombre))

  const nuevos = HOTELES_INICIALES
    .filter(nombre => !nombresExistentes.has(nombre))
    .map((nombre, i) => ({ nombre, orden: (existentes?.length || 0) + i + 1, activo: true }))

  if (nuevos.length === 0) {
    return NextResponse.json({ insertados: 0, mensaje: 'Todos los hoteles ya existen' })
  }

  const { error } = await admin.from('hoteles_catalogo').insert(nuevos)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ insertados: nuevos.length })
}
