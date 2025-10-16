'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ClientOnboarding from '@/components/ClientOnboarding'
import { CheckCircle } from 'lucide-react'

export default function OnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [loading, setLoading] = useState(true)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [project, setProject] = useState<unknown>(null)

  useEffect(() => {
    checkOnboardingStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const checkOnboardingStatus = async () => {
    try {
      // Check if onboarding already completed
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectData) {
        setProject(projectData)
        if (projectData.onboarding_completed) {
          setAlreadyCompleted(true)
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    router.push(`/project/${projectId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Already Completed
          </h1>
          <p className="text-slate-600 mb-6">
            You&apos;ve already completed the onboarding questionnaire for this
            project.
          </p>
          <button
            onClick={() => router.push(`/project/${projectId}`)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg font-semibold"
          >
            Go to Project Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <ClientOnboarding
      projectId={projectId}
      onComplete={handleOnboardingComplete}
    />
  )
}
