'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const links = [
    { href: '/admin', label: '📋 Presupuestos' },
    { href: '/admin/extras', label: '✨ Extras' },
    { href: '/admin/nuevo', label: '＋ Nuevo' },
  ]

  return (
    <nav className="bg-[#1C1C2E] border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {/* Logo - fila propia y centrado en móvil, a la izquierda en desktop */}
        <div className="flex justify-center sm:justify-start py-4 sm:py-3">
          <img src="/logo letra blanca.png" alt="Inmagination Travel" className="h-16 sm:h-20 w-auto" />
        </div>

        {/* Links + usuario - debajo en móvil, a la derecha en desktop */}
        <div className="flex items-center justify-between sm:justify-end gap-2 py-3 border-t border-white/5 sm:border-t-0">
          <div className="flex items-center gap-1 overflow-x-auto">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-[#E8445A] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-gray-500 text-xs hidden md:block">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
