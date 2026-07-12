'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

export async function registerDriverAction(formData: FormData) {
  const user = await getSession()
  if (!user || (user.role !== 'Fleet Manager' && user.role !== 'Safety Officer')) {
    return { error: 'Permission denied. Only Fleet Managers and Safety Officers can register drivers.' }
  }
  const name = formData.get('name') as string
  const licenceNumber = formData.get('licenceNumber') as string
  const category = formData.get('category') as string
  const expiryDate = formData.get('expiryDate') as string
  const contact = formData.get('contact') as string
  const safetyScore = parseFloat(formData.get('safetyScore') as string)

  if (!name || !licenceNumber || !category || !expiryDate || !contact || isNaN(safetyScore)) {
    return { error: 'All fields are required and must be valid.' }
  }

  // Business Rule: Driver licence number is unique
  const existing = await prisma.driver.findUnique({
    where: { licenceNumber }
  })

  if (existing) {
    return { error: 'A driver with this licence number already exists.' }
  }

  try {
    await prisma.driver.create({
      data: {
        name,
        licenceNumber,
        category,
        expiryDate: new Date(expiryDate),
        contact,
        safetyScore,
        status: 'Available', // default
      }
    })
    
    revalidatePath('/drivers')
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to register driver.' }
  }
}
