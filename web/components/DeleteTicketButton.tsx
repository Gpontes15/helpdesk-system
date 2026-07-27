'use client'

import { deleteTicket } from "@/actions/ticket-actions"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function DeleteTicketButton({ id, redirectAfter }: { id: number, redirectAfter?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      onClick={(e) => {
        e.preventDefault() // Impede que o clique abra o link do chamado se estiver numa lista
        e.stopPropagation() // Garante que o clique fique só no botão
        
        if (confirm('⚠️ Tem certeza que deseja EXCLUIR este chamado permanentemente?')) {
          startTransition(async () => {
            await deleteTicket(id)
            if (redirectAfter) {
                router.push('/meus-chamados')
            }
          })
        }
      }}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded px-3 py-1 text-xs font-bold transition flex items-center gap-1 z-50 relative"
      title="Excluir Chamado"
    >
      {isPending ? '...' : '🗑️ Excluir'}
    </button>
  )
}