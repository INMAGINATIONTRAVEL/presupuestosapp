import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest) {
  const { presupuesto_id } = await req.json()
  if (!presupuesto_id) return NextResponse.json({ error: 'Falta presupuesto_id' }, { status: 400 })

  const supabase = await createClient()

  // Eliminar tablas hijas primero (por si no hay CASCADE configurado)
  await supabase.from('viajeros').delete().eq('presupuesto_id', presupuesto_id)
  await supabase.from('confirmaciones').delete().eq('presupuesto_id', presupuesto_id)
  await supabase.from('presupuesto_extras').delete().eq('presupuesto_id', presupuesto_id)

  const { error } = await supabase.from('presupuestos').delete().eq('id', presupuesto_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
