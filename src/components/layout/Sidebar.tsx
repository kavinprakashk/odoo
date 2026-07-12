'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Truck, Users, Activity, Wrench, CreditCard, LogOut } from 'lucide-react'
import { logoutAction } from '@/app/actions'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Vehicles', href: '/vehicles', icon: Truck },
  { name: 'Drivers', href: '/drivers', icon: Users },
  { name: 'Trips & Dispatch', href: '/trips', icon: Activity },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Expenses', href: '/expenses', icon: CreditCard },
]

const navItemsByRole: Record<string, typeof navItems> = {
  'Fleet Manager': navItems,
  'Dispatcher': [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/vehicles', icon: Truck },
    { name: 'Drivers', href: '/drivers', icon: Users },
    { name: 'Trips & Dispatch', href: '/trips', icon: Activity },
  ],
  'Safety Officer': [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Drivers', href: '/drivers', icon: Users },
    { name: 'Trips & Dispatch', href: '/trips', icon: Activity },
  ],
  'Financial Analyst': navItems,
}

export default function Sidebar({ user, counts }: { user: { email: string, role: string }, counts?: { activeDispatches: number, openMaintenance: number, complianceExceptions: number } }) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await logoutAction()
    window.location.href = '/login'
  }

  const roleColors: Record<string, string> = {
    'Fleet Manager': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'Dispatcher': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'Safety Officer': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Financial Analyst': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  }

  const badgeColor = roleColors[user.role] || 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  const allowedNavItems = navItemsByRole[user.role] || [{ name: 'Dashboard', href: '/', icon: LayoutDashboard }]

  return (
    <aside className="w-64 backdrop-blur-2xl bg-slate-950/60 border-r border-white/5 flex flex-col h-full relative z-10 shadow-2xl">
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <div className="p-2 bg-teal-500/10 rounded-lg mr-3 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
          <Truck className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent block">TransitOps</span>
        </div>
      </div>
      
      <div className="px-6 py-5 border-b border-white/5 bg-slate-900/30">
        <div className="text-sm font-semibold text-slate-200 truncate">{user.email}</div>
        <div className="mt-2.5">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${badgeColor}`}>
            {user.role}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        {allowedNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          let badge = null
          if (counts) {
            if (item.name === 'Trips & Dispatch' && counts.activeDispatches > 0) {
              badge = <span className="ml-auto bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">{counts.activeDispatches}</span>
            }
            if (item.name === 'Maintenance' && counts.openMaintenance > 0) {
              badge = <span className="ml-auto bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">{counts.openMaintenance}</span>
            }
            if (item.name === 'Drivers' && counts.complianceExceptions > 0) {
              badge = <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse">{counts.complianceExceptions}</span>
            }
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-teal-500/10 to-transparent text-teal-300 border-l-2 border-teal-400 shadow-[inset_1px_0_15px_rgba(20,184,166,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {item.name}
              {badge}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-slate-900/20">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-4 py-2.5 text-sm font-semibold text-slate-400 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 mr-3 flex-shrink-0 text-slate-500 group-hover:text-red-400 transition-colors" />
          Secure Sign Out
        </button>
      </div>
    </aside>
  )
}
