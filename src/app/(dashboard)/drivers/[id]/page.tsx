import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DriverDetailFormClient from './DriverDetailFormClient'

const prisma = new PrismaClient()

export default async function DriverDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params
  const user = await getSession()

  if (!user) {
    redirect('/login')
  }

  const driver = await prisma.driver.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!driver) {
    notFound()
  }

  const canEdit = user.role === 'Fleet Manager' || user.role === 'Safety Officer'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/drivers" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Driver Profile</h1>
          <p className="text-slate-400 text-sm">
            {canEdit ? 'Edit and manage driver details and compliance status.' : 'View driver profile details.'}
          </p>
        </div>
      </div>

      <DriverDetailFormClient driver={driver} canEdit={canEdit} />
    </div>
  )
}
