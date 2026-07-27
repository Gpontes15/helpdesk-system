import { login, getCurrentUser } from "@/actions/auth-actions"
import { redirect } from "next/navigation"

// Força dinâmico para evitar cache
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  // Se já estiver logado, manda direto pra home (não mostra a tela de login)
  const user = await getCurrentUser()
  if (user) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-300/40 p-8 border border-slate-200">

        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 mb-4 shadow-lg shadow-indigo-600/30">
            <span className="text-white text-2xl font-black">H</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Helpdesk</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Sistema de Chamados</p>
        </div>

        {/* Formulário */}
        <form action={login} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Usuário
            </label>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-900 font-medium transition placeholder:text-slate-400"
              placeholder="Digite seu usuário..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Senha
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-900 font-medium transition placeholder:text-slate-400"
              placeholder="Sua senha..."
            />
          </div>

          {/* Checkbox "Lembrar de mim" */}
          <div className="flex items-center gap-2">
            <input
              id="lembrar"
              name="lembrar"
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="lembrar" className="text-sm text-slate-600 font-medium cursor-pointer select-none">
              Manter conectado neste dispositivo
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>

        {/* Rodapé */}
        <div className="mt-8 text-center border-t border-slate-100 pt-5">
          <p className="text-sm text-slate-400 font-medium">
            Problemas com acesso? Procure a TI.
          </p>
        </div>
      </div>
    </div>
  )
}