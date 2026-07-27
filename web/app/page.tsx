import { prisma } from "@/lib/db"
import { TicketForm } from "@/components/TicketForm"
import { getCurrentUser, logout } from "@/actions/auth-actions"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

// Função auxiliar para formatar data (ex: 20/01 às 14:30)
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export default async function Home() {
  // 1. Proteção: Se não logou, tchau!
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Busca dados necessários (Lojas para o form e Tickets para a lista)
  const stores = await prisma.store.findMany({ select: { id: true, name: true } })
  
  const myTickets = await prisma.ticket.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' }, // Mais recentes primeiro
    take: 10 // Pega os últimos 10 para não poluir a home
  })

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- CABEÇALHO DO USUÁRIO --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-blue-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Olá, {user.name}</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">
              {user.department || "Setor não definido"}
            </p>
          </div>
          <form action={logout}>
            <button className="text-sm text-red-500 hover:text-red-700 font-bold hover:underline border border-red-200 px-4 py-2 rounded transition hover:bg-red-50">
              Sair do Sistema
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- COLUNA DA ESQUERDA: ABRIR CHAMADO --- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow h-fit sticky top-4">
              <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">
                📝 Novo Chamado
              </h2>
              <TicketForm stores={stores} />
            </div>
          </div>

          {/* --- COLUNA DA DIREITA: MEUS CHAMADOS --- */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2 flex justify-between items-center">
                <span>📋 Meus Chamados Recentes</span>
                <span className="text-xs font-normal text-gray-400">Últimos 10</span>
              </h2>

              {myTickets.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>Você ainda não abriu nenhum chamado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myTickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition bg-gray-50">
                      
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{ticket.title}</h3>
                        <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                      
                      {/* --- LÓGICA DE STATUS, DATA E MENSAGEM --- */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        
                        {/* 1. Status ABERTO */}
                        {ticket.status === 'OPEN' && (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
                            🔴 Aguardando Atendimento
                          </span>
                        )}

                        {/* 2. Status EM ANÁLISE */}
                        {ticket.status === 'IN_PROGRESS' && (
                          <div className="w-full">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
                                🔵 Em Análise pela TI
                              </span>
                              <span className="text-xs text-gray-400">Não precisa mandar Zap!</span>
                            </div>
                            
                            {/* --- AQUI ESTÁ A NOVIDADE: DATA AGENDADA --- */}
                            {ticket.estimatedTime && (
                                <div className="mb-2 text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 p-1 px-2 rounded w-fit flex items-center gap-1">
                                    📅 Agendado para: {ticket.estimatedTime.toLocaleString('pt-BR')}
                                </div>
                            )}

                            {/* Mensagem da TI */}
                            {ticket.tiResponse && (
                              <div className="bg-blue-50 border border-blue-100 p-2 rounded text-xs text-blue-800 italic flex gap-2 items-start">
                                <span>💬</span>
                                <span><strong>Retorno da TI:</strong> {ticket.tiResponse}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. Status FECHADO */}
                        {ticket.status === 'CLOSED' && (
                          <div className="w-full">
                             <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 mb-2 w-fit">
                              ✅ Resolvido
                            </span>
                            {ticket.solution && (
                              <div className="bg-green-50 border border-green-100 p-2 rounded text-xs text-green-800">
                                <strong>Solução:</strong> {ticket.solution}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}