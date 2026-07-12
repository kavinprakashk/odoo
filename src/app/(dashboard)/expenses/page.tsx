import { PrismaClient } from '@prisma/client'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function ExpensesPage() {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  // Only Fleet Manager and Financial Analyst can access expenses
  if (user.role !== 'Fleet Manager' && user.role !== 'Financial Analyst') {
    redirect('/?error=Access+denied+to+expenses+page.')
  }

  const expenses = await prisma.expense.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: 'desc' }
  })
  
  const fuelLogs = await prisma.fuelLog.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: 'desc' }
  })

  // We can merge them and sort by date for a unified ledger, but keeping them separate or unified in a single table works. Let's merge for display.
  const unified = [
    ...expenses.map(e => ({ ...e, isFuel: false })),
    ...fuelLogs.map(f => ({ 
      id: f.id, 
      type: 'Fuel', 
      description: `${f.fuelConsumed} L consumed`, 
      cost: f.cost, 
      date: f.date, 
      vehicle: f.vehicle, 
      isFuel: true 
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-300 to-purple-400 bg-clip-text text-transparent">Expenses & Fuel</h1>
          <p className="text-slate-400 mt-1 font-medium">Track operational costs and fuel logs.</p>
        </div>
        {user.role === 'Financial Analyst' && (
          <Link 
            href="/expenses/new"
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] text-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Expense
          </Link>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-4 bg-slate-900/30">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              className="w-full pl-11 pr-4 py-2.5 glass-input"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Vehicle</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">Description</th>
                <th className="px-6 py-4 font-bold text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {unified.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No records found.
                  </td>
                </tr>
              ) : (
                unified.map((item) => (
                  <tr key={item.id + (item.isFuel ? '-f' : '-e')} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">
                      {item.vehicle.registrationNum}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                        item.isFuel ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-400 drop-shadow-sm">
                      ${item.cost.toFixed(2)}
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
