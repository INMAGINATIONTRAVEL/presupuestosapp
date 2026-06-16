import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { emailClienteHTML } from '@/lib/emails/cliente'

function calcularNoches(inicio: string, fin: string) {
  const d1 = new Date(inicio)
  const d2 = new Date(fin)
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export async function POST(req: NextRequest) {
  const { presupuesto_id } = await req.json()

  if (!presupuesto_id) {
    return NextResponse.json({ error: 'Falta presupuesto_id' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: p } = await supabase
    .from('presupuestos')
    .select('*')
    .eq('id', presupuesto_id)
    .single()

  if (!p) {
    return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const linkPresupuesto = `${baseUrl}/presupuesto/${p.token}`
  const noches = calcularNoches(p.fecha_inicio, p.fecha_fin)

  const html = emailClienteHTML({
    nombre: p.cliente_nombre,
    destino: p.destino,
    hotel: p.hotel,
    fechaInicio: p.fecha_inicio,
    fechaFin: p.fecha_fin,
    noches,
    linkPresupuesto,
    fechaExpiracion: p.fecha_expiracion,
  })

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: p.cliente_email,
    subject: `✨ Tu propuesta de viaje a ${p.destino} está lista | Inmagination Travel`,
    html,
  })

  if (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Marcar como enviado si era borrador
  if (p.estado === 'borrador') {
    await supabase
      .from('presupuestos')
      .update({ estado: 'enviado' })
      .eq('id', presupuesto_id)
  }

  return NextResponse.json({ ok: true })
}
