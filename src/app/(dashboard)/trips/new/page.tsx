import { PrismaClient } from '@prisma/client'
import TripForm from './TripForm'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function NewTripPage() {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  // Only Dispatchers can create/dispatch trips
  if (user.role !== 'Dispatcher') {
    redirect('/?error=Only+Dispatchers+can+create+and+dispatch+trips.')
  }
  // We need to fetch available vehicles and drivers for the form.
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'Available' },
    select: { id: true, registrationNum: true, capacity: true }
  })
  
  const drivers = await prisma.driver.findMany({
    where: { status: 'Available' },
    select: { id: true, name: true, expiryDate: true }
  })

  // Filter out drivers with expired licences (server-side filter for the UI)
  const validDrivers = drivers.filter(d => new Date(d.expiryDate) >= new Date())

  return (
    <TripForm vehicles={vehicles} drivers={validDrivers} />
  )
}
