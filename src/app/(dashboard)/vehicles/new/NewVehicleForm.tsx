'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { registerVehicleAction } from './actions'

export default function NewVehicleForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await registerVehicleAction(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/vehicles')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <Link href="/vehicles" className="p-2.5 bg-slate-900/50 border border-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">Register New Vehicle</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Add a new vehicle to your fleet.</p>
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
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Registration Number *</label>
              <input name="registrationNum" required className="w-full px-4 py-2.5 glass-input" placeholder="e.g. VAN-99" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Model *</label>
              <input name="model" required className="w-full px-4 py-2.5 glass-input" placeholder="e.g. Ford Transit" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Vehicle Type *</label>
              <select name="type" required className="w-full px-4 py-2.5 glass-input appearance-none">
                <option value="Van">Van</option>
                <option value="Light Truck">Light Truck</option>
                <option value="Heavy Truck">Heavy Truck</option>
                <option value="Refrigerated">Refrigerated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Cargo Capacity (kg) *</label>
              <input name="capacity" type="number" required min="1" step="0.1" className="w-full px-4 py-2.5 glass-input" placeholder="500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Current Odometer (km)</label>
              <input name="odometer" type="number" required min="0" step="1" className="w-full px-4 py-2.5 glass-input" defaultValue="0" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Acquisition Cost ($)</label>
              <input name="acquisitionCost" type="number" required min="0" step="0.01" className="w-full px-4 py-2.5 glass-input" placeholder="35000" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Operating Region</label>
              <input name="region" required className="w-full px-4 py-2.5 glass-input" placeholder="e.g. North Region" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
            <Link href="/vehicles" className="px-5 py-2.5 glass-panel hover:bg-white/10 text-slate-300 font-bold rounded-lg transition-all">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              {loading ? 'Saving...' : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Save Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
