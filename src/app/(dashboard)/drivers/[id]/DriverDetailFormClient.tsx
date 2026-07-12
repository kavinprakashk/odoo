'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateDriverAction } from './actions'

type Driver = {
  id: string
  name: string
  contact: string
  licenceNumber: string
  category: string
  expiryDate: Date
  safetyScore: number
  status: string
}

export default function DriverDetailFormClient({ driver, canEdit }: { driver: Driver; canEdit: boolean }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Format expiry date for input value (YYYY-MM-DD)
  const expiryDateFormatted = new Date(driver.expiryDate).toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canEdit) return

    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const result = await updateDriverAction(driver.id, formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess('Driver updated successfully.')
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <div className="glass-card rounded-2xl p-8 relative z-10 mt-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-teal-500/10 border border-teal-500/50 text-teal-400 p-4 rounded-xl mb-6 text-sm flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.1)]">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Full Name *</label>
            <input
              name="name"
              required
              disabled={!canEdit}
              defaultValue={driver.name}
              className="w-full px-4 py-2.5 glass-input disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Contact Phone *</label>
            <input
              name="contact"
              required
              disabled={!canEdit}
              defaultValue={driver.contact}
              className="w-full px-4 py-2.5 glass-input disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Licence Number *</label>
            <input
              name="licenceNumber"
              required
              disabled={!canEdit}
              defaultValue={driver.licenceNumber}
              className="w-full px-4 py-2.5 glass-input disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Licence Category *</label>
            <input
              name="category"
              required
              disabled={!canEdit}
              defaultValue={driver.category}
              className="w-full px-4 py-2.5 glass-input disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Expiry Date *</label>
            <input
              name="expiryDate"
              type="date"
              required
              disabled={!canEdit}
              defaultValue={expiryDateFormatted}
              className="w-full px-4 py-2.5 glass-input disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Safety Score (0-100) *</label>
            <input
              name="safetyScore"
              type="number"
              required
              min="0"
              max="100"
              step="0.1"
              disabled={!canEdit}
              defaultValue={driver.safetyScore}
              className="w-full px-4 py-2.5 glass-input disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1.5 tracking-wide">Status *</label>
            <select
              name="status"
              required
              disabled={!canEdit}
              defaultValue={driver.status}
              className="w-full px-4 py-2.5 glass-input appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {canEdit && (
          <div className="pt-6 border-t border-white/5 flex justify-end gap-4 relative z-10">
            <button
              type="button"
              onClick={() => router.push('/drivers')}
              className="px-5 py-2.5 glass-panel hover:bg-white/10 text-slate-300 font-bold rounded-lg transition-all"
            >
              Back to List
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
