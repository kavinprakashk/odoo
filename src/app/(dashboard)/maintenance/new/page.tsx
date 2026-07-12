import { PrismaClient } from '@prisma/client'
import { Suspense } from 'react'
import MaintenanceForm from './MaintenanceForm'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function NewMaintenancePage() {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  // Only Fleet Manager can log new maintenance
  if (user.role !== 'Fleet Manager') {
    redirect('/?error=Only+Fleet+Managers+can+log+maintenance.')
  }
  const vehicles = await prisma.vehicle.findMany({
    where: { 
      status: { not: 'Retired' } // Exclude retired vehicles
    },
    select: { id: true, registrationNum: true, status: true }
  })
  
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <MaintenanceForm vehicles={vehicles} />
    </Suspense>
  )
}
