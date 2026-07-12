'use client'

import { useState } from 'react'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { completeTripAction, cancelTripAction } from './actions'

interface Trip {
  id: string
  source: string
  destination: string
  distance: number
  cargoWeight: number
  status: string
  revenue: number | null
  vehicle?: {
    id: string
    registrationNum: string
    model: string
    capacity: number
  } | null
  driver?: {
    id: string
    name: string
    licenceNumber: string
  } | null
}

export default function TripDetailClient({ trip, role }: { trip: Trip; role: string }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [fuel, setFuel] = useState('')
  const [revenue, setRevenue] = useState('')

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const result = await completeTripAction(trip.id, parseFloat(fuel), parseFloat(revenue))
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setShowComplete(false)
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this trip?')) return
    
    setLoading(true)
    setError('')
    
    const result = await cancelTripAction(trip.id)
    if (result.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative mt-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>

      <div className="flex items-center gap-4 mb-8 relative z-10">
        <Link href="/trips" className="p-2.5 bg-slate-900/50 border border-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent">Trip Details</h1>
          <p className="text-slate-400 text-sm font-mono mt-1">{trip.id}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm relative z-10 shadow-[0_0_15px_rgba(239,68,68,0.1)] font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-xl font-bold text-slate-200 mb-6 tracking-wide">Route Info</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-white/5">
              <span className="text-slate-400 font-bold">Source</span>
              <span className="text-slate-200 font-bold">{trip.source}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-white/5">
              <span className="text-slate-400 font-bold">Destination</span>
              <span className="text-slate-200 font-bold">{trip.destination}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-white/5">
              <span className="text-slate-400 font-bold">Distance</span>
              <span className="text-slate-200 font-bold">{trip.distance} km</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-white/5">
              <span className="text-slate-400 font-bold">Cargo Weight</span>
              <span className="text-slate-200 font-bold">{trip.cargoWeight} kg</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-white/5">
              <span className="text-slate-400 font-bold">Status</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                trip.status === 'Completed' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                trip.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                trip.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-slate-500/10 text-slate-400 border-white/10'
              }`}>
                {trip.status}
              </span>
            </div>
            {trip.revenue && (
              <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-white/5">
                <span className="text-slate-400 font-bold">Revenue</span>
                <span className="text-teal-400 font-bold drop-shadow-sm">${trip.revenue.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-xl font-bold text-slate-200 mb-6 tracking-wide">Assignment</h2>
          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Vehicle</div>
              {trip.vehicle ? (
                <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 shadow-inner">
                  <div className="font-bold text-slate-200 text-lg mb-1">{trip.vehicle.registrationNum}</div>
                  <div className="text-sm font-medium text-slate-400">{trip.vehicle.model} • {trip.vehicle.capacity}kg Cap</div>
                </div>
              ) : <div className="text-slate-500 text-sm font-bold p-4 bg-slate-950/30 rounded-xl border border-white/5">Unassigned</div>}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Driver</div>
              {trip.driver ? (
                <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 shadow-inner">
                  <div className="font-bold text-slate-200 text-lg mb-1">{trip.driver.name}</div>
                  <div className="text-sm font-medium text-slate-400">{trip.driver.licenceNumber}</div>
                </div>
              ) : <div className="text-slate-500 text-sm font-bold p-4 bg-slate-950/30 rounded-xl border border-white/5">Unassigned</div>}
            </div>
          </div>
        </div>
      </div>

      {trip.status === 'Dispatched' && !showComplete && (role === 'Dispatcher' || role === 'Fleet Manager') && (
        <div className="flex justify-end gap-4 mt-8 relative z-10">
          {(role === 'Dispatcher' || role === 'Fleet Manager') && (
            <button 
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-lg transition-all flex items-center shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Cancel Trip
            </button>
          )}
          {role === 'Dispatcher' && (
            <button 
              onClick={() => setShowComplete(true)}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-lg transition-all flex items-center shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Trip
            </button>
          )}
        </div>
      )}

      {trip.status === 'Draft' && (role === 'Dispatcher' || role === 'Fleet Manager') && (
        <div className="flex justify-end gap-4 mt-8 relative z-10">
          <button 
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-lg transition-all flex items-center shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Cancel Draft
          </button>
        </div>
      )}

      {showComplete && (
        <form onSubmit={handleComplete} className="glass-card rounded-2xl p-8 mt-8 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative z-10 border-blue-500/30">
          <h3 className="text-xl font-bold text-slate-100 mb-6 tracking-wide">Complete Trip Logistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Fuel Consumed (L/Gal)</label>
              <input type="number" required min="0" step="0.1" value={fuel} onChange={e => setFuel(e.target.value)} className="w-full px-4 py-2.5 glass-input" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Generated Revenue ($)</label>
              <input type="number" required min="0" step="0.01" value={revenue} onChange={e => setRevenue(e.target.value)} className="w-full px-4 py-2.5 glass-input font-mono" />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setShowComplete(false)} className="px-5 py-2.5 glass-panel hover:bg-white/10 text-slate-300 font-bold rounded-lg transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">Confirm Completion</button>
          </div>
        </form>
      )}
    </div>
  )
}
