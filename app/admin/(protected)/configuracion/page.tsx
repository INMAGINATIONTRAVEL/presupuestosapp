import CambiarPasswordForm from '@/components/admin/CambiarPasswordForm'
import { createClient } from '@/lib/supabase/server'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#1C1C2E]">Configuración</h1>
        <p className="text-gray-500 text-sm mt-0.5">Ajustes de tu cuenta</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-[#1C1C2E] mb-1 text-sm uppercase tracking-wide">Cuenta</h2>
        <p className="text-sm text-gray-500 mb-5">{user?.email}</p>

        <h3 className="font-bold text-[#1C1C2E] mb-4">Cambiar contraseña</h3>
        <CambiarPasswordForm />
      </div>
    </div>
  )
}
