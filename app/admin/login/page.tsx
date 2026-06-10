import LoginForm from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#1C1C2E] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="font-playfair text-2xl font-bold text-white">
            Inmagination Travel
          </h1>
          <p className="text-gray-400 text-sm mt-1">Panel de administración</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
