import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { presupuesto_id, token, viajeros, extras_seleccionados, pago_flexible, notas_cliente, telefono_reserva } = body

  if (!presupuesto_id || !token) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const supabase = await createClient()

  // Verificar que el token corresponde al presupuesto
  const { data: presupuesto } = await supabase
    .from('presupuestos')
    .select('id, estado')
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

  // Actualizar estado del presupuesto
  await supabase
    .from('presupuestos')
    .update({ estado: 'confirmado' })
    .eq('id', presupuesto_id)

  return NextResponse.json({ ok: true })
}
