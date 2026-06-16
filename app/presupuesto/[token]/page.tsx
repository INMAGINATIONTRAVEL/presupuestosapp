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
    const wa = process.env.NEXT_PUBLIC_WHATSAPP_AGENCIA || '635593582'
    const email = process.env.EMAIL_AGENCIA || 'reservas@inmaginationtravel.com'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #1C1C2E 0%, #2d1b4e 60%, #1C1C2E 100%)' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="font-playfair text-2xl font-bold text-[#1C1C2E] mb-2">
            Tu propuesta ha caducado
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Esta oferta ya no está disponible, pero podemos prepararte una nueva propuesta actualizada.
            ¡Contáctanos y lo gestionamos enseguida!
          </p>
          <a
            href={`https://wa.me/34${wa}?text=Hola%2C%20mi%20presupuesto%20ha%20caducado%20y%20me%20gustar%C3%ADa%20renovarlo`}
            className="flex items-center justify-center gap-2 w-full text-white font-bold py-4 rounded-2xl transition-colors mb-3"
            style={{ background: '#25D366' }}
          >
            <span>💬</span> Escríbenos por WhatsApp
          </a>
          <a
            href={`mailto:${email}?subject=Renovar%20presupuesto%20de%20viaje`}
            className="flex items-center justify-center gap-2 w-full border-2 border-[#E8445A] text-[#E8445A] font-bold py-3 rounded-2xl transition-colors hover:bg-[#E8445A] hover:text-white text-sm"
          >
            ✉️ {email}
          </a>
          <p className="text-xs text-gray-400 mt-6 italic">"Viajar es invertir en recuerdos"</p>
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
