'use server'

import { PrismaClient } from '@prisma/client'
import { setSession } from '@/lib/auth'

const prisma = new PrismaClient()

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  // For the demo hackathon project, simple password matching is used.
  if (!user || user.password !== password) {
    return { error: 'Invalid email or password' }
  }

  await setSession(user.id)
  return { success: true }
}
