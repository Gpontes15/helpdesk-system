import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import Link from "next/link"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  }).format(date)
}

export default async function MeusChamadosPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const allTickets = await prisma.ticket.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { store: true }
  })

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Meus Chamados</h1>
          <Link href="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-bold hover:bg-gray-50 shadow-sm transition">
            ← Voltar para Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden min-h-[300px]">
          {allTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
              <p className="text-lg">Você ainda não abriu nenhum chamado.</p>
              <Link href="/" className="mt-4 text-blue-600 hover:underline">Abrir um chamado agora</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {allTickets.map((ticket) => (
                <Link key={ticket.id} href={`/meus-chamados/${ticket.id}`} className="block hover:bg-blue-50/30 transition group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase mr-2">#{ticket.id}</span>
                        <h3 className="font-bold text-lg text-gray-800 inline-block group-hover:text-blue-700 transition">
                            {ticket.title}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-400">{formatDate(ticket.createdAt)}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-1">{ticket.description}</p>

                    <div className="flex flex-wrap gap-3 items-center">
                      {/* STATUS */}
                      {ticket.status === 'OPEN' && <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">🔴 Aguardando</span>}
                      {ticket.status === 'IN_PROGRESS' && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">🔵 Em Análise</span>}
                      {ticket.status === 'CLOSED' && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">✅ Resolvido</span>}
                      
                      {/* AVISOS */}
                      {ticket.tiResponse && ticket.status !== 'CLOSED' && (
                          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded border border-gray-200">💬 Mensagem da TI</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}