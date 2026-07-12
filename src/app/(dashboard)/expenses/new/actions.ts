'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

export async function createExpenseAction(formData: FormData) {
  const user = await getSession()
  if (!user || user.role !== 'Financial Analyst') {
    return { error: 'Permission denied. Only Financial Analysts can log expenses.' }
  }
  const vehicleId = formData.get('vehicleId') as string
  const cost = parseFloat(formData.get('cost') as string)
  const isFuel = formData.get('isFuel') === 'true'

  if (!vehicleId || isNaN(cost)) {
    return { error: 'Required fields are missing or invalid.' }
  }

  try {
    if (isFuel) {
      const fuelConsumed = parseFloat(formData.get('fuelConsumed') as string)
      if (isNaN(fuelConsumed)) return { error: 'Fuel consumed is required.' }
      
      await prisma.fuelLog.create({
        data: {
          vehicleId,
          fuelConsumed,
          cost,
          date: new Date(),
        }
      })
    } else {
      const type = formData.get('type') as string
      const description = formData.get('description') as string
      if (!type || !description) return { error: 'Type and description are required.' }

      await prisma.expense.create({
        data: {
          vehicleId,
          type,
          description,
          cost,
          date: new Date(),
        }
      })
    }

    revalidatePath('/expenses')
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to record expense.' }
  }
}
