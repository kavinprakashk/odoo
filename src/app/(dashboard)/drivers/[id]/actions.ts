'use server'

import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function updateDriverAction(id: string, formData: FormData) {
  const user = await getSession()
  if (!user) {
    return { error: 'Authentication required' }
  }

  // Strict server-side RBAC check
  if (user.role !== 'Fleet Manager' && user.role !== 'Safety Officer') {
    return { error: 'Permission denied. Only Fleet Managers and Safety Officers can edit drivers.' }
  }

  const name = formData.get('name') as string
  const contact = formData.get('contact') as string
  const licenceNumber = formData.get('licenceNumber') as string
  const category = formData.get('category') as string
  const expiryDateStr = formData.get('expiryDate') as string
  const safetyScore = parseFloat(formData.get('safetyScore') as string)
  const status = formData.get('status') as string

  if (!name || !contact || !licenceNumber || !category || !expiryDateStr || isNaN(safetyScore) || !status) {
    return { error: 'All fields are required and must be valid.' }
  }

  // Ensure unique licence number (excluding current driver)
  const existing = await prisma.driver.findFirst({
    where: {
      licenceNumber,
      NOT: { id }
    }
  })

  if (existing) {
    return { error: 'Another driver with this licence number already exists.' }
  }

  try {
    await prisma.driver.update({
      where: { id },
      data: {
        name,
        contact,
        licenceNumber,
        category,
        expiryDate: new Date(expiryDateStr),
        safetyScore,
        status,
      }
    })

    revalidatePath('/drivers')
    revalidatePath(`/drivers/${id}`)
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to update driver.' }
  }
}
