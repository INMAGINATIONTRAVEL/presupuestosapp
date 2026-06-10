import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EmailGate from '@/components/cliente/EmailGate'
import OfertaPage from '@/components/cliente/OfertaPage'
import { cookies } from 'next/headers'
import type { PresupuestoCompleto } from '@/types'

interface Props {
  params: Promise<{ token: string }>
  searchParams: Promise<{ acceso?: string }>
}

export default async function PresupuestoPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  // Buscar el presupuesto por token
  const { data: presupuesto, error } = await supabase
    .from('presupuestos')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !presupuesto) return notFound()

  // Comprobar si expiró
  if (presupuesto.fecha_expiracion && new Date(presupuesto.fecha_expiracion) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oferta expirada</h1>
          <p className="text-gray-500">Esta oferta ya no está disponible. Contacta con tu agente.</p>
        </div>
      </div>
    )
  }

  // Verificar si el cliente ya se autenticó (cookie de sesión)
  const cookieStore = await cookies()
  const sesionToken = cookieStore.get(`sesion_${token}`)?.value
  const autenticado = sesionToken === presupuesto.cliente_email

  // Si no está autenticado, mostrar email gate
  if (!autenticado) {
    return <EmailGate token={token} emailCliente={presupuesto.cliente_email} />
  }

  // Marcar como visto
  await supabase.rpc('marcar_visto', { p_token: token })

  // Cargar extras del presupuesto
  const { data: extras } = await supabase
    .from('presupuesto_extras')
    .select('*, extra:extras_catalogo(*)')
    .eq('presupuesto_id', presupuesto.id)
    .order('created_at')

  const presupuestoCompleto: PresupuestoCompleto = {
    ...presupuesto,
    extras: extras || [],
  }

  return <OfertaPage presupuesto={presupuestoCompleto} />
}
