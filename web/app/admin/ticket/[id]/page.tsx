import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { closeTicket, reopenTicket, updateTicketStatus } from "@/actions/ticket-actions"
import { TicketStatus } from "@prisma/client"

// Action local para atualizar data
async function updateTicketDeadline(formData: FormData) {
  'use server'
  const ticketId = parseInt(formData.get('ticketId') as string)
  const dateStr = formData.get('deadline') as string
  
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { 
      estimatedTime: new Date(dateStr),
      status: TicketStatus.IN_PROGRESS 
    }
  })
  revalidatePath(`/admin/ticket/${ticketId}`)
}

export default async function AdminTicketDetails({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(id) },
    include: { 
      store: true, 
      author: true,
      closedBy: true  // <--- A CORREÇÃO ESTÁ AQUI! (Sem isso, o build quebra)
    }
  })

  if (!ticket) return <div>Chamado não encontrado</div>

  const isClosed = ticket.status === 'CLOSED'
  const isOpen = ticket.status === 'OPEN'

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* --- CABEÇALHO --- */}
        <div className={`p-6 text-white flex justify-between items-center ${
            isClosed ? 'bg-green-700' : isOpen ? 'bg-red-600' : 'bg-slate-800'
        }`}>
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    Chamado #{ticket.id}
                    {ticket.status === 'IN_PROGRESS' && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded border border-blue-400">
                           Em Análise
                        </span>
                    )}
                </h1>
                <p className="opacity-90 text-sm font-medium">{ticket.store.name} — {ticket.store.code}</p>
            </div>
            <div className="text-right">
                <div className="font-bold border px-2 rounded mb-1 bg-white/20 uppercase text-xs tracking-wider">
                    {ticket.status === 'IN_PROGRESS' ? 'EM ANÁLISE' : ticket.status}
                </div>
                <div className="text-sm font-bold text-red-100">{ticket.priority}</div>
            </div>
        </div>

        <div className="p-6 space-y-8">
            
            {/* --- DETALHES DO PROBLEMA --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <h3 className="text-gray-400 text-xs uppercase font-bold mb-1">Problema Relatado</h3>
                    <p className="text-xl text-gray-900 font-bold mb-2">{ticket.title}</p>
                    <div className="p-4 bg-gray-50 border rounded-lg text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {ticket.description}
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border h-fit">
                    <h3 className="text-gray-400 text-xs uppercase font-bold mb-3">Solicitante</h3>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                            {ticket.author.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-gray-900 font-bold text-sm">{ticket.author.name}</p>
                            <p className="text-xs text-gray-500">{ticket.author.department || "Sem setor"}</p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 border-t pt-2">
                        Aberto em: {ticket.createdAt.toLocaleString('pt-BR')}
                    </div>
                </div>
            </div>

            {/* --- ÁREA DE RESPOSTA DA TI --- */}
            {!isClosed && (
                <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        💬 Interação com Usuário
                    </h3>

                    {isOpen ? (
                        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
                            <h4 className="text-blue-900 font-bold mb-2">Este chamado ainda não foi visualizado!</h4>
                            <p className="text-sm text-blue-700 mb-4">
                                Envie um feedback rápido para o usuário saber que você já viu.
                            </p>
                            
                            <form action={updateTicketStatus} className="flex flex-col gap-3 max-w-md mx-auto">
                                <input type="hidden" name="ticketId" value={ticket.id} />
                                <input type="hidden" name="status" value="IN_PROGRESS" />
                                
                                <input 
                                    name="tiResponse" 
                                    className="border border-blue-300 p-3 rounded text-sm w-full text-black"
                                    placeholder="Ex: Visto. Estou indo aí em 10 min..."
                                    autoFocus
                                />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition">
                                    👁️ Marcar como Visualizado (Em Análise)
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex gap-4 items-start">
                             <div className="bg-blue-100 p-2 rounded-full text-blue-600">👁️</div>
                             <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase">Sua resposta para o usuário:</p>
                                <p className="text-gray-800 font-medium italic">
                                    "{ticket.tiResponse || "Sem mensagem (Apenas marcado como Visto)"}"
                                </p>
                                <p className="text-xs text-green-600 mt-1 font-bold">
                                    ✓ O usuário já consegue ver que você está trabalhando nisso.
                                </p>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- ÁREA DE AÇÕES FINAIS --- */}
            <div className="border-t pt-6 bg-gray-50 -mx-6 -mb-6 p-6 mt-6">
            
            {isClosed ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-100 p-3 rounded-full text-2xl">✅</div>
                        <div>
                            <p className="text-green-900 font-bold text-lg">Chamado Finalizado com Sucesso</p>
                            <p className="text-xs text-green-700">
                                Encerrado por: <strong>{ticket.closedBy?.name || "Desconhecido"}</strong> em {ticket.closedAt?.toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded border border-green-100 shadow-inner">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-2">Solução Técnica Aplicada:</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{ticket.solution}</p>
                    </div>
                    
                    <form action={reopenTicket} className="mt-6 text-right">
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <button className="text-xs text-red-400 hover:text-red-600 underline font-bold transition">
                           ⚠ Reabrir chamado (Desfazer)
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded border shadow-sm h-fit">
                        <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                            📅 Agendar Atendimento
                        </h4>
                        <form action={updateTicketDeadline} className="flex flex-col gap-3">
                            <input type="hidden" name="ticketId" value={ticket.id} />
                            <input 
                                type="datetime-local" 
                                name="deadline" 
                                className="w-full border p-2 rounded text-sm text-black bg-gray-50" 
                            />
                            <button type="submit" className="bg-white border border-blue-600 text-blue-600 px-3 py-2 rounded text-sm font-bold hover:bg-blue-50 transition">
                                Salvar Previsão
                            </button>
                        </form>
                        {ticket.estimatedTime && (
                            <div className="mt-3 p-2 bg-blue-50 text-blue-800 text-xs rounded text-center border border-blue-100">
                                📌 Agendado para: <strong>{ticket.estimatedTime.toLocaleString('pt-BR')}</strong>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-5 rounded border border-green-100 shadow-sm ring-1 ring-green-500/20">
                        <h4 className="font-bold text-green-800 mb-3 text-sm flex items-center gap-2">
                             ✓ Finalizar Chamado
                        </h4>
                        <form action={closeTicket}>
                            <input type="hidden" name="ticketId" value={ticket.id} />
                            
                            <label className="block text-xs text-gray-400 mb-1 font-bold uppercase">Solução Técnica *</label>
                            <textarea 
                                name="solution" 
                                required 
                                placeholder="Descreva o que foi feito..."
                                className="w-full border p-2 rounded text-sm h-24 mb-3 text-black bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-green-500"
                            ></textarea>

                            <button 
                                type="submit" 
                                className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded font-bold shadow transition flex justify-center gap-2"
                            >
                                Finalizar e Arquivar
                            </button>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  )
}