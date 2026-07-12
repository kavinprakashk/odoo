'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

export async function closeMaintenanceAction(id: string) {
  const user = await getSession()
  if (!user || user.role !== 'Fleet Manager') {
    return { error: 'Permission denied. Only Fleet Managers can close maintenance.' }
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const log = await tx.maintenance.findUnique({ where: { id }, include: { vehicle: true } })
      if (!log) return { error: 'Maintenance log not found.' }
      if (log.status === 'Closed') return { error: 'Already closed.' }

      await tx.maintenance.update({
        where: { id },
        data: { status: 'Closed' }
      })

      // If vehicle is not retired, restore to Available
      if (log.vehicle.status !== 'Retired') {
        await tx.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: 'Available' }
        })
      }

      revalidatePath('/maintenance')
      revalidatePath('/vehicles')
      
      return { success: true }
    })
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to close maintenance.' }
  }
}
