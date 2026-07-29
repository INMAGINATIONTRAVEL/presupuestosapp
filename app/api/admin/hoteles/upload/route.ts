import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const path = `hoteles-catalogo/${Date.now()}.${ext}`

  const admin = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const { data, error } = await admin.storage
    .from('IMAGENES')
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = admin.storage.from('IMAGENES').getPublicUrl(path)
  return NextResponse.json({ url: urlData.publicUrl })
}
