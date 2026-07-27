'use server'

import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { getSession, getSessionForLogin } from "@/lib/session"

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  // Checkbox "Lembrar de mim": vem como "on" quando marcado, ou null quando não
  const lembrar = formData.get('lembrar') === 'on'

  const user = await prisma.user.findUnique({
    where: { username }
  })

  // Compara a senha digitada com o hash guardado no banco
  if (!user || !(await bcrypt.compare(password, user.password))) {
    redirect('/login?error=invalid')
  }

  // Cria a sessão com a validade certa (7 dias se "lembrar", senão expira ao fechar)
  const session = await getSessionForLogin(lembrar)
  session.userId = user.id
  await session.save()

  redirect('/')
}

export async function logout() {
  const session = await getSession()
  session.destroy() // apaga a sessão de forma segura
  redirect('/login')
}

export async function getCurrentUser() {
  try {
    const session = await getSession()
    const userId = session.userId

    if (!userId) return null

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true }
    })

    // Se o cookie existe mas o usuário não foi encontrado (ex: banco resetado),
    // retorna null para forçar um novo login em vez de quebrar a página
    if (!user) return null

    return user

  } catch (error) {
    // Proteção contra falhas gerais (banco offline, erro de conexão, etc)
    console.error("Erro ao verificar sessão do usuário:", error)
    return null
  }
}