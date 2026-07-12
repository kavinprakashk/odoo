import { PrismaClient } from '@prisma/client'
import { Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function DriversPage() {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  const drivers = await prisma.driver.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const canRegister = user.role === 'Fleet Manager' || user.role === 'Safety Officer'

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">Fleet Drivers</h1>
          <p className="text-slate-400 mt-1 font-medium">Manage driver assignments, licences, and safety scores.</p>
        </div>
        {canRegister && (
          <Link 
            href="/drivers/new"
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] text-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Register Driver
          </Link>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-4 bg-slate-900/30">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search driver name or licence..." 
              className="w-full pl-11 pr-4 py-2.5 glass-input"
            />
          </div>
          <button className="flex items-center px-5 py-2.5 glass-panel text-slate-300 font-semibold rounded-lg text-sm hover:bg-white/10 transition-all shadow-md">
            <Filter className="w-4 h-4 mr-2 text-emerald-400" />
            Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Name & Contact</th>
                <th className="px-6 py-4 font-bold">Licence</th>
                <th className="px-6 py-4 font-bold">Safety Score</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No drivers found.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => {
                  const isExpired = new Date(driver.expiryDate) < new Date()
                  const daysLeft = (new Date(driver.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  const isExpiringSoon = daysLeft >= 0 && daysLeft <= 30
                  const isSuspended = driver.status === 'Suspended'
                  const hasLowScore = driver.safetyScore < 80
                  
                  return (
                    <tr key={driver.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-200">{driver.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5 font-medium">{driver.contact}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-300">{driver.licenceNumber} <span className="text-slate-500 font-normal">({driver.category})</span></div>
                        <div className={`text-xs mt-0.5 font-medium ${isExpired ? 'text-red-400' : 'text-slate-400'}`}>
                          Exp: {new Date(driver.expiryDate).toLocaleDateString()}
                          {isExpired && ' (EXPIRED)'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${driver.safetyScore >= 90 ? 'text-teal-400 drop-shadow-md' : driver.safetyScore >= 75 ? 'text-amber-400 drop-shadow-md' : 'text-red-400 drop-shadow-md'}`}>
                            {driver.safetyScore.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                            driver.status === 'Available' && !isExpired ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                            driver.status === 'On Trip' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            driver.status === 'Suspended' || isExpired ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {isExpired && driver.status !== 'Suspended' ? 'Expired' : driver.status}
                          </span>
                          
                          {/* Compliance Badges */}
                          <div className="flex flex-wrap gap-1.5">
                            {isExpired && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">Licence Expired</span>}
                            {!isExpired && isExpiringSoon && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">Expiring &lt;30d</span>}
                            {isSuspended && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">Suspended</span>}
                            {hasLowScore && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">Low Safety Score</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/drivers/${driver.id}`} className="text-teal-400 hover:text-teal-300 font-bold px-3 py-1.5 hover:bg-teal-500/10 rounded-md transition-colors">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
