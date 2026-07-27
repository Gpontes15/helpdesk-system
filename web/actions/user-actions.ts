'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/auth-actions"
import bcrypt from "bcryptjs"


// 1. CADASTRAR USUÁRIO
export async function registerUser(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (currentUser?.role !== 'ADMIN') {
    throw new Error("Acesso negado")
  }

  const name = formData.get('name') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const department = formData.get('department') as string
  const role = formData.get('role') as 'USER' | 'ADMIN'
  const storeId = formData.get('storeId') as string

  const existingUser = await prisma.user.findUnique({ where: { username } })
  if (existingUser) {
    redirect('/admin/usuarios?error=username_exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      username,
      password: hashedPassword,
      department,
      role,
      storeId: storeId || null
    }
  })

  revalidatePath('/admin/usuarios')
  redirect('/admin/usuarios?success=created')
}

// 2. ATUALIZAR USUÁRIO
export async function updateUser(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (currentUser?.role !== 'ADMIN') return

  const userId = formData.get('userId') as string
  const name = formData.get('name') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const department = formData.get('department') as string
  const role = formData.get('role') as 'USER' | 'ADMIN'
  const storeId = formData.get('storeId') as string

  const dataToUpdate: any = {
    name,
    username,
    department,
    role,
    storeId: storeId || null
  }

  // Só atualiza a senha se o admin digitou uma nova (hasheada)
  if (password && password.trim() !== "") {
    dataToUpdate.password = await bcrypt.hash(password, 10)
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    })
  } catch (error) {
    console.error(error)
    redirect('/admin/usuarios?error=update_failed')
  }

  revalidatePath('/admin/usuarios')
  redirect('/admin/usuarios?success=updated')
}

// 3. DELETAR USUÁRIO
export async function deleteUser(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (currentUser?.role !== 'ADMIN') return

  const userIdToDelete = formData.get('userId') as string

  if (userIdToDelete === currentUser.id) {
    redirect('/admin/usuarios?error=self_delete')
  }

  try {
    await prisma.user.delete({
      where: { id: userIdToDelete }
    })
  } catch (error) {
    redirect('/admin/usuarios?error=has_history')
  }

  revalidatePath('/admin/usuarios')
}