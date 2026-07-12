import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewVehicleForm from './NewVehicleForm'

export default async function NewVehiclePage() {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  // Only Fleet Manager can register new vehicles
  if (user.role !== 'Fleet Manager') {
    redirect('/?error=Only+Fleet+Managers+can+register+vehicles.')
  }

  return <NewVehicleForm />
}
