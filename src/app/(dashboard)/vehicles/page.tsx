import { PrismaClient, Vehicle } from '@prisma/client'
import { Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function VehiclesPage() {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  // Safety Officer has no vehicle access
  if (user.role === 'Safety Officer') {
    redirect('/?error=Access+denied+to+vehicles+page.')
  }

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const canRegister = user.role === 'Fleet Manager'

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">Fleet Vehicles</h1>
          <p className="text-slate-400 mt-1 font-medium">Manage your fleet, track status, and view details.</p>
        </div>
        {canRegister && (
          <Link 
            href="/vehicles/new"
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] text-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Register Vehicle
          </Link>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-4 bg-slate-900/30">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search registration or model..." 
              className="w-full pl-11 pr-4 py-2.5 glass-input"
            />
          </div>
          <button className="flex items-center px-5 py-2.5 glass-panel text-slate-300 font-semibold rounded-lg text-sm hover:bg-white/10 transition-all shadow-md">
            <Filter className="w-4 h-4 mr-2 text-teal-400" />
            Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Registration</th>
                <th className="px-6 py-4 font-bold">Model & Type</th>
                <th className="px-6 py-4 font-bold">Capacity</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No vehicles found.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle: Vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-200">
                      {vehicle.registrationNum}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-300">{vehicle.model}</div>
                      <div className="text-slate-500 text-xs mt-0.5 uppercase tracking-wide font-medium">{vehicle.type}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-400">
                      {vehicle.capacity} kg
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                        vehicle.status === 'Available' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                        vehicle.status === 'On Trip' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        vehicle.status === 'In Shop' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-4">
                        {user.role === 'Fleet Manager' && vehicle.status !== 'In Shop' && (
                          <Link href={`/maintenance/new?vehicleId=${vehicle.id}`} className="text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 hover:bg-amber-500/10 rounded-md transition-colors">
                            Log Maintenance
                          </Link>
                        )}
                        <Link href={`/vehicles/${vehicle.id}`} className="text-teal-400 hover:text-teal-300 font-bold px-3 py-1.5 hover:bg-teal-500/10 rounded-md transition-colors">
                          View Details
                        </Link>
                      </div>
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
