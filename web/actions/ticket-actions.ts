'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/auth-actions"
import { TicketStatus } from "@prisma/client"

// Validação simples para evitar dados vazios
const TicketSchema = {
  title: (val: string) => val && val.length > 3,
  description: (val: string) => val && val.length > 5,
}

// 1. CRIAR CHAMADO
export async function createTicket(formData: FormData) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  
  const formStoreId = formData.get('storeId') as string
  const finalStoreId = formStoreId || user.storeId

  if (!finalStoreId) {
    throw new Error("Erro Crítico: Não foi possível identificar a loja para este chamado.")
  }

  if (!TicketSchema.title(title) || !TicketSchema.description(description)) {
    return 
  }

  let categoryId = 5 
  const text = (title + " " + description).toLowerCase()
  
  if (text.includes('impressora') || text.includes('toner') || text.includes('papel')) categoryId = 4
  if (text.includes('wifi') || text.includes('internet') || text.includes('rede') || text.includes('lento')) categoryId = 3
  if (text.includes('sistema') || text.includes('rub') || text.includes('winthor') || text.includes('vr')) categoryId = 2
  if (text.includes('pc') || text.includes('computador') || text.includes('monitor') || text.includes('teclado')) categoryId = 1

  await prisma.ticket.create({
    data: {
      title,
      description,
      priority: priority || 'LOW',
      status: TicketStatus.OPEN,
      authorId: user.id,
      storeId: finalStoreId,
      categoryId: categoryId 
    }
  })

  revalidatePath('/')
  revalidatePath('/meus-chamados')
  revalidatePath('/admin') 
  redirect('/meus-chamados')
}

// 2. ATUALIZAR STATUS E MENSAGEM
export async function updateTicketStatus(formData: FormData) {
  const user = await getCurrentUser()
  if (user?.role !== 'ADMIN' && user?.role !== 'TECH') {
     return 
  }

  const ticketId = parseInt(formData.get('ticketId') as string)
  const newStatus = formData.get('status') as TicketStatus
  const message = formData.get('tiResponse') as string

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: newStatus,
      tiResponse: message || null 
    }
  })

  revalidatePath(`/admin/ticket/${ticketId}`)
  revalidatePath('/admin')
  revalidatePath('/meus-chamados')
  revalidatePath('/')
}

// 3. FECHAR CHAMADO
export async function closeTicket(formData: FormData) {
  const user = await getCurrentUser()
  
  if (!user) return 

  const ticketId = parseInt(formData.get('ticketId') as string)
  const solution = formData.get('solution') as string

  if (!solution || solution.trim() === "") {
    return
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: TicketStatus.CLOSED, 
      closedAt: new Date(),
      solution: solution,
      closedById: user.id
    }
  })

  revalidatePath(`/admin/ticket/${ticketId}`)
  revalidatePath('/admin')
  revalidatePath('/meus-chamados')
  revalidatePath('/admin/relatorios')
}

// 4. REABRIR CHAMADO
export async function reopenTicket(formData: FormData) {
  const ticketId = parseInt(formData.get('ticketId') as string)

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: TicketStatus.IN_PROGRESS,
      closedAt: null,
    }
  })

  revalidatePath(`/admin/ticket/${ticketId}`)
  revalidatePath('/admin')
  revalidatePath('/meus-chamados')
  revalidatePath('/admin/relatorios')
}

// --- NOVA FUNÇÃO: DELETAR CHAMADO ---
export async function deleteTicket(ticketId: number) {
  try {
    await prisma.ticket.delete({
      where: { id: ticketId }
    })
    
    revalidatePath('/')
    revalidatePath('/meus-chamados')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar:", error)
    return { error: "Erro ao apagar chamado." }
  }
}