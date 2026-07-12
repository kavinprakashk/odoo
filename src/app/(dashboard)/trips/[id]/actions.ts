'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

export async function completeTripAction(tripId: string, fuelConsumed: number, revenue: number) {
  const user = await getSession()
  if (!user || user.role !== 'Dispatcher') {
    return { error: 'Permission denied. Only Dispatchers can complete trips.' }
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId }, include: { vehicle: true } })
      if (!trip) return { error: 'Trip not found' }
      if (trip.status !== 'Dispatched') return { error: 'Only dispatched trips can be completed' }

      // Update Trip
      await tx.trip.update({
        where: { id: tripId },
        data: { status: 'Completed', revenue }
      })

      // Add Fuel Log if fuel provided and vehicle is assigned
      if (trip.vehicleId && fuelConsumed > 0) {
        // Find rough cost? We can hardcode 1.5 per L/kg for the demo, or just use 0.
        // Let's assume fuel cost is $1.5 per unit
        await tx.fuelLog.create({
          data: {
            vehicleId: trip.vehicleId,
            fuelConsumed: fuelConsumed,
            cost: fuelConsumed * 1.5,
            distance: trip.distance,
            date: new Date()
          }
        })
      }

      // Restore Vehicle and Driver to Available
      if (trip.vehicleId) {
        // Ensure not setting to available if it was supposed to be retired, but trips don't use retired
        await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'Available' } })
      }
      if (trip.driverId) {
        await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'Available' } })
      }

      revalidatePath('/trips')
      revalidatePath(`/trips/${tripId}`)
      revalidatePath('/vehicles')
      revalidatePath('/drivers')
      
      return { success: true }
    })
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to complete trip.' }
  }
}

export async function cancelTripAction(tripId: string) {
  const user = await getSession()
  if (!user || (user.role !== 'Dispatcher' && user.role !== 'Fleet Manager')) {
    return { error: 'Permission denied. Only Dispatchers and Fleet Managers can cancel trips.' }
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId } })
      if (!trip) return { error: 'Trip not found' }
      
      if (trip.status === 'Completed' || trip.status === 'Cancelled') {
        return { error: 'Cannot cancel a completed or already cancelled trip.' }
      }

      await tx.trip.update({
        where: { id: tripId },
        data: { status: 'Cancelled' }
      })

      if (trip.status === 'Dispatched') {
        if (trip.vehicleId) {
          await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'Available' } })
        }
        if (trip.driverId) {
          await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'Available' } })
        }
      }

      revalidatePath('/trips')
      revalidatePath(`/trips/${tripId}`)
      revalidatePath('/vehicles')
      revalidatePath('/drivers')
      
      return { success: true }
    })
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to cancel trip.' }
  }
}
