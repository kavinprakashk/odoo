'use client'

import { useState } from 'react'
import { closeMaintenanceAction } from './actions'

export default function CloseMaintenanceButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClose() {
    if (!confirm('Mark this maintenance as closed? Vehicle will become available.')) return
    
    setLoading(true)
    const res = await closeMaintenanceAction(id)
    if (res.error) {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <button 
      onClick={handleClose}
      disabled={loading}
      className="px-3 py-1.5 text-xs font-bold rounded-md transition-all border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-white"
    >
      {loading ? 'Closing...' : 'Close'}
    </button>
  )
}
