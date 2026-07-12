import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewDriverForm from './NewDriverForm'

export default async function NewDriverPage() {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  // Only Fleet Manager and Safety Officer can register new drivers
  if (user.role !== 'Fleet Manager' && user.role !== 'Safety Officer') {
    redirect('/?error=Only+Fleet+Managers+and+Safety+Officers+can+register+drivers.')
  }

  return <NewDriverForm />
}
