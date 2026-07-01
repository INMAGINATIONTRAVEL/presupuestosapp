import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { emailRecordatorioHTML } from '@/lib/emails/recordatorio'

// Llamar cada hora desde cron-job.org:
// GET https://presupuestos.inmaginationtravel.com/api/recordatorio-presupuesto?secret=TU_SECRETO
// Con cabecera o query param para seguridad básica

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  // Buscar presupuestos enviados hace entre 11h y 13h (aún sin abrir)
  const ahora = new Date()
  const hace11h = new Date(ahora.getTime() - 11 * 60 * 60 * 1000).toISOString()
  const hace13h = new Date(ahora.getTime() - 13 * 60 * 60 * 1000).toISOString()

  const { data: pendientes } = await supabase
    .from('presupuestos')
    .select('id, token, cliente_nombre, cliente_email, destino, fecha_expiracion')
    .eq('estado', 'enviado')
    .gte('created_at', hace13h)
    .lte('created_at', hace11h)

  if (!pendientes || pendientes.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  let enviados = 0
  for (const p of pendientes) {
    const linkPresupuesto = `${baseUrl}/presupuesto/${p.token}`
    const html = emailRecordatorioHTML({
      nombre: p.cliente_nombre.split(' ')[0],
      destino: p.destino,
      linkPresupuesto,
      fechaExpiracion: p.fecha_expiracion,
    })

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: p.cliente_email,
      subject: `⏰ ${p.cliente_nombre.split(' ')[0]}, tu propuesta de viaje a ${p.destino} sigue esperándote`,
      html,
    })

    if (!error) enviados++
  }

  return NextResponse.json({ ok: true, enviados })
}
