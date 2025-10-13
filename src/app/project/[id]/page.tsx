'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ClientPortal from '@/components/ClientPortal'
import PasscodeLanding from '@/components/PasscodeLanding'

export default function ProjectPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const urlPasscode = searchParams.get('code')
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    // If passcode is in URL, auto-verify
    if (urlPasscode) {
      verifyPasscode(urlPasscode)
    } else {
      setIsVerifying(false)
    }
  }, [urlPasscode])

  const verifyPasscode = async (passcode: string) => {
    try {
      const response = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, passcode })
      })

      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Verification error:', error)
    }
    
    setIsVerifying(false)
  }

  const handlePasscodeSuccess = () => {
    setIsAuthenticated(true)
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#9ca889] via-[#7ba8a8] to-[#6ba5c7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-light tracking-wide">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <PasscodeLanding projectId={projectId} onSuccess={handlePasscodeSuccess} />
  }

  return <ClientPortal projectId={projectId} />
}