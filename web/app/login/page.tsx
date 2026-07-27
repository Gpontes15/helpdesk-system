import { login, getCurrentUser } from "@/actions/auth-actions"
import { redirect } from "next/navigation"

// Força dinâmico para evitar cache
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  // Se já estiver logado, manda direto pra home (não mostra a tela de login)
  const user = await getCurrentUser()
  if (user) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-700">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Helpdesk</h1>
          <p className="text-gray-700 text-base mt-2 font-semibold">Sistema de Chamados</p>
        </div>

        {/* Formulário */}
        <form action={login} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Usuário
            </label>
            <input 
              name="username" 
              type="text" 
              required 
              autoComplete="username"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white text-gray-900 font-medium transition"
              placeholder="Digite seu usuário..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Senha
            </label>
            <input 
              name="password" 
              type="password" 
              required 
              autoComplete="current-password"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white text-gray-900 font-medium transition"
              placeholder="Sua senha..."
            />
          </div>

          {/* Checkbox "Lembrar de mim" */}
          <div className="flex items-center gap-2">
            <input 
              id="lembrar"
              name="lembrar" 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
            />
            <label htmlFor="lembrar" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
              Manter conectado neste dispositivo
            </label>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg py-3 rounded-lg transition shadow-md active:scale-95 transform"
          >
            ENTRAR
          </button>
        </form>

        {/* Rodapé */}
        <div className="mt-8 text-center border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 font-medium">
            Problemas com acesso? Procure a TI.
          </p>
        </div>
      </div>
    </div>
  )
}