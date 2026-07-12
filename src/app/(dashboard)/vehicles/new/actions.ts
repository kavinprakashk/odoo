'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

export async function registerVehicleAction(formData: FormData) {
  const user = await getSession()
  if (!user || user.role !== 'Fleet Manager') {
    return { error: 'Permission denied. Only Fleet Managers can register vehicles.' }
  }
  const registrationNum = formData.get('registrationNum') as string
  const model = formData.get('model') as string
  const type = formData.get('type') as string
  const capacity = parseFloat(formData.get('capacity') as string)
  const odometer = parseFloat(formData.get('odometer') as string)
  const acquisitionCost = parseFloat(formData.get('acquisitionCost') as string)
  const region = formData.get('region') as string

  if (!registrationNum || !model || !type || isNaN(capacity) || isNaN(odometer) || isNaN(acquisitionCost) || !region) {
    return { error: 'All fields are required and must be valid.' }
  }

  // Business Rule: Vehicle registration number is unique
  const existing = await prisma.vehicle.findUnique({
    where: { registrationNum }
  })

  if (existing) {
    return { error: 'A vehicle with this registration number already exists.' }
  }

  try {
    await prisma.vehicle.create({
      data: {
        registrationNum,
        model,
        type,
        capacity,
        odometer,
        acquisitionCost,
        region,
        status: 'Available', // default
      }
    })
    
    revalidatePath('/vehicles')
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to register vehicle.' }
  }
}
