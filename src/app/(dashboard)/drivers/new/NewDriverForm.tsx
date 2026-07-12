'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { registerDriverAction } from './actions'

export default function NewDriverForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await registerDriverAction(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/drivers')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <Link href="/drivers" className="p-2.5 bg-slate-900/50 border border-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">Register New Driver</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Add a new driver to the fleet.</p>
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
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Full Name *</label>
              <input name="name" required className="w-full px-4 py-2.5 glass-input" placeholder="e.g. Alex Johnson" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Licence Number *</label>
              <input name="licenceNumber" required className="w-full px-4 py-2.5 glass-input" placeholder="e.g. LIC-12345" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Licence Category *</label>
              <input name="category" required className="w-full px-4 py-2.5 glass-input" placeholder="e.g. CE" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Expiry Date *</label>
              <input name="expiryDate" type="date" required className="w-full px-4 py-2.5 glass-input" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Contact Phone</label>
              <input name="contact" required className="w-full px-4 py-2.5 glass-input" placeholder="555-0199" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Initial Safety Score (0-100)</label>
              <input name="safetyScore" type="number" required min="0" max="100" step="0.1" className="w-full px-4 py-2.5 glass-input" defaultValue="100" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
            <Link href="/drivers" className="px-5 py-2.5 glass-panel hover:bg-white/10 text-slate-300 font-bold rounded-lg transition-all">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              {loading ? 'Saving...' : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Save Driver
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
