'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from './actions'
import { Truck } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 relative isolate overflow-hidden">
      {/* Ambient background for login */}
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.15]"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-600/20 blur-[150px]"></div>
      </div>

      <div className="max-w-md w-full p-8 glass-panel rounded-2xl mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-teal-500/10 rounded-2xl mb-4 border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
            <Truck className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">TransitOps</h1>
          <p className="text-sm text-slate-400 mt-2 tracking-wide uppercase">Enterprise Command Center</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2.5 glass-input"
              placeholder="manager@transitops.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2.5 glass-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-400 mb-2 uppercase tracking-widest text-[10px]">Demo Access</p>
          <div className="space-y-1">
            <p>manager@transitops.com | dispatcher@transitops.com</p>
            <p>safety@transitops.com | finance@transitops.com</p>
            <p className="mt-2 text-teal-500 font-mono bg-teal-500/10 inline-block px-2 py-1 rounded">pwd: password</p>
          </div>
        </div>
      </div>
    </div>
  )
}
