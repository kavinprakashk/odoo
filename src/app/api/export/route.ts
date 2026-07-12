import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const trips = await prisma.trip.findMany({
    include: { vehicle: true, driver: true },
    orderBy: { createdAt: 'desc' }
  })

  // Basic CSV construction
  const header = ['Trip ID', 'Date', 'Source', 'Destination', 'Vehicle', 'Driver', 'Distance', 'Cargo Weight', 'Status', 'Revenue']
  const rows = trips.map(t => [
    t.id,
    new Date(t.createdAt).toISOString().split('T')[0],
    `"${t.source}"`,
    `"${t.destination}"`,
    t.vehicle ? t.vehicle.registrationNum : 'Unassigned',
    t.driver ? `"${t.driver.name}"` : 'Unassigned',
    t.distance.toString(),
    t.cargoWeight.toString(),
    t.status,
    t.revenue ? t.revenue.toString() : '0'
  ])

  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="transitops-trips-report.csv"',
    },
  })
}
