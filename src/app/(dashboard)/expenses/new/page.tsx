import { PrismaClient } from '@prisma/client'
import ExpenseForm from './ExpenseForm'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function NewExpensePage() {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  // Only Financial Analyst can log new expenses
  if (user.role !== 'Financial Analyst') {
    redirect('/?error=Only+Financial+Analysts+can+log+expenses.')
  }
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, registrationNum: true }
  })
  
  return (
    <ExpenseForm vehicles={vehicles} />
  )
}
