import { PrismaClient } from '@prisma/client'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import CloseMaintenanceButton from './CloseMaintenanceButton'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function MaintenancePage() {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  // Only Fleet Manager and Financial Analyst can access maintenance
  if (user.role !== 'Fleet Manager' && user.role !== 'Financial Analyst') {
    redirect('/?error=Access+denied+to+maintenance+page.')
  }

  const logs = await prisma.maintenance.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: 'desc' }
  })

  const isManager = user.role === 'Fleet Manager'

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Maintenance</h1>
          <p className="text-slate-400 mt-1 font-medium">Track vehicle repairs and shop status.</p>
        </div>
        {isManager && (
          <Link 
            href="/maintenance/new"
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] text-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Maintenance
          </Link>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-4 bg-slate-900/30">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search issues or vehicles..." 
              className="w-full pl-11 pr-4 py-2.5 glass-input"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Issue</th>
                <th className="px-6 py-4 font-bold">Vehicle</th>
                <th className="px-6 py-4 font-bold">Service Provider & Cost</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">{log.issue}</div>
                      <div className="text-slate-500 text-xs mt-0.5 font-medium">{new Date(log.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-300">{log.vehicle.registrationNum}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-300">{log.serviceProvider}</div>
                      <div className="text-amber-400 font-bold mt-0.5">${log.cost.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                        log.status === 'Open' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-white/10'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === 'Open' ? (
                        isManager ? (
                          <CloseMaintenanceButton id={log.id} />
                        ) : (
                          <span className="text-amber-400 text-xs font-bold px-3 py-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">Open</span>
                        )
                      ) : (
                        <span className="text-slate-500 text-xs font-bold px-3 py-1.5 bg-slate-500/10 rounded-md border border-white/5">Closed</span>
                      )}
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
