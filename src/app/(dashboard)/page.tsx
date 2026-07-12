import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PrismaClient, Trip, Vehicle, Driver, Maintenance, FuelLog, Expense } from '@prisma/client'
import {
  Truck,
  Activity,
  Wrench,
  Users,
  CreditCard,
  DollarSign,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

type TripWithDetails = Trip & { vehicle: Vehicle | null; driver: Driver | null }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const user = await getSession()
  if (!user) redirect('/login')

  const resolvedSearchParams = await searchParams
  const errorMessage = resolvedSearchParams.error

  // Fetch standard data needed for calculations
  const vehicles = await prisma.vehicle.findMany()
  const drivers = await prisma.driver.findMany()
  const trips = await prisma.trip.findMany({
    include: { vehicle: true, driver: true }
  })
  const maintenance = await prisma.maintenance.findMany({
    include: { vehicle: true }
  })
  const expenses = await prisma.expense.findMany()
  const fuelLogs = await prisma.fuelLog.findMany()

  // Common Calculations
  const activeVehicles = vehicles.filter((v: { status: string }) => v.status === 'On Trip').length
  const availableVehicles = vehicles.filter((v: { status: string }) => v.status === 'Available').length
  const maintenanceVehicles = vehicles.filter((v: { status: string }) => v.status === 'In Shop').length
  const driversOnDuty = drivers.filter((d: { status: string }) => d.status === 'On Trip').length

  const totalRevenue = trips.reduce((sum: number, t: Trip) => sum + (t.revenue || 0), 0)
  const totalFuelCost = fuelLogs.reduce((sum: number, f: FuelLog) => sum + f.cost, 0)
  const totalMaintenanceCost = maintenance.reduce((sum: number, m: Maintenance) => sum + m.cost, 0)
  const totalOtherExpenses = expenses.reduce((sum: number, e: Expense) => sum + e.cost, 0)
  const operationalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses

  const totalDistance = trips.filter((t: Trip) => t.status === 'Completed').reduce((sum: number, t: Trip) => sum + t.distance, 0)
  const totalFuelConsumed = fuelLogs.reduce((sum: number, f: FuelLog) => sum + f.fuelConsumed, 0)
  const fuelEfficiency = totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed).toFixed(2) : '0.00'

  const totalAcquisitionCost = vehicles.reduce((sum: number, v: Vehicle) => sum + v.acquisitionCost, 0)
  const roi = totalAcquisitionCost > 0 ? (((totalRevenue - operationalCost) / totalAcquisitionCost) * 100).toFixed(2) : '0.00'
  const costPerKm = totalDistance > 0 ? (operationalCost / totalDistance).toFixed(2) : '—'

  return (
    <div className="space-y-8">
      {/* Alert Banner for Permission Error */}
      {errorMessage && (
        <div className="glass-panel border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-pulse">
          <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm tracking-wide uppercase">Security Alert</h4>
            <p className="text-xs mt-0.5 opacity-90">{decodeURIComponent(errorMessage)}</p>
          </div>
        </div>
      )}

      {/* Dynamic Role-Based Dashboards */}
      {user.role === 'Fleet Manager' && (
        <>
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">Fleet Health & Analytics</h1>
              <p className="text-slate-400 mt-1 font-medium">Welcome back, {user.email}. Here is your operational overview.</p>
            </div>
            <a
              href="/api/export"
              className="px-4 py-2 glass-panel hover:bg-white/10 text-slate-200 font-semibold rounded-lg transition-all text-sm flex items-center shadow-lg hover:shadow-teal-500/20"
            >
              Export Trips CSV
            </a>
          </header>

          {/* Top Level KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-6 flex items-start justify-between">
              <div>
                <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Available Vehicles</h3>
                <p className="text-4xl font-bold text-teal-400 drop-shadow-md">{availableVehicles}</p>
              </div>
              <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]"><Truck className="w-6 h-6 text-teal-400" /></div>
            </div>
            <div className="glass-card rounded-2xl p-6 flex items-start justify-between">
              <div>
                <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Active on Trip</h3>
                <p className="text-4xl font-bold text-blue-400 drop-shadow-md">{activeVehicles}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"><Activity className="w-6 h-6 text-blue-400" /></div>
            </div>
            <div className="glass-card rounded-2xl p-6 flex items-start justify-between">
              <div>
                <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">In Maintenance</h3>
                <p className="text-4xl font-bold text-amber-400 drop-shadow-md">{maintenanceVehicles}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"><Wrench className="w-6 h-6 text-amber-400" /></div>
            </div>
            <div className="glass-card rounded-2xl p-6 flex items-start justify-between">
              <div>
                <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Drivers On Duty</h3>
                <p className="text-4xl font-bold text-slate-100 drop-shadow-md">{driversOnDuty}</p>
              </div>
              <div className="p-3 bg-slate-500/10 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"><Users className="w-6 h-6 text-slate-300" /></div>
            </div>
          </div>

          {/* Financial & Efficiency Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]"><CreditCard className="w-5 h-5 text-red-400" /></div>
                <h3 className="text-slate-200 font-bold tracking-wide">Operational Cost</h3>
              </div>
              <p className="text-4xl font-bold text-red-400 drop-shadow-md mb-6">${operationalCost.toFixed(2)}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Cost per km</span><span className="text-slate-200 font-semibold bg-slate-950/50 px-2 py-1 rounded-md border border-white/5">{costPerKm !== '—' ? '$' + costPerKm : costPerKm}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Fuel</span><span className="text-slate-300 font-semibold">${totalFuelCost.toFixed(2)}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Maintenance</span><span className="text-slate-300 font-semibold">${totalMaintenanceCost.toFixed(2)}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Other</span><span className="text-slate-300 font-semibold">${totalOtherExpenses.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-teal-500/10 rounded-xl border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]"><DollarSign className="w-5 h-5 text-teal-400" /></div>
                <h3 className="text-slate-200 font-bold tracking-wide">Revenue & ROI</h3>
              </div>
              <p className="text-4xl font-bold text-teal-400 drop-shadow-md mb-6">${totalRevenue.toFixed(2)}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Total Acq. Cost</span><span className="text-slate-300 font-semibold">${totalAcquisitionCost.toFixed(2)}</span></div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10"><span className="text-slate-300 font-semibold">Fleet ROI</span><span className="text-teal-400 font-bold text-lg bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">{roi}%</span></div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"><Activity className="w-5 h-5 text-blue-400" /></div>
                <h3 className="text-slate-200 font-bold tracking-wide">Efficiency</h3>
              </div>
              <p className="text-4xl font-bold text-slate-100 drop-shadow-md mb-6">{fuelEfficiency} <span className="text-base font-medium text-slate-400">km / L</span></p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Total Distance</span><span className="text-slate-300 font-semibold">{totalDistance.toFixed(0)} km</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Total Fuel Consumed</span><span className="text-slate-300 font-semibold">{totalFuelConsumed.toFixed(0)} L</span></div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10"><span className="text-slate-300 font-semibold">Fleet Utilisation</span><span className="text-blue-400 font-bold text-lg bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  {vehicles.length > 0 ? ((activeVehicles / vehicles.length) * 100).toFixed(1) : '0.0'}%
                </span></div>
              </div>
            </div>
          </div>

          {/* Visual Analytics */}
          <div className="glass-card rounded-2xl p-8 mt-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
            
            <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              Cost Breakdown by Vehicle Type
            </h3>
            {(() => {
              const costByType = vehicles.reduce((acc, v) => {
                const fuel = fuelLogs.filter(f => f.vehicleId === v.id).reduce((sum, f) => sum + f.cost, 0)
                const maint = maintenance.filter(m => m.vehicleId === v.id).reduce((sum, m) => sum + m.cost, 0)
                const other = expenses.filter(e => e.vehicleId === v.id).reduce((sum, e) => sum + e.cost, 0)
                const total = fuel + maint + other
                if (!acc[v.type]) acc[v.type] = { type: v.type, cost: 0, count: 0 }
                acc[v.type].cost += total
                acc[v.type].count += 1
                return acc
              }, {} as Record<string, { type: string, cost: number, count: number }>)
              
              const data = Object.values(costByType).sort((a, b) => b.cost - a.cost)
              const maxCost = Math.max(...data.map(d => d.cost), 1)

              return (
                <div className="space-y-5">
                  {data.map(d => (
                    <div key={d.type} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-200 tracking-wide">{d.type} <span className="text-slate-500 font-normal">({d.count} vehicles)</span></span>
                        <span className="text-teal-400 font-bold tracking-wide">${d.cost.toFixed(2)}</span>
                      </div>
                      <div className="h-4 bg-slate-950/80 rounded-full overflow-hidden flex border border-white/5 shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
                          style={{ width: `${(d.cost / maxCost) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {data.length === 0 && <div className="text-center text-slate-500 text-sm py-6 glass-panel rounded-lg border-dashed border-slate-700">No data available</div>}
                </div>
              )
            })()}
          </div>
        </>
      )}

      {user.role === 'Dispatcher' && (
        <>
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent">Dispatch Command Center</h1>
              <p className="text-slate-400 mt-1 font-medium">Welcome back, {user.email}. Here is your dispatch command board.</p>
            </div>
            <Link
              href="/trips/new"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] text-sm flex items-center"
            >
              Create Trip & Dispatch
            </Link>
          </header>

          {/* Dispatch Metrics */}
          {(() => {
            const readyDrivers = drivers.filter((d: { status: string; expiryDate: string | number | Date }) => d.status === 'Available' && new Date(d.expiryDate) >= new Date()).length
            const draftTrips = trips.filter((t: { status: string }) => t.status === 'Draft').length
            const activeTripsCount = trips.filter((t: { status: string }) => t.status === 'Dispatched').length
            const dispatchBlockers = vehicles.filter((v: { status: string }) => v.status === 'In Shop').length + drivers.filter((d: { status: string; expiryDate: string | number | Date }) => d.status === 'Suspended' || new Date(d.expiryDate) < new Date()).length

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="glass-card rounded-2xl p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Available Vehicles</h3>
                    <p className="text-3xl font-bold text-teal-400 drop-shadow-md">{availableVehicles}</p>
                  </div>
                  <div className="p-2.5 bg-teal-500/10 rounded-xl border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]"><Truck className="w-5 h-5 text-teal-400" /></div>
                </div>
                <div className="glass-card rounded-2xl p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Ready Drivers</h3>
                    <p className="text-3xl font-bold text-emerald-400 drop-shadow-md">{readyDrivers}</p>
                  </div>
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"><Users className="w-5 h-5 text-emerald-400" /></div>
                </div>
                <div className="glass-card rounded-2xl p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Draft Trips</h3>
                    <p className="text-3xl font-bold text-slate-300 drop-shadow-md">{draftTrips}</p>
                  </div>
                  <div className="p-2.5 bg-slate-500/10 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"><FileText className="w-5 h-5 text-slate-300" /></div>
                </div>
                <div className="glass-card rounded-2xl p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Active Trips</h3>
                    <p className="text-3xl font-bold text-blue-400 drop-shadow-md">{activeTripsCount}</p>
                  </div>
                  <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"><Activity className="w-5 h-5 text-blue-400" /></div>
                </div>
                <div className="glass-card rounded-2xl p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Blockers</h3>
                    <p className="text-3xl font-bold text-red-400 drop-shadow-md">{dispatchBlockers}</p>
                  </div>
                  <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
                </div>
              </div>
            )
          })()}

          {/* Quick Active & Draft Trips list */}
          <div className="glass-card rounded-2xl overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-white/5 bg-slate-900/30">
              <h3 className="text-lg font-bold text-slate-100">Active & Draft Dispatches</h3>
              <p className="text-slate-400 text-xs mt-1 font-medium">Pending actions and active routes</p>
            </div>
            <div className="divide-y divide-white/5">
              {trips.filter((t: TripWithDetails) => t.status === 'Dispatched' || t.status === 'Draft').length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                  No active or draft trips currently.
                </div>
              ) : (
                trips.filter((t: TripWithDetails) => t.status === 'Dispatched' || t.status === 'Draft').slice(0, 5).map((t: TripWithDetails) => (
                  <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div>
                      <div className="font-bold text-slate-200 tracking-wide">{t.source} → {t.destination}</div>
                      <div className="text-xs text-slate-400 mt-1 font-medium">
                        Vehicle: {t.vehicle?.registrationNum || 'None'} • Driver: {t.driver?.name || 'None'} • {t.cargoWeight}kg
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${t.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-800/50 text-slate-400 border-slate-700'
                        }`}>
                        {t.status}
                      </span>
                      <Link href={`/trips/${t.id}`} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 group-hover:text-blue-400 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {user.role === 'Safety Officer' && (
        <>
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">Driver Compliance & Safety</h1>
              <p className="text-slate-400 mt-1 font-medium">Welcome back, {user.email}. Driver safety and compliance tracking dashboard.</p>
            </div>
            <Link
              href="/drivers/new"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] text-sm"
            >
              Register Driver
            </Link>
          </header>

          {/* Safety Metrics */}
          {(() => {
            const valid = drivers.filter((d: { expiryDate: string | number | Date; status: string }) => new Date(d.expiryDate) >= new Date() && d.status !== 'Suspended').length
            const expired = drivers.filter((d: { expiryDate: string | number | Date }) => new Date(d.expiryDate) < new Date()).length
            const suspended = drivers.filter((d: { status: string }) => d.status === 'Suspended').length

            const expiringSoon = drivers.filter((d: { expiryDate: string | number | Date }) => {
              const days = (new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              return days >= 0 && days <= 30
            }).length

            const avgScore = drivers.reduce((sum: number, d: Driver) => sum + d.safetyScore, 0) / (drivers.length || 1)

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="glass-card rounded-2xl p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Valid Licences</h3>
                    <p className="text-3xl font-bold text-emerald-400 drop-shadow-md">{valid}</p>
                  </div>
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                </div>
                <div className="glass-card rounded-2xl p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Expiring &lt;30d</h3>
                    <p className="text-3xl font-bold text-amber-400 drop-shadow-md">{expiringSoon}</p>
                  </div>
                  <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"><Calendar className="w-5 h-5 text-amber-400" /></div>
                </div>
                <div className="glass-card rounded-2xl p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Expired</h3>
                    <p className="text-3xl font-bold text-red-400 drop-shadow-md">{expired}</p>
                  </div>
                  <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]"><ShieldAlert className="w-5 h-5 text-red-400" /></div>
                </div>
                <div className="glass-card rounded-2xl p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Suspended</h3>
                    <p className="text-3xl font-bold text-red-500 drop-shadow-md">{suspended}</p>
                  </div>
                  <div className="p-2.5 bg-red-600/10 rounded-xl border border-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.15)]"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
                </div>
                <div className="glass-card rounded-2xl p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Avg Safety Score</h3>
                    <p className="text-3xl font-bold text-slate-100 drop-shadow-md">{avgScore.toFixed(1)}</p>
                  </div>
                  <div className="p-2.5 bg-slate-500/10 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"><Activity className="w-5 h-5 text-slate-300" /></div>
                </div>
              </div>
            )
          })()}

          {/* Compliance Alerts Queue */}
          {(() => {
            const alerts: { type: 'danger' | 'warning'; msg: string; driverId: string }[] = []

            drivers.forEach((d: Driver) => {
              const isExpired = new Date(d.expiryDate) < new Date()
              const isSuspended = d.status === 'Suspended'
              const lowScore = d.safetyScore < 80

              const daysLeft = (new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              const expiringSoon = daysLeft >= 0 && daysLeft <= 30

              if (isExpired) {
                alerts.push({ type: 'danger', msg: `Driver ${d.name}'s licence expired on ${new Date(d.expiryDate).toLocaleDateString()}`, driverId: d.id })
              }
              if (isSuspended) {
                alerts.push({ type: 'danger', msg: `Driver ${d.name} is Suspended.`, driverId: d.id })
              }
              if (expiringSoon) {
                alerts.push({ type: 'warning', msg: `Driver ${d.name}'s licence expires in ${Math.round(daysLeft)} days.`, driverId: d.id })
              }
              if (lowScore) {
                alerts.push({ type: 'warning', msg: `Driver ${d.name} has a critical safety score of ${d.safetyScore.toFixed(1)}.`, driverId: d.id })
              }
            })

            return (
              <div className="glass-card rounded-2xl overflow-hidden mt-8">
                <div className="px-6 py-5 border-b border-white/5 bg-slate-900/30">
                  <h3 className="text-lg font-bold text-slate-200">Compliance & Safety Alerts Queue</h3>
                  <p className="text-slate-400 text-xs mt-1 font-medium">Real-time driver compliance exceptions</p>
                </div>
                <div className="p-5 space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-slate-400 font-medium text-center py-8 text-sm glass-panel rounded-xl border-dashed border-white/10">All driver licences are compliant and safety scores are optimal.</div>
                  ) : (
                    alerts.map((alert, i) => (
                      <div
                        key={i}
                        className={`group flex items-center justify-between p-4 rounded-xl border text-sm transition-all shadow-sm hover:shadow-md ${alert.type === 'danger'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:border-red-500/30'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:border-amber-500/30'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${alert.type === 'danger' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                          </div>
                          <span className="font-medium tracking-wide">{alert.msg}</span>
                        </div>
                        <Link
                          href={`/drivers/${alert.driverId}`}
                          className={`font-bold hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${alert.type === 'danger' ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/20'
                            }`}
                        >
                          Resolve
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })()}
        </>
      )}

      {user.role === 'Financial Analyst' && (
        <>
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">Fleet Financial Intelligence</h1>
              <p className="text-slate-400 mt-1 font-medium">Welcome back, {user.email}. Fleet cost, fuel, and expense reports.</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/expenses/new"
                className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-400 hover:to-fuchsia-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] text-sm"
              >
                Log Expense / Fuel
              </Link>
              <a
                href="/api/export"
                className="px-5 py-2.5 glass-panel hover:bg-white/10 text-slate-200 font-semibold rounded-lg transition-all text-sm shadow-lg"
              >
                Export Trips CSV
              </a>
            </div>
          </header>

          {/* Financial KPIs */}
          {(() => {
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
                <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Total Revenue</span>
                  <p className="text-3xl font-bold text-teal-400 mt-3 drop-shadow-md">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Operational Cost</span>
                  <p className="text-3xl font-bold text-red-400 mt-3 drop-shadow-md">${operationalCost.toFixed(2)}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Fuel Cost</span>
                  <p className="text-3xl font-bold text-blue-400 mt-3 drop-shadow-md">${totalFuelCost.toFixed(2)}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Maintenance Cost</span>
                  <p className="text-3xl font-bold text-amber-400 mt-3 drop-shadow-md">${totalMaintenanceCost.toFixed(2)}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Fleet ROI</span>
                  <p className="text-3xl font-bold text-violet-400 mt-3 drop-shadow-md">{roi}%</p>
                </div>
                <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Cost per km</span>
                  <p className="text-3xl font-bold text-slate-100 mt-3 drop-shadow-md">{costPerKm !== '—' ? '$' + costPerKm : costPerKm}</p>
                </div>
              </div>
            )
          })()}

          {/* Cost Ledger breakdown & high cost maintenance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="glass-card rounded-2xl p-8 lg:col-span-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
              <h3 className="text-xl font-bold text-slate-100 mb-6">Cost by Vehicle Type</h3>
              {(() => {
                const costByType = vehicles.reduce((acc, v) => {
                  const fuel = fuelLogs.filter(f => f.vehicleId === v.id).reduce((sum, f) => sum + f.cost, 0)
                  const maint = maintenance.filter(m => m.vehicleId === v.id).reduce((sum, m) => sum + m.cost, 0)
                  const other = expenses.filter(e => e.vehicleId === v.id).reduce((sum, e) => sum + e.cost, 0)
                  const total = fuel + maint + other
                  if (!acc[v.type]) acc[v.type] = { type: v.type, cost: 0, count: 0 }
                  acc[v.type].cost += total
                  acc[v.type].count += 1
                  return acc
                }, {} as Record<string, { type: string, cost: number, count: number }>)
                
                const data = Object.values(costByType).sort((a, b) => b.cost - a.cost)
                const maxCost = Math.max(...data.map(d => d.cost), 1)

                return (
                  <div className="space-y-5">
                    {data.map(d => (
                      <div key={d.type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-200 tracking-wide">{d.type} <span className="text-slate-500 font-normal">({d.count})</span></span>
                          <span className="text-violet-400 font-bold tracking-wide">${d.cost.toFixed(2)}</span>
                        </div>
                        <div className="h-4 bg-slate-950/80 rounded-full overflow-hidden flex border border-white/5 shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(139,92,246,0.5)]" 
                            style={{ width: `${(d.cost / maxCost) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {data.length === 0 && <div className="text-center text-slate-500 text-sm py-6 glass-panel rounded-lg border-dashed border-slate-700">No data available</div>}
                  </div>
                )
              })()}
            </div>

            <div className="glass-card rounded-2xl p-8 lg:col-span-2">
              <h3 className="text-xl font-bold text-slate-100 mb-6">Cost Contribution by Vehicle</h3>
              <div className="overflow-x-auto max-h-[350px] custom-scrollbar pr-2">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50 border-y border-white/10 sticky top-0 backdrop-blur-sm">
                    <tr>
                      <th className="px-5 py-3.5 font-bold rounded-tl-lg">Vehicle</th>
                      <th className="px-5 py-3.5 font-bold text-right">Fuel</th>
                      <th className="px-5 py-3.5 font-bold text-right">Maint.</th>
                      <th className="px-5 py-3.5 font-bold text-right rounded-tr-lg">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {vehicles.map((v) => {
                      const fuel = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((sum, f) => sum + f.cost, 0)
                      const maint = maintenance.filter((m) => m.vehicleId === v.id).reduce((sum, m) => sum + m.cost, 0)
                      const other = expenses.filter((e) => e.vehicleId === v.id).reduce((sum, e) => sum + e.cost, 0)
                      const total = fuel + maint + other

                      return (
                        <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-5 py-4 font-bold text-slate-200">{v.registrationNum}</td>
                          <td className="px-5 py-4 text-right font-medium text-slate-400 group-hover:text-blue-300 transition-colors">${fuel.toFixed(2)}</td>
                          <td className="px-5 py-4 text-right font-medium text-slate-400 group-hover:text-amber-300 transition-colors">${maint.toFixed(2)}</td>
                          <td className="px-5 py-4 text-right font-bold text-red-400 group-hover:text-red-300 transition-colors">${total.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 mt-8">
              <h3 className="text-xl font-bold text-slate-100 mb-6">High-Cost Maintenance Issues</h3>
              <div className="space-y-4">
                {maintenance.filter((m: { cost: number }) => m.cost > 500).length === 0 ? (
                  <div className="text-slate-500 font-medium text-center py-8 text-sm glass-panel rounded-xl border-dashed border-white/10">No high-cost maintenance entries (&gt;$500).</div>
                ) : (
                  maintenance.filter((m) => m.cost > 500).map((m) => (
                    <div key={m.id} className="p-4 glass-panel border border-white/5 rounded-xl flex items-center justify-between text-sm transition-all hover:shadow-md hover:bg-white/5">
                      <div>
                        <div className="font-bold text-slate-200 tracking-wide">{m.issue}</div>
                        <div className="text-slate-400 mt-1 font-medium">Vehicle: {m.vehicle.registrationNum} • Provider: {m.serviceProvider}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-red-400 font-bold tracking-wide">${m.cost.toFixed(2)}</span>
                        <div className="text-slate-500 mt-1 font-medium text-xs">{new Date(m.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
