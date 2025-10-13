'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAdminLoggedIn } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Wand2 } from 'lucide-react'
import Link from 'next/link'

export default function NewProject() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [clientName, setClientName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [passcode, setPasscode] = useState('')
  const [startDate, setStartDate] = useState('')
  const [launchDate, setLaunchDate] = useState('')

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin')
      return
    }
    // Generate initial passcode
    generatePasscode()
  }, [])

  const generatePasscode = () => {
    // Generate format: XXXX-XXXX
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars
    const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setPasscode(`${part1}-${part2}`)
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // 1. Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          client_name: clientName,
          project_name: projectName,
          passcode: passcode,
          start_date: startDate,
          launch_date: launchDate,
          current_phase: 0
        })
        .select()
        .single()

      if (projectError) {
        throw projectError
      }

      // 2. Create default phases
      const phasesData = [
        {
          project_id: project.id,
          phase_order: 0,
          name: 'Discovery',
          status: 'in-progress',
          completion: 0,
          next_steps: 'Initial consultation and project kickoff'
        },
        {
          project_id: project.id,
          phase_order: 1,
          name: 'Strategy',
          status: 'upcoming',
          completion: 0,
          next_steps: 'Define site architecture and content strategy'
        },
        {
          project_id: project.id,
          phase_order: 2,
          name: 'Design',
          status: 'upcoming',
          completion: 0,
          next_steps: 'Create mood board and visual designs'
        },
        {
          project_id: project.id,
          phase_order: 3,
          name: 'Development',
          status: 'upcoming',
          completion: 0,
          next_steps: 'Build the website'
        },
        {
          project_id: project.id,
          phase_order: 4,
          name: 'Launch',
          status: 'upcoming',
          completion: 0,
          next_steps: 'Final testing and go live'
        }
      ]

      const { data: phases, error: phasesError } = await supabase
        .from('phases')
        .insert(phasesData)
        .select()

      if (phasesError) {
        throw phasesError
      }

      // 3. Create default tasks for each phase
      const tasksData = []

      // Discovery tasks
      tasksData.push(
        { phase_id: phases[0].id, name: 'Initial consultation call', completed: false, task_order: 0 },
        { phase_id: phases[0].id, name: 'Send client questionnaire', completed: false, task_order: 1 },
        { phase_id: phases[0].id, name: 'Review competitors and inspiration', completed: false, task_order: 2 },
        { phase_id: phases[0].id, name: 'Define project goals', completed: false, task_order: 3 },
        { phase_id: phases[0].id, name: 'Contract signed', completed: false, task_order: 4 }
      )

      // Strategy tasks
      tasksData.push(
        { phase_id: phases[1].id, name: 'Create sitemap', completed: false, task_order: 0 },
        { phase_id: phases[1].id, name: 'Define user flows', completed: false, task_order: 1 },
        { phase_id: phases[1].id, name: 'Content strategy document', completed: false, task_order: 2 },
        { phase_id: phases[1].id, name: 'Technical requirements spec', completed: false, task_order: 3 }
      )

      // Design tasks
      tasksData.push(
        { phase_id: phases[2].id, name: 'Create mood board', completed: false, task_order: 0 },
        { phase_id: phases[2].id, name: 'Define style guide', completed: false, task_order: 1 },
        { phase_id: phases[2].id, name: 'Design homepage', completed: false, task_order: 2 },
        { phase_id: phases[2].id, name: 'Design inner pages', completed: false, task_order: 3 },
        { phase_id: phases[2].id, name: 'Mobile responsive designs', completed: false, task_order: 4 },
        { phase_id: phases[2].id, name: 'Final design approval', completed: false, task_order: 5 }
      )

      // Development tasks
      tasksData.push(
        { phase_id: phases[3].id, name: 'Set up development environment', completed: false, task_order: 0 },
        { phase_id: phases[3].id, name: 'Build component library', completed: false, task_order: 1 },
        { phase_id: phases[3].id, name: 'Develop homepage', completed: false, task_order: 2 },
        { phase_id: phases[3].id, name: 'Build remaining pages', completed: false, task_order: 3 },
        { phase_id: phases[3].id, name: 'Implement animations', completed: false, task_order: 4 },
        { phase_id: phases[3].id, name: 'CMS integration', completed: false, task_order: 5 }
      )

      // Launch tasks
      tasksData.push(
        { phase_id: phases[4].id, name: 'QA testing', completed: false, task_order: 0 },
        { phase_id: phases[4].id, name: 'SEO optimization', completed: false, task_order: 1 },
        { phase_id: phases[4].id, name: 'Analytics setup', completed: false, task_order: 2 },
        { phase_id: phases[4].id, name: 'Final client walkthrough', completed: false, task_order: 3 },
        { phase_id: phases[4].id, name: 'Go live!', completed: false, task_order: 4 }
      )

      await supabase.from('tasks').insert(tasksData)

      // 4. Create default deliverables for each phase
      const deliverablesData = [
        // Discovery
        { phase_id: phases[0].id, name: 'Signed Contract', status: 'not-started' },
        { phase_id: phases[0].id, name: 'Project Brief', status: 'not-started' },
        // Strategy
        { phase_id: phases[1].id, name: 'Site Architecture', status: 'not-started' },
        { phase_id: phases[1].id, name: 'Content Strategy Doc', status: 'not-started' },
        // Design
        { phase_id: phases[2].id, name: 'Mood Board', status: 'not-started' },
        { phase_id: phases[2].id, name: 'Style Guide', status: 'not-started' },
        { phase_id: phases[2].id, name: 'Homepage Design', status: 'not-started' },
        { phase_id: phases[2].id, name: 'Full Site Designs', status: 'not-started' },
        // Development
        { phase_id: phases[3].id, name: 'Staging Site', status: 'not-started' },
        { phase_id: phases[3].id, name: 'CMS Setup', status: 'not-started' },
        // Launch
        { phase_id: phases[4].id, name: 'Live Website', status: 'not-started' },
        { phase_id: phases[4].id, name: 'Training Documentation', status: 'not-started' }
      ]

      await supabase.from('deliverables').insert(deliverablesData)

      // Success! Redirect to the project editor
      router.push(`/admin/project/${project.id}`)

    } catch (err: any) {
      console.error('Error creating project:', err)
      setError(err.message || 'Failed to create project. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create New Project</h1>
              <p className="text-sm text-slate-600">Set up a new client project</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={createProject} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Client Name */}
          <div>
            <label htmlFor="clientName" className="block text-sm font-semibold text-slate-900 mb-2">
              Client Name *
            </label>
            <input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Acme Corp"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
            />
          </div>

          {/* Project Name */}
          <div>
            <label htmlFor="projectName" className="block text-sm font-semibold text-slate-900 mb-2">
              Project Name *
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Website Redesign"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
            />
          </div>

          {/* Passcode */}
          <div>
            <label htmlFor="passcode" className="block text-sm font-semibold text-slate-900 mb-2">
              Client Passcode *
            </label>
            <div className="flex gap-2">
              <input
                id="passcode"
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono"
                required
              />
              <button
                type="button"
                onClick={generatePasscode}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Generate
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              This passcode will be used by the client to access their project portal
            </p>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-slate-900 mb-2">
                Start Date *
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="launchDate" className="block text-sm font-semibold text-slate-900 mb-2">
                Target Launch Date *
              </label>
              <input
                id="launchDate"
                type="date"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-700">
              This will automatically create all 5 project phases (Discovery, Strategy, Design, Development, Launch) 
              with default tasks and deliverables. You can customize everything after creation.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/admin/dashboard"
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:border-slate-900 transition-colors text-center font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}