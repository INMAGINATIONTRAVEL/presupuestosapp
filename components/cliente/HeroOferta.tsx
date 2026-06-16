interface Props {
  nombre: string
  numero: number
  destino: string
}

export default function HeroOferta({ nombre, numero, destino }: Props) {
  return (
    <div
      className="relative w-full min-h-64 flex flex-col items-center justify-center text-center px-6 py-12 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1C1C2E 0%, #2d1b4e 50%, #1C1C2E 100%)',
      }}
    >
      {/* Partículas decorativas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-6 left-8 text-[#F5A623] text-2xl opacity-60 animate-pulse">✦</div>
        <div className="absolute top-12 right-12 text-[#E8445A] text-lg opacity-40 animate-pulse delay-300">✦</div>
        <div className="absolute bottom-8 left-16 text-[#F5A623] text-sm opacity-50 animate-pulse delay-700">✦</div>
        <div className="absolute bottom-6 right-8 text-white text-xl opacity-30 animate-pulse delay-500">✦</div>
      </div>

      {/* Logo */}
      <div className="mb-5">
        <img src="/logo letra blanca.svg" alt="Inmagination Travel" className="h-12 w-auto opacity-90" />
      </div>

      {/* Badge número */}
      <div className="border border-white/30 rounded-full px-5 py-1.5 mb-5 backdrop-blur-sm">
        <span className="text-white/80 text-xs font-medium uppercase tracking-widest">
          Presupuesto #{numero}
        </span>
      </div>

      {/* Saludo */}
      <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
        ¡Hola,{' '}
        <span className="text-[#F5A623]">
          {nombre.toUpperCase()}
        </span>
        !
      </h1>

      <p className="text-white/70 text-sm font-light">
        Aquí comienza tu sueño en{' '}
        <span className="text-[#E8445A] font-semibold">{destino}</span>
      </p>
    </div>
  )
}
