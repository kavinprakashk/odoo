import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()
  
  if (!user) {
    redirect('/login')
  }

  const activeDispatches = await prisma.trip.count({ where: { status: 'Dispatched' } })
  const openMaintenance = await prisma.vehicle.count({ where: { status: 'In Shop' } })
  
  const drivers = await prisma.driver.findMany()
  const complianceExceptions = drivers.filter(d => {
    const isExpired = new Date(d.expiryDate) < new Date()
    const daysLeft = (new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    return isExpired || daysLeft <= 30 || d.status === 'Suspended' || d.safetyScore < 80
  }).length

  const counts = {
    activeDispatches,
    openMaintenance,
    complianceExceptions
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden relative isolate">
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.15]"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-violet-600/10 blur-[150px]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]"></div>
      </div>

      <Sidebar user={user} counts={counts} />
      <main className="flex-1 overflow-y-auto p-8 relative z-0">
        {children}
      </main>
    </div>
  )
}
