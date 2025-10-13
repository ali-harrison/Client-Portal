'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { isAdminLoggedIn } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import { Project, Phase, Task, Deliverable, ProjectComment, ProjectFile } from '@/lib/types'  // Changed Comment to ProjectComment
import { 
  CheckCircle, Circle, ArrowLeft, Save, Upload, 
  FileText, Trash2, MessageSquare, Users, Palette, Code, Rocket, X
} from 'lucide-react'
import Link from 'next/link'
import FileUpload from '../../../../components/FileUpload'
import { Copy, Settings } from 'lucide-react'

export default function AdminProjectEditor() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})
  const [deliverables, setDeliverables] = useState<Record<string, Deliverable[]>>({})
  const [comments, setComments] = useState<Record<string, ProjectComment[]>>({})  // Changed Comment[] to ProjectComment[]
  const [activePhase, setActivePhase] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadDeliverableId, setUploadDeliverableId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<Record<string, string>>({})
const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin')
      return
    }
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      // Fetch project
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectData) {
        setProject(projectData)
        setActivePhase(projectData.current_phase || 0)
      }

      // Fetch phases
      const { data: phasesData } = await supabase
        .from('phases')
        .select('*')
        .eq('project_id', projectId)
        .order('phase_order', { ascending: true })

      if (phasesData) {
        setPhases(phasesData)

        // Fetch tasks and deliverables for each phase
        for (const phase of phasesData) {
          // Tasks
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('phase_id', phase.id)
            .order('task_order', { ascending: true })

          if (tasksData) {
            setTasks(prev => ({ ...prev, [phase.id]: tasksData }))
          }

          // Deliverables
          const { data: deliverablesData } = await supabase
            .from('deliverables')
            .select('*')
            .eq('phase_id', phase.id)

          if (deliverablesData) {
            setDeliverables(prev => ({ ...prev, [phase.id]: deliverablesData }))

            // Fetch comments for each deliverable
            for (const deliverable of deliverablesData) {
              const { data: commentsData } = await supabase
                .from('comments')
                .select('*')
                .eq('deliverable_id', deliverable.id)
                .order('created_at', { ascending: true })

              if (commentsData) {
                setComments(prev => ({ ...prev, [deliverable.id]: commentsData }))
              }
            }
          }
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching project data:', error)
      setLoading(false)
    }
  }

  const toggleTask = async (task: Task) => {
    setSaving(true)
    const newCompleted = !task.completed

    // Update in database
    const { error } = await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', task.id)

    if (!error) {
      // Update local state
      setTasks(prev => ({
        ...prev,
        [task.phase_id]: prev[task.phase_id].map(t =>
          t.id === task.id ? { ...t, completed: newCompleted } : t
        )
      }))

      // Recalculate phase completion
      const currentPhase = phases[activePhase]
      if (currentPhase) {
        const phaseTasks = tasks[currentPhase.id] || []
        const completedCount = phaseTasks.filter(t => 
          t.id === task.id ? newCompleted : t.completed
        ).length
        const completionPercent = Math.round((completedCount / phaseTasks.length) * 100)

        await supabase
          .from('phases')
          .update({ completion: completionPercent })
          .eq('id', currentPhase.id)

        setPhases(prev => prev.map(p =>
          p.id === currentPhase.id ? { ...p, completion: completionPercent } : p
        ))
      }
    }

    setSaving(false)
  }

  const updatePhaseCompletion = async (phaseId: string, completion: number) => {
    setSaving(true)
    await supabase
      .from('phases')
      .update({ completion })
      .eq('id', phaseId)

    setPhases(prev => prev.map(p =>
      p.id === phaseId ? { ...p, completion } : p
    ))
    setSaving(false)
  }

  const updateNextSteps = async (phaseId: string, nextSteps: string) => {
    setSaving(true)
    await supabase
      .from('phases')
      .update({ next_steps: nextSteps })
      .eq('id', phaseId)

    setPhases(prev => prev.map(p =>
      p.id === phaseId ? { ...p, next_steps: nextSteps } : p
    ))
    setSaving(false)
  }

 const updateDeliverableStatus = async (deliverableId: string, status: string) => {
  setSaving(true)
  await supabase
    .from('deliverables')
    .update({ status })
    .eq('id', deliverableId)

  const currentPhase = phases[activePhase]
  if (currentPhase && deliverables[currentPhase.id]) {
    setDeliverables(prev => ({
      ...prev,
      [currentPhase.id]: prev[currentPhase.id].map(d =>
        d.id === deliverableId ? { ...d, status: status as Deliverable['status'] } : d
      )
    }))
  }
  setSaving(false)
}

const addAdminComment = async (deliverableId: string) => {
  const message = newComment[deliverableId]?.trim()
  if (!message) return

  setSubmittingComment(deliverableId)

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        deliverable_id: deliverableId,
        project_id: projectId,
        user_type: 'admin',
        user_name: 'Team',
        message: message
      })
      .select()
      .single()

    if (!error && data) {
      setComments(prev => ({
        ...prev,
        [deliverableId]: [...(prev[deliverableId] || []), data]
      }))
      setNewComment(prev => ({ ...prev, [deliverableId]: '' }))
    }
  } catch (err) {
    console.error('Comment error:', err)
  }

  setSubmittingComment(null)
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

  const currentPhase = phases[activePhase]
  const currentTasks = currentPhase ? tasks[currentPhase.id] || [] : []
  const currentDeliverables = currentPhase ? deliverables[currentPhase.id] || [] : []

  const getPhaseIcon = (phaseName: string) => {
    const icons: Record<string, any> = {
      'Discovery': Users,
      'Strategy': FileText,
      'Design': Palette,
      'Development': Code,
      'Launch': Rocket
    }
    return icons[phaseName] || FileText
  }

  const PhaseIcon = currentPhase ? getPhaseIcon(currentPhase.name) : FileText

 const duplicateProject = async () => {
  setSaving(true)
  try {
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        client_name: project.client_name + ' (Copy)',
        project_name: project.project_name + ' (Copy)',
        passcode: `COPY-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        start_date: project.start_date,
        launch_date: project.launch_date,
        current_phase: 0
      })
      .select()
      .single()

    if (projectError) throw projectError

    for (const phase of phases) {
      const { data: newPhase, error: phaseError } = await supabase
        .from('phases')
        .insert({
          project_id: newProject.id,
          phase_order: phase.phase_order,
          name: phase.name,
          status: phase.phase_order === 0 ? 'in-progress' : 'upcoming',
          completion: 0,
          next_steps: phase.next_steps
        })
        .select()
        .single()

      if (phaseError) throw phaseError

      const phaseTasks = tasks[phase.id] || []
      if (phaseTasks.length > 0) {
        const newTasks = phaseTasks.map(task => ({
          phase_id: newPhase.id,
          name: task.name,
          completed: false,
          task_order: task.task_order
        }))
        await supabase.from('tasks').insert(newTasks)
      }

      const phaseDeliverables = deliverables[phase.id] || []
      if (phaseDeliverables.length > 0) {
        const newDeliverables = phaseDeliverables.map(d => ({
          phase_id: newPhase.id,
          name: d.name,
          status: 'not-started'
        }))
        await supabase.from('deliverables').insert(newDeliverables)
      }
    }

    router.push(`/admin/project/${newProject.id}`)
  } catch (err) {
    console.error('Duplicate error:', err)
    alert('Failed to duplicate project')
    setSaving(false)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{project.project_name}</h1>
                <p className="text-sm text-slate-600">{project.client_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saving && (
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
                  Saving...
                </span>
              )}
              <div className="text-right">
                <div className="text-xs text-slate-500">Passcode</div>
                <div className="text-sm font-semibold text-slate-900 font-mono">{project.passcode}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Phase Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Project Phases</h2>
            <span className="text-sm text-slate-600">Phase {activePhase + 1} of {phases.length}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {phases.map((phase, idx) => {
              const Icon = getPhaseIcon(phase.name)
              const isActive = idx === activePhase
              
              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(idx)}
                  className={`p-4 rounded-xl transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-lg scale-105'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-xs font-semibold">{phase.name}</div>
                  <div className="text-xs opacity-75 mt-1">{phase.completion}%</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        {currentPhase && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Phase Details */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-slate-900 p-4 rounded-xl text-white">
                    <PhaseIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{currentPhase.name} Phase</h2>
                    
                    {/* Completion Slider */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600">Phase Completion</span>
                        <span className="font-semibold text-slate-900">{currentPhase.completion}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentPhase.completion}
                        onChange={(e) => updatePhaseCompletion(currentPhase.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Next Steps - Editable */}
                <div className="p-4 bg-violet-50 rounded-lg">
                  <label className="block text-sm font-semibold text-violet-900 mb-2">
                    What&apos;s Next (Client sees this)
                  </label>
                  <textarea
                    value={currentPhase.next_steps}
                    onChange={(e) => updateNextSteps(currentPhase.id, e.target.value)}
                    className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="What should the client expect next?"
                  />
                </div>
              </div>

              {/* Tasks - Clickable */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Tasks (Click to toggle)</h3>
                <div className="space-y-2">
                  {currentTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-slate-700 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deliverables - Editable Status */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Deliverables</h3>
                <div className="space-y-3">
                  {currentDeliverables.map((item) => (
                    <div key={item.id} className="p-4 border-2 border-slate-200 rounded-lg hover:border-slate-300 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <span className="font-medium text-slate-900">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={item.status}
                            onChange={(e) => updateDeliverableStatus(item.id, e.target.value)}
                            className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">In Review</option>
                            <option value="delivered">Delivered</option>
                          </select>
                          <button
                            onClick={() => {
                              setUploadDeliverableId(item.id)
                              setShowUploadModal(true)
                            }}
                            className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            Upload
                          </button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {comments[item.id] && comments[item.id].length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>{comments[item.id].length} comment(s)</span>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {comments[item.id].map((comment) => (
                              <div key={comment.id} className="p-2 bg-slate-50 rounded text-sm">
                                <div className="font-semibold text-slate-900">
                                  {comment.user_name} <span className="font-normal text-slate-500">({comment.user_type})</span>
                                </div>
                                <div className="text-slate-700">{comment.message}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {new Date(comment.created_at).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
<div className="bg-white rounded-2xl shadow-lg p-6">
  <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
  <div className="space-y-3">
    <button 
      onClick={() => {
        setUploadDeliverableId(null)
        setShowUploadModal(true)
      }}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
    >
      <Upload className="w-4 h-4" />
      Upload Files
    </button>
    <Link
      href={`/admin/project/${projectId}/edit`}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-lg hover:border-slate-900 transition-colors"
    >
      <Settings className="w-4 h-4" />
      Edit Project
    </Link>
    <button
      onClick={async () => {
        if (confirm(`Duplicate "${project.project_name}"?`)) {
          await duplicateProject()
        }
      }}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-lg hover:border-slate-900 transition-colors"
    >
      <Copy className="w-4 h-4" />
      Duplicate Project
    </button>
    <Link
      href={`/project/${projectId}?code=${project.passcode}`}
      target="_blank"
      className="block w-full text-center px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-lg hover:border-slate-900 transition-colors"
    >
      View Client Portal
    </Link>
  </div>
</div>

              {/* Project Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Project Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-slate-500">Start Date</div>
                    <div className="font-semibold text-slate-900">
                      {new Date(project.start_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Launch Date</div>
                    <div className="font-semibold text-slate-900">
                      {new Date(project.launch_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Client Passcode</div>
                    <div className="font-mono font-semibold text-slate-900">{project.passcode}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Upload Files</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <FileUpload
                projectId={projectId}
                deliverableId={uploadDeliverableId || undefined}
                onUploadComplete={() => {
                  fetchProjectData()
                  setTimeout(() => setShowUploadModal(false), 2000)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}