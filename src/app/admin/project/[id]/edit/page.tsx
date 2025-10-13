'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { isAdminLoggedIn } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import { Project } from '@/lib/types'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditProject() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [clientName, setClientName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [passcode, setPasscode] = useState('')
  const [startDate, setStartDate] = useState('')
  const [launchDate, setLaunchDate] = useState('')
  const [currentPhase, setCurrentPhase] = useState(0)

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin')
      return
    }
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (data) {
      setProject(data)
      setClientName(data.client_name)
      setProjectName(data.project_name)
      setPasscode(data.passcode)
      setStartDate(data.start_date)
      setLaunchDate(data.launch_date)
      setCurrentPhase(data.current_phase)
    }
    setLoading(false)
  }

  const updateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          client_name: clientName,
          project_name: projectName,
          passcode: passcode,
          start_date: startDate,
          launch_date: launchDate,
          current_phase: currentPhase
        })
        .eq('id', projectId)

      if (updateError) {
        throw updateError
      }

      router.push(`/admin/project/${projectId}`)
    } catch (err: any) {
      setError(err.message || 'Failed to update project')
      setSaving(false)
    }
  }

  const deleteProject = async () => {
    setDeleting(true)
    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (deleteError) {
        throw deleteError
      }

      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to delete project')
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Project not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/project/${projectId}`}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Project</h1>
              <p className="text-sm text-slate-600">Update project details</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={updateProject} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <label htmlFor="clientName" className="block text-sm font-semibold text-slate-900 mb-2">
              Client Name
            </label>
            <input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="projectName" className="block text-sm font-semibold text-slate-900 mb-2">
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="passcode" className="block text-sm font-semibold text-slate-900 mb-2">
              Client Passcode
            </label>
            <input
              id="passcode"
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-slate-900 mb-2">
                Start Date
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
                Target Launch Date
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

          <div>
            <label htmlFor="currentPhase" className="block text-sm font-semibold text-slate-900 mb-2">
              Current Phase
            </label>
            <select
              id="currentPhase"
              value={currentPhase}
              onChange={(e) => setCurrentPhase(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value={0}>Phase 1: Discovery</option>
              <option value={1}>Phase 2: Strategy</option>
              <option value={2}>Phase 3: Design</option>
              <option value={3}>Phase 4: Development</option>
              <option value={4}>Phase 5: Launch</option>
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-6 border-2 border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-600 mb-4">
            Deleting this project will permanently remove all phases, tasks, deliverables, comments, and files. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Project
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Delete Project?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{projectName}</strong>? This will permanently delete all project data including phases, tasks, deliverables, and files. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:border-slate-900 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={deleteProject}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Forever'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}