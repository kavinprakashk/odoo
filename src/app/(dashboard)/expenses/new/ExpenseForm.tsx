'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createExpenseAction } from './actions'

type Vehicle = { id: string; registrationNum: string }

export default function ExpenseForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFuel, setIsFuel] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    formData.append('isFuel', isFuel.toString())
    const result = await createExpenseAction(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/expenses')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <Link href="/expenses" className="p-2.5 bg-slate-900/50 border border-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-300 to-purple-400 bg-clip-text text-transparent">Log Expense</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Record a fuel log or operational expense.</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 relative z-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-8 mb-8 p-4 bg-slate-950/50 rounded-xl border border-white/5">
            <label className="flex items-center gap-3 text-slate-200 cursor-pointer font-bold tracking-wide">
              <input type="radio" name="expenseType" checked={!isFuel} onChange={() => setIsFuel(false)} className="w-5 h-5 text-violet-500 focus:ring-violet-500 bg-slate-900 border-slate-700" />
              General Expense
            </label>
            <label className="flex items-center gap-3 text-slate-200 cursor-pointer font-bold tracking-wide">
              <input type="radio" name="expenseType" checked={isFuel} onChange={() => setIsFuel(true)} className="w-5 h-5 text-blue-500 focus:ring-blue-500 bg-slate-900 border-slate-700" />
              Fuel Log
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Vehicle *</label>
              <select name="vehicleId" required className="w-full px-4 py-2.5 glass-input appearance-none">
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNum}</option>
                ))}
              </select>
            </div>
            
            {isFuel ? (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Fuel Consumed (L/Gal) *</label>
                  <input name="fuelConsumed" type="number" required min="0.1" step="0.1" className="w-full px-4 py-2.5 glass-input" placeholder="50" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Expense Type *</label>
                  <input name="type" required={!isFuel} className="w-full px-4 py-2.5 glass-input" placeholder="e.g. Toll, Parking" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Description *</label>
                  <input name="description" required={!isFuel} className="w-full px-4 py-2.5 glass-input" placeholder="Detail..." />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Total Cost ($) *</label>
              <input name="cost" type="number" required min="0" step="0.01" className="w-full px-4 py-2.5 glass-input font-mono" placeholder="150" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
            <Link href="/expenses" className="px-5 py-2.5 glass-panel hover:bg-white/10 text-slate-300 font-bold rounded-lg transition-all">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              {loading ? 'Saving...' : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Save Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
