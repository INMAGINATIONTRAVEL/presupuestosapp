import LoginForm from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#1C1C2E] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img
            src="/logo letra blanca.png"
            alt="Inmagination Travel"
            className="max-w-xs w-full h-auto mx-auto mb-3"
          />
          <p className="text-gray-400 text-sm">Panel de administración</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
