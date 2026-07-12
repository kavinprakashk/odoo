import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getSession() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('transitops_session')?.value
  
  if (!userId) return null
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    return user
  } catch {
    return null
  }
}

export async function setSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set('transitops_session', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('transitops_session')
}
