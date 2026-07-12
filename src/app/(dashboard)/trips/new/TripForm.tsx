'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createTripAction } from './actions'

type Vehicle = { id: string; registrationNum: string; capacity: number }
type Driver = { id: string; name: string }

export default function TripForm({ vehicles, drivers }: { vehicles: Vehicle[], drivers: Driver[] }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Client-side selection state for dynamic capacity validation
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [actionType, setActionType] = useState('draft')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Client-side validation for capacity
    const v = vehicles.find(v => v.id === selectedVehicle)
    if (v && parseFloat(cargoWeight) > v.capacity) {
      setError(`Cargo weight (${cargoWeight} kg) exceeds the vehicle's capacity (${v.capacity} kg).`)
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('action', actionType)
    const result = await createTripAction(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/trips')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <Link href="/trips" className="p-2.5 bg-slate-900/50 border border-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent">Dispatch Trip</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Create and dispatch a new trip.</p>
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
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Source Location *</label>
              <input name="source" required className="w-full px-4 py-2.5 glass-input" placeholder="e.g. Warehouse A" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Destination *</label>
              <input name="destination" required className="w-full px-4 py-2.5 glass-input" placeholder="e.g. Store B" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Cargo Weight (kg) *</label>
              <input 
                name="cargoWeight" 
                type="number" 
                required 
                min="1" 
                step="0.1" 
                value={cargoWeight}
                onChange={e => setCargoWeight(e.target.value)}
                className="w-full px-4 py-2.5 glass-input" 
                placeholder="450" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Estimated Distance (km) *</label>
              <input name="distance" type="number" required min="0.1" step="0.1" className="w-full px-4 py-2.5 glass-input" placeholder="45" />
            </div>
            
            <div className="sm:col-span-2 pt-6 border-t border-white/5">
              <h3 className="text-sm font-bold text-slate-200 mb-4 tracking-wide uppercase">Assignment <span className="text-slate-500 font-medium normal-case">(Optional for Draft)</span></h3>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Assign Vehicle</label>
              <select 
                name="vehicleId" 
                value={selectedVehicle}
                onChange={e => setSelectedVehicle(e.target.value)}
                className="w-full px-4 py-2.5 glass-input appearance-none"
              >
                <option value="">-- Unassigned --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNum} (Cap: {v.capacity}kg)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Assign Driver</label>
              <select name="driverId" className="w-full px-4 py-2.5 glass-input appearance-none">
                <option value="">-- Unassigned --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-4">
            <button type="submit" name="action" value="draft" onClick={() => setActionType('draft')} disabled={loading} className="px-5 py-2.5 glass-panel hover:bg-white/10 text-slate-300 font-bold rounded-lg transition-all disabled:opacity-50">
              Save as Draft
            </button>
            <button type="submit" name="action" value="dispatch" onClick={() => setActionType('dispatch')} disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
              {loading ? 'Processing...' : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Dispatch Now
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
