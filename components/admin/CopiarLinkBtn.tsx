'use client'

import { useState } from 'react'

export default function CopiarLinkBtn({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <button onClick={copiar}
      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
        copiado ? 'bg-green-500 text-white' : 'bg-[#E8445A] hover:bg-[#C2185B] text-white'
      }`}>
      {copiado ? '✓ Copiado' : 'Copiar'}
    </button>
  )
}
