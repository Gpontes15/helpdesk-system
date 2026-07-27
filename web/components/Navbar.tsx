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
    <nav className="bg-slate-900 text-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* --- LOGO E MENU DESKTOP --- */}
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl tracking-wider text-blue-400">
              HELPDESK
            </Link>
            
            {/* Links Visíveis APENAS no Computador (md:flex) */}
            <div className="hidden md:flex items-baseline space-x-4">
              <Link href="/" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition">
                Abrir Chamado
              </Link>
              
              <Link href="/meus-chamados" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition">
                Meus Chamados
              </Link>

              {isTech && (
                 <>
                   <Link href="/admin" className="bg-blue-900 hover:bg-blue-800 text-blue-100 px-3 py-2 rounded-md text-sm font-medium border border-blue-700 transition">
                      Gerenciar Fila
                   </Link>
                   
                   {/* NOVO: Botão da IA no Desktop */}
                   <Link href="/ia" className="bg-indigo-900 hover:bg-indigo-800 text-indigo-100 px-3 py-2 rounded-md text-sm font-medium border border-indigo-700 transition flex items-center gap-2">
                      🤖 Assistente IA
                   </Link>
                 </>
              )}

              {isAdmin && (
                <>
                  <Link href="/admin/relatorios" className="hover:bg-slate-700 text-green-200 px-3 py-2 rounded-md text-sm font-medium transition">
                    📊 Relatórios
                  </Link>
                  <Link href="/admin/estoque" className="hover:bg-slate-700 text-orange-200 px-3 py-2 rounded-md text-sm font-medium transition">
                    📦 Estoque Java
                  </Link>
                  <Link href="/admin/usuarios" className="hover:bg-slate-700 text-yellow-100 px-3 py-2 rounded-md text-sm font-medium transition">
                    👥 Usuários
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* --- LADO DIREITO (DESKTOP) --- */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold">{user.name}</div>
              <div className="text-xs text-gray-400">{user.department || user.role}</div>
            </div>
            
            <form action={logout}>
              <button className="text-sm text-red-400 hover:text-red-300 font-bold border border-red-900/50 px-3 py-1 rounded hover:bg-red-900/20 transition">
                Sair
              </button>
            </form>
          </div>

          {/* --- BOTÃO HAMBÚRGUER (SÓ MOBILE) --- */}
          <div className="md:hidden flex items-center">
             <span className="mr-3 text-sm font-bold text-blue-200">{user.name.split(' ')[0]}</span>
             <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white focus:outline-none p-2"
             >
                {/* Ícone de Menu / Fechar */}
                <span className="text-2xl">{isOpen ? '✖' : '☰'}</span>
             </button>
          </div>
        </div>
      </div>

      {/* --- MENU MOBILE (ABRE AO CLICAR) --- */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            
            <Link href="/" onClick={() => setIsOpen(false)} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              📝 Novo Chamado
            </Link>

            <Link href="/meus-chamados" onClick={() => setIsOpen(false)} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              📋 Meus Chamados
            </Link>

            {isTech && (
               <>
                 <Link href="/admin" onClick={() => setIsOpen(false)} className="bg-blue-900/40 text-blue-200 hover:bg-blue-900 block px-3 py-2 rounded-md text-base font-medium">
                    🔧 Gerenciar Fila (Técnico)
                 </Link>

                 {/* NOVO: Botão da IA no Mobile */}
                 <Link href="/ia" onClick={() => setIsOpen(false)} className="bg-indigo-900/40 text-indigo-200 hover:bg-indigo-900 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2">
                    🤖 Assistente IA
                 </Link>
               </>
            )}

            {isAdmin && (
              <>
                 <Link href="/admin/relatorios" onClick={() => setIsOpen(false)} className="text-green-200 hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium">
                    📊 Relatórios
                 </Link>
                  <Link href="/admin/estoque" className="hover:bg-slate-700 text-orange-200 px-3 py-2 rounded-md text-sm font-medium transition">
                    📦 Estoque Java
                  </Link>
                 <Link href="/admin/usuarios" onClick={() => setIsOpen(false)} className="text-yellow-200 hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium">
                    👥 Cadastrar Usuários
                 </Link>
              </>
            )}

            <form action={logout} className="border-t border-slate-700 mt-4 pt-2">
                <button className="w-full text-left text-red-400 hover:bg-slate-700 hover:text-red-300 block px-3 py-2 rounded-md text-base font-bold">
                   Sair do Sistema
                </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}