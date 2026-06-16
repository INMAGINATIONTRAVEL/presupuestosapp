import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  await supabase.from('extras_catalogo').select('id').limit(1)
  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
