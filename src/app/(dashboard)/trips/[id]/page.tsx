import { PrismaClient } from '@prisma/client'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import TripDetailClient from './TripDetailClient'

const prisma = new PrismaClient()

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }
  // Await the params before using its properties in Next.js 15+
  const resolvedParams = await params
  
  const trip = await prisma.trip.findUnique({
    where: { id: resolvedParams.id },
    include: {
      vehicle: true,
      driver: true,
    }
  })

  if (!trip) {
    notFound()
  }

  return <TripDetailClient trip={trip} role={user.role} />
}
