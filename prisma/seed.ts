import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data
  await prisma.expense.deleteMany()
  await prisma.fuelLog.deleteMany()
  await prisma.maintenance.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Users (Demo Credentials)
  await prisma.user.createMany({
    data: [
      { email: 'manager@transitops.com', password: 'password', role: 'Fleet Manager' },
      { email: 'dispatcher@transitops.com', password: 'password', role: 'Dispatcher' },
      { email: 'safety@transitops.com', password: 'password', role: 'Safety Officer' },
      { email: 'finance@transitops.com', password: 'password', role: 'Financial Analyst' },
    ],
  })

  // 2. Create Vehicles
  const van1 = await prisma.vehicle.create({
    data: {
      registrationNum: 'VAN-05',
      model: 'Ford Transit',
      type: 'Van',
      capacity: 500,
      odometer: 12000,
      acquisitionCost: 35000,
      region: 'North',
      status: 'Available',
    },
  })

  const truck1 = await prisma.vehicle.create({
    data: {
      registrationNum: 'TRK-11',
      model: 'Volvo FH16',
      type: 'Heavy Truck',
      capacity: 25000,
      odometer: 185000,
      acquisitionCost: 120000,
      region: 'East',
      status: 'In Shop',
    },
  })

  // 3. Create Drivers
  const driver1 = await prisma.driver.create({
    data: {
      name: 'Alex Johnson',
      licenceNumber: 'LIC-78901',
      category: 'C1',
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)), // Valid for 2 years
      contact: '555-0101',
      safetyScore: 98.5,
      status: 'Available',
    },
  })

  await prisma.driver.create({
    data: {
      name: 'Sarah Smith',
      licenceNumber: 'LIC-45602',
      category: 'CE',
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // Expired
      contact: '555-0102',
      safetyScore: 82.0,
      status: 'Suspended',
    },
  })

  // 4. Create Trips
  await prisma.trip.create({
    data: {
      source: 'Warehouse A',
      destination: 'Store B',
      cargoWeight: 400,
      distance: 45,
      revenue: 150,
      status: 'Completed',
      vehicleId: van1.id,
      driverId: driver1.id,
    }
  })

  // 5. Create Maintenance
  await prisma.maintenance.create({
    data: {
      issue: 'Routine Oil Change',
      serviceProvider: 'QuickFix Auto',
      cost: 120,
      date: new Date(new Date().setDate(new Date().getDate() - 5)),
      status: 'Closed',
      vehicleId: van1.id,
    }
  })

  await prisma.maintenance.create({
    data: {
      issue: 'Engine overhaul',
      serviceProvider: 'HeavyDuty Mechanics',
      cost: 4500,
      date: new Date(),
      status: 'Open',
      vehicleId: truck1.id,
    }
  })

  // 6. Create Fuel Log
  await prisma.fuelLog.create({
    data: {
      fuelConsumed: 25,
      cost: 85,
      distance: 45, // Associated with trip1
      date: new Date(new Date().setDate(new Date().getDate() - 2)),
      vehicleId: van1.id,
    }
  })

  // 7. Create Expense
  await prisma.expense.create({
    data: {
      type: 'Toll',
      description: 'Highway toll',
      cost: 15,
      date: new Date(new Date().setDate(new Date().getDate() - 2)),
      vehicleId: van1.id,
    }
  })

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
