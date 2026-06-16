import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, EMAIL_FROM, EMAIL_AGENCIA } from '@/lib/resend'
import { emailAgenteHTML } from '@/lib/emails/agente'

function formatPrecio(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { presupuesto_id, token, viajeros, extras_seleccionados, pago_flexible, notas_cliente, telefono_reserva } = body

  if (!presupuesto_id || !token) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: presupuesto } = await supabase
    .from('presupuestos')
    .select('*')
    .eq('id', presupuesto_id)
    .eq('token', token)
    .single()

  if (!presupuesto) {
    return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
  }

  // Guardar viajeros
  if (viajeros?.length > 0) {
    await supabase.from('viajeros').insert(
      viajeros.map((v: any) => ({ ...v, presupuesto_id }))
    )
  }

  // Actualizar extras seleccionados por el cliente
  if (extras_seleccionados?.length > 0) {
    await supabase
      .from('presupuesto_extras')
      .update({ seleccionado_cliente: true })
      .eq('presupuesto_id', presupuesto_id)
      .in('id', extras_seleccionados)
  }

  // Guardar confirmación
  await supabase.from('confirmaciones').insert({
    presupuesto_id,
    pago_flexible: pago_flexible ?? false,
    notas_cliente: notas_cliente || null,
    telefono_reserva: telefono_reserva || null,
  })

  // Actualizar estado
  await supabase
    .from('presupuestos')
    .update({ estado: 'confirmado' })
    .eq('id', presupuesto_id)

  // Enviar email al agente si hay email configurado
  if (EMAIL_AGENCIA) {
    const { data: extrasDB } = await supabase
      .from('presupuesto_extras')
      .select('precio_personalizado, extra:extras_catalogo(nombre)')
      .eq('presupuesto_id', presupuesto_id)
      .in('id', extras_seleccionados ?? [])

    const extrasSeleccionados = (extrasDB ?? []).map((e: any) => ({
      nombre: e.extra?.nombre ?? '',
      precio: formatPrecio(e.precio_personalizado),
    }))

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const linkAdmin = `${baseUrl}/admin/presupuesto/${presupuesto_id}`

    const html = emailAgenteHTML({
      clienteNombre: presupuesto.cliente_nombre,
      clienteEmail: presupuesto.cliente_email,
      clienteTelefono: presupuesto.cliente_telefono,
      destino: presupuesto.destino,
      hotel: presupuesto.hotel,
      fechaInicio: presupuesto.fecha_inicio,
      fechaFin: presupuesto.fecha_fin,
      precioTotal: formatPrecio(presupuesto.precio_total),
      extrasSeleccionados,
      pagoFlexible: pago_flexible ?? false,
      notasCliente: notas_cliente,
      telefonoReserva: telefono_reserva,
      linkAdmin,
    })

    await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_AGENCIA,
      subject: `🎉 Nueva confirmación de reserva — ${presupuesto.cliente_nombre}`,
      html,
    })
  }

  return NextResponse.json({ ok: true })
}
