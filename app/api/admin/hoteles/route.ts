import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function checkAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('hoteles_catalogo')
    .select('*')
    .order('orden')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('hoteles_catalogo')
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, ...updates } = await req.json()
  const admin = createAdminClient()
  const { error } = await admin
    .from('hoteles_catalogo')
    .update(updates)
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  const admin = createAdminClient()
  const { error } = await admin
    .from('hoteles_catalogo')
    .delete()
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
