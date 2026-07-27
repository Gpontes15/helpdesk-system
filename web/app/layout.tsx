import "./globals.css"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/Navbar"
import { getCurrentUser } from "@/actions/auth-actions"
import { NotificationWatcher } from "@/components/NotificationWatcher" // <-- Importação do Vigia

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Helpdesk Supermercado",
  description: "Sistema de Chamados Interno",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Busca o usuário aqui no servidor
  const user = await getCurrentUser()

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        
        {/* 2. Passa o usuário para o componente Cliente */}
        <Navbar user={user} />
        
        {/* 3. VIGIA GLOBAL: Funciona para TI e para Usuários Comuns, mas só se estiver logado! */}
        {user && <NotificationWatcher />}
        
        <div className="pt-4 min-h-screen bg-gray-100">
          {children}
        </div>
        
      </body>
    </html>
  )
}