import { PrismaClient, Prisma } from '@prisma/client'
import { Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function TripsPage({
  searchParams
}: {
  searchParams: { status?: string; cargo?: string; query?: string }
}) {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  const resolvedSearchParams = await searchParams
  const statusFilter = resolvedSearchParams?.status || ''
  const cargoFilter = resolvedSearchParams?.cargo || ''
  const queryFilter = resolvedSearchParams?.query || ''

  const whereClause: Prisma.TripWhereInput = {}
  
  if (statusFilter && statusFilter !== 'All') {
    whereClause.status = statusFilter
  }
  
  if (cargoFilter && cargoFilter !== 'All') {
    if (cargoFilter === 'Light') whereClause.cargoWeight = { lt: 500 }
    if (cargoFilter === 'Medium') whereClause.cargoWeight = { gte: 500, lte: 2000 }
    if (cargoFilter === 'Heavy') whereClause.cargoWeight = { gt: 2000 }
  }

  if (queryFilter) {
    whereClause.OR = [
      { source: { contains: queryFilter } },
      { destination: { contains: queryFilter } }
    ]
  }

  const trips = await prisma.trip.findMany({
    where: whereClause,
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  const isDispatcher = user.role === 'Dispatcher'

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent">Trips & Dispatch</h1>
          <p className="text-slate-400 mt-1 font-medium">Manage active dispatches and view trip history.</p>
        </div>
        {isDispatcher && (
          <Link 
            href="/trips/new"
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] text-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Trip
          </Link>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <form className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-4 bg-slate-900/30" method="GET" action="/trips">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              name="query"
              defaultValue={queryFilter}
              placeholder="Search source or destination..." 
              className="w-full pl-11 pr-4 py-2.5 glass-input"
            />
          </div>
          <select name="status" defaultValue={statusFilter || 'All'} className="px-4 py-2.5 glass-input appearance-none min-w-[140px]">
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select name="cargo" defaultValue={cargoFilter || 'All'} className="px-4 py-2.5 glass-input appearance-none min-w-[140px]">
            <option value="All">All Cargo</option>
            <option value="Light">Light (&lt;500kg)</option>
            <option value="Medium">Medium (500-2000kg)</option>
            <option value="Heavy">Heavy (&gt;2000kg)</option>
          </select>
          <button type="submit" className="flex items-center px-5 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-bold hover:bg-blue-500/20 transition-colors shadow-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </form>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Route</th>
                <th className="px-6 py-4 font-bold">Assignment</th>
                <th className="px-6 py-4 font-bold">Cargo & Dist</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No trips found.
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200 tracking-wide">{trip.source} → {trip.destination}</div>
                      <div className="text-slate-500 text-xs mt-0.5 font-medium">Trip ID: <span className="font-mono">{trip.id.substring(0, 8)}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-300">{trip.vehicle ? trip.vehicle.registrationNum : 'Unassigned'}</div>
                      <div className="text-slate-500 text-xs mt-0.5 font-medium">{trip.driver ? trip.driver.name : 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-400">
                      {trip.cargoWeight} kg / {trip.distance} km
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                        trip.status === 'Completed' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                        trip.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        trip.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-slate-500/10 text-slate-400 border-white/10'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/trips/${trip.id}`} className="text-blue-400 hover:text-blue-300 font-bold px-3 py-1.5 hover:bg-blue-500/10 rounded-md transition-colors">
                        Manage Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
