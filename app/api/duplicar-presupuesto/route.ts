import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { presupuesto_id } = await req.json()
  if (!presupuesto_id) return NextResponse.json({ error: 'Falta presupuesto_id' }, { status: 400 })

  const supabase = await createClient()

  const { data: original } = await supabase
    .from('presupuestos')
    .select('*')
    .eq('id', presupuesto_id)
    .single()

  if (!original) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const { data: nuevo, error } = await supabase
    .from('presupuestos')
    .insert({
      cliente_nombre: original.cliente_nombre,
      cliente_email: original.cliente_email,
      cliente_telefono: original.cliente_telefono,
      destino: original.destino,
      fecha_inicio: original.fecha_inicio,
      fecha_fin: original.fecha_fin,
      hotel: original.hotel,
      hotel_imagen_url: original.hotel_imagen_url,
      tipo_habitacion: original.tipo_habitacion,
      plan_comidas: original.plan_comidas,
      incluye_vuelos: original.incluye_vuelos,
      detalles_vuelos: original.detalles_vuelos,
      descripcion_oferta: original.descripcion_oferta,
      habitaciones: original.habitaciones,
      precio_total: original.precio_total,
      precio_senal: original.precio_senal,
      estado: 'borrador',
      fecha_expiracion: null,
      notas_internas: original.notas_internas,
    })
    .select()
    .single()

  if (error || !nuevo) return NextResponse.json({ error: error?.message }, { status: 500 })

  // Copiar extras
  const { data: extras } = await supabase
    .from('presupuesto_extras')
    .select('extra_id, precio_personalizado')
    .eq('presupuesto_id', presupuesto_id)

  if (extras && extras.length > 0) {
    await supabase.from('presupuesto_extras').insert(
      extras.map(e => ({
        presupuesto_id: nuevo.id,
        extra_id: e.extra_id,
        precio_personalizado: e.precio_personalizado,
      }))
    )
  }

  return NextResponse.json({ id: nuevo.id })
}
