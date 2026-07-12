'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Wrench, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createMaintenanceAction } from './actions'

type Vehicle = { id: string; registrationNum: string; status: string }

export default function MaintenanceForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const initialVehicleId = searchParams.get('vehicleId') || ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await createMaintenanceAction(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/maintenance')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <Link href="/maintenance" className="p-2.5 bg-slate-900/50 border border-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Log Maintenance</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Create a new maintenance record and set vehicle to In Shop.</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 relative z-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Vehicle *</label>
              <select name="vehicleId" defaultValue={initialVehicleId} required className="w-full px-4 py-2.5 glass-input appearance-none">
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNum} ({v.status})</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Issue Description *</label>
              <input name="issue" required className="w-full px-4 py-2.5 glass-input" placeholder="e.g. Engine Overhaul" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Service Provider *</label>
              <input name="serviceProvider" required className="w-full px-4 py-2.5 glass-input" placeholder="e.g. Joe's Garage" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Estimated Cost ($) *</label>
              <input name="cost" type="number" required min="0" step="0.01" className="w-full px-4 py-2.5 glass-input" placeholder="500" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
            <Link href="/maintenance" className="px-5 py-2.5 glass-panel hover:bg-white/10 text-slate-300 font-bold rounded-lg transition-all">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              {loading ? 'Saving...' : (
                <>
                  <Wrench className="w-4 h-4 mr-2" />
                  Submit Maintenance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
