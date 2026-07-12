'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

export async function createTripAction(formData: FormData) {
  const user = await getSession()
  if (!user || user.role !== 'Dispatcher') {
    return { error: 'Permission denied. Only Dispatchers can create and dispatch trips.' }
  }
  const source = formData.get('source') as string
  const destination = formData.get('destination') as string
  const cargoWeight = parseFloat(formData.get('cargoWeight') as string)
  const distance = parseFloat(formData.get('distance') as string)
  const vehicleId = formData.get('vehicleId') as string | null
  const driverId = formData.get('driverId') as string | null
  // Using a submitter action value is difficult with FormData unless we add a hidden input or append it on submit.
  // Actually, HTML5 passes the button's name/value if it triggered the submit.
  const actionType = formData.get('action') as string || 'draft'

  if (!source || !destination || isNaN(cargoWeight) || isNaN(distance)) {
    return { error: 'Required fields are missing or invalid.' }
  }

  const status = actionType === 'dispatch' ? 'Dispatched' : 'Draft'

  // If dispatching, we must ensure a vehicle and driver are assigned.
  if (status === 'Dispatched') {
    if (!vehicleId || !driverId) {
      return { error: 'Both Vehicle and Driver must be assigned to dispatch a trip.' }
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Validations if dispatching or just assigning
      if (vehicleId) {
        const v = await tx.vehicle.findUnique({ where: { id: vehicleId } })
        if (!v) return { error: 'Vehicle not found.' }
        if (v.status === 'In Shop' || v.status === 'Retired') {
          return { error: `Vehicle is ${v.status} and cannot be assigned.` }
        }
        if (v.status === 'On Trip' && status === 'Dispatched') {
          return { error: 'Vehicle is already On Trip.' }
        }
        if (cargoWeight > v.capacity) {
          return { error: `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${v.capacity} kg).` }
        }
      }

      if (driverId) {
        const d = await tx.driver.findUnique({ where: { id: driverId } })
        if (!d) return { error: 'Driver not found.' }
        if (d.status === 'Suspended') {
          return { error: 'Driver is Suspended and cannot be assigned.' }
        }
        if (d.status === 'On Trip' && status === 'Dispatched') {
          return { error: 'Driver is already On Trip.' }
        }
        if (new Date(d.expiryDate) < new Date()) {
          return { error: 'Driver licence is expired and cannot be assigned.' }
        }
      }

      // Create Trip
      await tx.trip.create({
        data: {
          source,
          destination,
          cargoWeight,
          distance,
          status,
          vehicleId: vehicleId || null,
          driverId: driverId || null
        }
      })

      // If Dispatched, update Vehicle and Driver statuses
      if (status === 'Dispatched') {
        if (vehicleId) {
          await tx.vehicle.update({ where: { id: vehicleId }, data: { status: 'On Trip' } })
        }
        if (driverId) {
          await tx.driver.update({ where: { id: driverId }, data: { status: 'On Trip' } })
        }
      }

      revalidatePath('/trips')
      revalidatePath('/vehicles')
      revalidatePath('/drivers')
      
      return { success: true }
    })
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to create trip.' }
  }
}
