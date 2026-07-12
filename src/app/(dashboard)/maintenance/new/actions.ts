'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

export async function createMaintenanceAction(formData: FormData) {
  const user = await getSession()
  if (!user || user.role !== 'Fleet Manager') {
    return { error: 'Permission denied. Only Fleet Managers can create maintenance entries.' }
  }
  const vehicleId = formData.get('vehicleId') as string
  const issue = formData.get('issue') as string
  const serviceProvider = formData.get('serviceProvider') as string
  const cost = parseFloat(formData.get('cost') as string)

  if (!vehicleId || !issue || !serviceProvider || isNaN(cost)) {
    return { error: 'All fields are required and must be valid.' }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const v = await tx.vehicle.findUnique({ where: { id: vehicleId } })
      if (!v) return { error: 'Vehicle not found.' }
      if (v.status === 'On Trip') return { error: 'Cannot maintain a vehicle currently on a trip.' }
      
      await tx.maintenance.create({
        data: {
          issue,
          serviceProvider,
          cost,
          date: new Date(),
          status: 'Open',
          vehicleId
        }
      })

      // Update vehicle to In Shop
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'In Shop' }
      })

      revalidatePath('/maintenance')
      revalidatePath('/vehicles')
      
      return { success: true }
    })
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to create maintenance record.' }
  }
}
