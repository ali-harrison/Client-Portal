'use client'

import { useState } from 'react'
import { Lock, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface PasscodeAuthProps {
  projectId?: string
  onSuccess: (projectData: any) => void
}

export default function PasscodeAuth({ projectId, onSuccess }: PasscodeAuthProps) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Query the database for matching project
      const { data, error: dbError } = await supabase
        .from('projects')
        .select('*')
        .eq('passcode', passcode)
        .single()

      if (dbError || !data) {
        setError('Invalid passcode. Please try again.')
        setLoading(false)
        return
      }

      // Success! Pass project data back
      onSuccess(data)
      
      // Optionally redirect to project page
      if (!projectId) {
        router.push(`/project/${data.id}?code=${passcode}`)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 p-4 rounded-full">
            <Lock className="w-8 h-8 text-slate-700" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
          Access Your Project
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Enter the passcode provided by your project manager
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="passcode" className="block text-sm font-medium text-slate-700 mb-2">
              Passcode
            </label>
            <input
              id="passcode"
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-center text-lg tracking-wider font-mono"
              maxLength={9}
              required
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || passcode.length < 4}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Access Project'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have a passcode?{' '}
          <a href="mailto:hello@yourdomain.com" className="text-slate-900 font-medium hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}