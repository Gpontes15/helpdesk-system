'use client'
import { useState } from 'react'
import Link from 'next/link'
import { logout } from '@/actions/auth-actions'

export function Navbar({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  // Se não estiver logado, não mostra nada
  if (!user) return null
  const isAdmin = user.role === 'ADMIN'
  const isTech = user.role === 'TECH' || isAdmin

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* --- LOGO E MENU DESKTOP --- */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tight">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm font-black">H</span>
              <span className="text-white">Helpdesk</span>
            </Link>

            {/* Links Visíveis APENAS no Computador (md:flex) */}
            <div className="hidden md:flex items-baseline space-x-1">
              <Link href="/" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">
                Abrir Chamado
              </Link>

              <Link href="/meus-chamados" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">
                Meus Chamados
              </Link>
              {isTech && (
                 <>
                   <Link href="/admin" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">
                      Gerenciar Fila
                   </Link>

                   <Link href="/ia" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1.5">
                      Assistente IA
                   </Link>
                 </>
              )}
              {isAdmin && (
                <>
                  <Link href="/admin/relatorios" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">
                    Relatórios
                  </Link>
                  <Link href="/admin/estoque" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">
                    Estoque
                  </Link>
                  <Link href="/admin/usuarios" className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">
                    Usuários
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* --- LADO DIREITO (DESKTOP) --- */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{user.name}</div>
              <div className="text-xs text-slate-400">{user.department || user.role}</div>
            </div>

            <form action={logout}>
              <button className="text-sm text-slate-300 hover:text-white font-medium border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-800 transition">
                Sair
              </button>
            </form>
          </div>
          {/* --- BOTÃO HAMBÚRGUER (SÓ MOBILE) --- */}
          <div className="md:hidden flex items-center">
             <span className="mr-3 text-sm font-semibold text-slate-200">{user.name.split(' ')[0]}</span>
             <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-300 hover:text-white focus:outline-none p-2"
             >
                <span className="text-2xl">{isOpen ? '✖' : '☰'}</span>
             </button>
          </div>
        </div>
      </div>
      {/* --- MENU MOBILE (ABRE AO CLICAR) --- */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">

            <Link href="/" onClick={() => setIsOpen(false)} className="text-slate-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Novo Chamado
            </Link>
            <Link href="/meus-chamados" onClick={() => setIsOpen(false)} className="text-slate-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Meus Chamados
            </Link>
            {isTech && (
               <>
                 <Link href="/admin" onClick={() => setIsOpen(false)} className="text-slate-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                    Gerenciar Fila
                 </Link>
                 <Link href="/ia" onClick={() => setIsOpen(false)} className="bg-indigo-600 text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium">
                    Assistente IA
                 </Link>
               </>
            )}
            {isAdmin && (
              <>
                 <Link href="/admin/relatorios" onClick={() => setIsOpen(false)} className="text-slate-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                    Relatórios
                 </Link>
                  <Link href="/admin/estoque" onClick={() => setIsOpen(false)} className="text-slate-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                    Estoque
                  </Link>
                 <Link href="/admin/usuarios" onClick={() => setIsOpen(false)} className="text-slate-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                    Cadastrar Usuários
                 </Link>
              </>
            )}
            <form action={logout} className="border-t border-slate-700 mt-4 pt-2">
                <button className="w-full text-left text-slate-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                   Sair do Sistema
                </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}