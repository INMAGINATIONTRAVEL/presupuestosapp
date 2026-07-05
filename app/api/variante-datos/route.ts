import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const supabase = await createClient()

  const { data: p } = await supabase
    .from('presupuestos')
    .select('*')
    .eq('id', id)
    .single()

  if (!p) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const { data: extras } = await supabase
    .from('presupuesto_extras')
    .select('*, extra:extras_catalogo(*)')
    .eq('presupuesto_id', id)
    .order('created_at')

  return NextResponse.json({ ...p, extras: extras || [] })
}
