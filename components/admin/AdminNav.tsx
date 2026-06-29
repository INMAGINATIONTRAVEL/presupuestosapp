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
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/logo letra blanca.png" alt="Inmagination Travel" className="h-20 w-auto" />
        </div>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-[#E8445A] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs hidden sm:block">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
