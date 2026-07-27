import { prisma } from "@/lib/db"
import Link from "next/link"
import { getCurrentUser } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { DeleteTicketButton } from "@/components/DeleteTicketButton"
// 1. IMPORTAÇÃO DO VIGIA DE NOTIFICAÇÕES AQUI:
import { NotificationWatcher } from "@/components/NotificationWatcher"
// Força atualização sempre que entrar
export const dynamic = 'force-dynamic'
const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-indigo-100 text-indigo-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
}
export default async function AdminDashboard() {
  const user = await getCurrentUser()
  // Segurança: Só ADMIN ou TECH
  if (!user || (user.role !== 'ADMIN' && user.role !== 'TECH')) {
    redirect('/')
  }
  // BUSCA TUDO (Sem filtro 'where')
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: { store: true, author: true }
  })
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">

      {/* 2. COMPONENTE VIGIA TRABALHANDO NOS BASTIDORES */}
      <NotificationWatcher />
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Chamados</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
               Histórico completo: {tickets.length} registros (Todos os status)
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/estoque" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/25 font-semibold text-sm transition">
              Gerenciar Estoque
            </Link>
            <Link href="/admin/relatorios" className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 font-semibold text-sm transition">
              Relatórios
            </Link>
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Loja</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Problema</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {tickets.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                       Nenhum chamado encontrado no banco de dados.
                    </td>
                 </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono font-bold">#{ticket.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{ticket.store.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="font-bold text-slate-900">{ticket.title}</div>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[ticket.priority]}`}>
                          {ticket.priority === 'LOW' ? 'Baixa' : ticket.priority === 'MEDIUM' ? 'Média' : ticket.priority === 'HIGH' ? 'Alta' : 'Crítica'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center font-medium">
                           {ticket.author.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* STATUS VISUAL */}
                      {ticket.status === 'OPEN' && (
                        <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold">
                          Aberto
                        </span>
                      )}
                      {ticket.status === 'IN_PROGRESS' && (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold">
                          Em Análise
                        </span>
                      )}
                      {ticket.status === 'CLOSED' && (
                        <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">
                          Finalizado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-3">

                      <Link
                        href={`/admin/ticket/${ticket.id}`}
                        className={`font-semibold px-3 py-1.5 rounded-lg transition border ${
                          ticket.status === 'CLOSED'
                            ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200'
                            : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
                        }`}
                      >
                        {ticket.status === 'CLOSED' ? 'Ver Detalhes' : 'Gerenciar'}
                      </Link>
                      <DeleteTicketButton id={ticket.id} />

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}