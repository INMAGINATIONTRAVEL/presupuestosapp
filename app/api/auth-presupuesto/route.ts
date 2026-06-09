import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { token, email } = await req.json()

  if (!token || !email) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: presupuesto } = await supabase
    .from('presupuestos')
    .select('cliente_email')
    .eq('token', token)
    .single()

  if (!presupuesto) {
    return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
  }

  // Comparar email (case insensitive)
  if (presupuesto.cliente_email.toLowerCase() !== email.toLowerCase().trim()) {
    return NextResponse.json({ error: 'Email incorrecto' }, { status: 401 })
  }

  // Guardar sesión en cookie
  const response = NextResponse.json({ ok: true })
  response.cookies.set(`sesion_${token}`, presupuesto.cliente_email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  })

  return response
}
