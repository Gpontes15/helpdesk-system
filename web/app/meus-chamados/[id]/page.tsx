import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function UserTicketDetail({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(id) },
    include: { store: true, author: true }
  })

  if (!ticket) return <div className="p-8 text-center text-gray-500">Chamado não encontrado</div>

  // Configuração visual dos status (Cores e Textos)
  const statusBadge = {
    OPEN: { label: '🔴 Aguardando Atendimento', color: 'bg-red-50 text-red-700 border-red-200' },
    IN_PROGRESS: { label: '🔵 Em Análise pela TI', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    CLOSED: { label: '✅ Resolvido', color: 'bg-green-50 text-green-700 border-green-200' },
  }
  const currentStatus = statusBadge[ticket.status] || { label: ticket.status, color: 'bg-gray-100' }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center items-start">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-slate-800 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
                Chamado #{ticket.id}
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                🏢 {ticket.store.name}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-xs font-bold border ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
        </div>

        <div className="p-6 space-y-8">

          {/* 1. MENSAGEM DA TI (O Feedback Rápido) */}
          {ticket.tiResponse && ticket.status !== 'CLOSED' && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow-sm">
               <h3 className="text-blue-900 font-bold text-sm flex items-center gap-2 mb-2">
                 💬 Mensagem da TI para você:
               </h3>
               <p className="text-blue-800 italic text-sm">"{ticket.tiResponse}"</p>
            </div>
          )}

          {/* 2. PREVISÃO (Se estiver agendado e ainda aberto) */}
          {ticket.estimatedTime && ticket.status !== 'CLOSED' && (
             <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-md flex items-center gap-4">
               <div className="text-3xl">📅</div>
               <div>
                 <h3 className="text-indigo-900 font-bold text-sm">Visita Técnica Agendada</h3>
                 <p className="text-indigo-700 text-sm mt-1">
                   O técnico previu o atendimento para: <br/>
                   <strong className="text-lg bg-white px-2 rounded border border-indigo-100 shadow-sm inline-block mt-1">
                      {ticket.estimatedTime.toLocaleString('pt-BR')}
                   </strong>
                 </p>
               </div>
             </div>
          )}

          {/* 3. SOLUÇÃO FINAL (Se estiver fechado) */}
          {ticket.status === 'CLOSED' && (
             <div className="bg-green-50 border border-green-200 p-6 rounded-md">
               <h3 className="text-green-800 font-bold flex items-center gap-2 mb-3 text-lg">
                 ✅ Problema Resolvido
               </h3>
               <div className="bg-white p-4 rounded border border-green-100 text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {ticket.solution || "Chamado encerrado. Nenhuma nota técnica adicionada."}
               </div>
               <p className="text-xs text-green-600 mt-3 text-right">
                 Encerrado em: {ticket.closedAt?.toLocaleString('pt-BR')}
               </p>
             </div>
          )}

          {/* 4. DETALHES DO PROBLEMA */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase block mb-2 border-b pb-1">Descrição do Problema</label>
            <p className="text-xl text-gray-900 font-bold mb-3">{ticket.title}</p>
            <p className="text-gray-700 bg-gray-50 p-4 rounded border border-gray-100 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* 5. RODAPÉ DE METADADOS */}
          <div className="bg-gray-50 p-4 rounded flex justify-between items-center text-sm border border-gray-100">
             <div>
                <span className="text-gray-400 text-xs font-bold uppercase block">Solicitante</span>
                <span className="text-gray-800 font-bold">{ticket.author.name}</span>
             </div>
             <div className="text-right">
                <span className="text-gray-400 text-xs font-bold uppercase block">Data de Abertura</span>
                <span className="text-gray-800">{ticket.createdAt.toLocaleDateString('pt-BR')}</span>
             </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Link href="/meus-chamados" className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded font-bold transition shadow-md flex items-center gap-2">
              ← Voltar para a lista
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}