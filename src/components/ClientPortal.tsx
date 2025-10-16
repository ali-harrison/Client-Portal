'use client'

import Link from 'next/link'

import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle,
  Circle,
  Users,
  FileText,
  Palette,
  Code,
  Rocket,
  ChevronRight,
  Upload,
  MessageSquare,
  Calendar,
  ExternalLink,
  Menu,
  X,
  LucideIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  Project,
  Phase,
  Task,
  Deliverable,
  ProjectComment,
  ProjectFile,
} from '@/lib/types'
import {
  floatIn,
  revealText,
  cardHover,
  gradientShift,
} from '@/utils/animations'
import { useGSAP } from '@gsap/react'

interface ClientPortalProps {
  projectId: string
}

export default function ClientPortal({ projectId }: ClientPortalProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})
  const [deliverables, setDeliverables] = useState<
    Record<string, Deliverable[]>
  >({})
  const [comments, setComments] = useState<Record<string, ProjectComment[]>>({})
  const [files, setFiles] = useState<Record<string, ProjectFile[]>>({})
  const [activePhase, setActivePhase] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(
    null
  )

  const portalRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const phaseCardsRef = useRef<HTMLDivElement>(null)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleMessage, setScheduleMessage] = useState('')

  useEffect(() => {
    fetchProjectData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  useGSAP(() => {
    if (!loading) {
      if (headerRef.current) {
        gradientShift(headerRef.current)
      }
      if (titleRef.current) {
        revealText(titleRef.current, 0.2)
      }
      if (portalRef.current) {
        floatIn(portalRef.current, 0.3)
      }
      if (phaseCardsRef.current) {
        const cards = phaseCardsRef.current.querySelectorAll('.phase-card')
        cards.forEach((card, i) => {
          floatIn(card as HTMLElement, 0.5 + i * 0.1)
          cardHover(card as HTMLElement)
        })
      }

      // Add hover effects to all cards
      const allCards = document.querySelectorAll('.hover-card')
      allCards.forEach((card) => cardHover(card as HTMLElement))
    }
  }, [loading])

  const fetchProjectData = async () => {
    try {
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectData) {
        setProject(projectData)
        setActivePhase(projectData.current_phase || 0)
      }

      const { data: phasesData } = await supabase
        .from('phases')
        .select('*')
        .eq('project_id', projectId)
        .order('phase_order', { ascending: true })

      if (phasesData) {
        setPhases(phasesData)

        for (const phase of phasesData) {
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('phase_id', phase.id)
            .order('task_order', { ascending: true })

          if (tasksError) {
            console.error(
              'Error fetching tasks for phase',
              phase.id,
              tasksError
            )
          }
          if (tasksData) {
            setTasks((prev) => ({ ...prev, [phase.id]: tasksData }))
          }

          const { data: deliverablesData } = await supabase
            .from('deliverables')
            .select('*')
            .eq('phase_id', phase.id)

          if (deliverablesData) {
            setDeliverables((prev) => ({
              ...prev,
              [phase.id]: deliverablesData,
            }))

            for (const deliverable of deliverablesData) {
              const { data: commentsData } = await supabase
                .from('comments')
                .select('*')
                .eq('deliverable_id', deliverable.id)
                .order('created_at', { ascending: true })

              if (commentsData) {
                setComments((prev) => ({
                  ...prev,
                  [deliverable.id]: commentsData,
                }))
              }

              const { data: filesData } = await supabase
                .from('files')
                .select('*')
                .eq('deliverable_id', deliverable.id)
                .order('created_at', { ascending: false })

              if (filesData) {
                setFiles((prev) => ({ ...prev, [deliverable.id]: filesData }))
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

  const addComment = async (deliverableId: string) => {
    const message = newComment[deliverableId]?.trim()
    if (!message) return

    setSubmittingComment(deliverableId)

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          deliverable_id: deliverableId,
          project_id: projectId,
          user_type: 'client',
          user_name: project?.client_name || 'Client',
          message: message,
        })
        .select()
        .single()

      if (!error && data) {
        setComments((prev) => ({
          ...prev,
          [deliverableId]: [...(prev[deliverableId] || []), data],
        }))
        setNewComment((prev) => ({ ...prev, [deliverableId]: '' }))
      }
    } catch (err) {
      console.error('Comment error:', err)
    }

    setSubmittingComment(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-light tracking-wide">
            Loading your project...
          </p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Project not found</p>
        </div>
      </div>
    )
  }

  const currentPhase = phases[activePhase]
  const currentTasks = currentPhase ? tasks[currentPhase.id] || [] : []
  const currentDeliverables = currentPhase
    ? deliverables[currentPhase.id] || []
    : []
  const getPhaseIcon = (phaseName: string): LucideIcon => {
    const icons: Record<string, LucideIcon> = {
      Discovery: Users,
      Strategy: FileText,
      Design: Palette,
      Development: Code,
      Launch: Rocket,
    }
    return icons[phaseName] || FileText
  }

  const PhaseIcon = currentPhase ? getPhaseIcon(currentPhase.name) : FileText

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      complete: 'bg-emerald-100/80 text-emerald-700 backdrop-blur-sm',
      'in-progress': 'bg-blue-100/80 text-blue-700 backdrop-blur-sm',
      upcoming: 'bg-slate-100/80 text-slate-600 backdrop-blur-sm',
    }
    return badges[status] || badges.upcoming
  }

  // interface ClientPortalProps {
  //   projectId: string
  // }

  interface DeliverableStatusType {
    color: string
    bg: string
    text: string
  }
  const getDeliverableStatus = (status: string): DeliverableStatusType => {
    const statuses: Record<string, DeliverableStatusType> = {
      delivered: {
        color: 'text-emerald-600',
        bg: 'bg-emerald-50/50',
        text: 'Delivered',
      },
      review: {
        color: 'text-blue-600',
        bg: 'bg-blue-50/50',
        text: 'In Review',
      },
      'in-progress': {
        color: 'text-amber-600',
        bg: 'bg-amber-50/50',
        text: 'In Progress',
      },
      'not-started': {
        color: 'text-slate-400',
        bg: 'bg-slate-50/50',
        text: 'Not Started',
      },
    }
    return statuses[status] || statuses['not-started']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9ca889] via-[#7ba8a8] to-[#6ba5c7] bg-[length:200%_200%] animate-gradient">
      <style jsx global>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 15s ease infinite;
        }
      `}</style>

      <header
        ref={headerRef}
        className="bg-white/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-slate-900/5"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                ref={titleRef}
                className="text-4xl font-light tracking-[0.05em] text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600"
                style={{
                  WebkitTextStroke: '1px rgba(0,0,0,0.1)',
                  paintOrder: 'stroke fill',
                }}
              >
                {project.project_name}
              </h1>
              <p className="text-sm text-slate-600 font-light tracking-wider mt-1">
                {project.client_name}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-light tracking-wide">
                  Target Launch
                </div>
                <div className="text-sm font-medium text-slate-700">
                  {new Date(project.launch_date).toLocaleDateString()}
                </div>
              </div>
              <button className="px-6 py-3 bg-white/60 backdrop-blur-sm text-slate-800 rounded-full hover:bg-white/80 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 hover:-translate-y-0.5 font-light tracking-wide">
                <MessageSquare className="w-4 h-4" />
                Contact Us
              </button>
            </div>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* ONBOARDING BANNER - Added here */}
      {project && !project.onboarding_completed && (
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-md backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                  <FileText className="w-6 h-6 text-yellow-900" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-1">
                  Action Required: Complete Onboarding
                </h3>
                <p className="text-yellow-800 text-sm mb-3">
                  Please complete the onboarding questionnaire to help us
                  understand your project better and deliver the best results.
                </p>
                <Link
                  href={`/project/${projectId}/onboarding`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  Start Onboarding
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden bg-white/40 backdrop-blur-xl border-b border-white/20 p-6">
          <div className="space-y-4">
            <div className="text-sm text-slate-600 font-light">
              Target Launch:{' '}
              {new Date(project.launch_date).toLocaleDateString()}
            </div>
            <button className="w-full px-6 py-3 bg-white/60 backdrop-blur-sm text-slate-800 rounded-full flex items-center justify-center gap-2 shadow-lg">
              <MessageSquare className="w-4 h-4" />
              Contact Us
            </button>
          </div>
        </div>
      )}

      <div ref={portalRef} className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/10 p-8 mb-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light tracking-wide text-slate-800">
              Project Progress
            </h2>
            <span className="text-sm text-slate-600 font-light">
              Phase {activePhase + 1} of {phases.length}
            </span>
          </div>
          <div
            ref={phaseCardsRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
          >
            {phases.map((phase, idx) => {
              const Icon = getPhaseIcon(phase.name)
              const isActive = idx === activePhase
              const isPast = phase.status === 'complete'

              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(idx)}
                  className={`phase-card hover-card p-6 rounded-2xl transition-all duration-300 relative backdrop-blur-sm border ${
                    isActive
                      ? 'bg-slate-800/80 text-white shadow-xl border-white/20'
                      : isPast
                      ? 'bg-emerald-50/60 text-emerald-700 shadow-md border-emerald-200/30'
                      : 'bg-white/40 text-slate-500 shadow-sm border-white/30 hover:bg-white/60'
                  }`}
                >
                  {isPast && (
                    <CheckCircle className="absolute top-3 right-3 w-4 h-4" />
                  )}
                  <Icon className="w-7 h-7 mx-auto mb-3" />
                  <div className="text-xs font-light tracking-wide">
                    {phase.name}
                  </div>
                  <div className="text-xs opacity-75 mt-2">
                    {phase.completion}%
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {currentPhase && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="hover-card bg-white/30 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20">
                <div className="flex items-start gap-6">
                  <div className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl text-white shadow-lg">
                    <PhaseIcon className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h2 className="text-3xl font-light tracking-wide text-slate-800">
                        {currentPhase.name} Phase
                      </h2>
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-light tracking-wide ${getStatusBadge(
                          currentPhase.status
                        )}`}
                      >
                        {currentPhase.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-slate-600 font-light">
                          Phase Progress
                        </span>
                        <span className="font-medium text-slate-800">
                          {currentPhase.completion}%
                        </span>
                      </div>
                      <div className="h-3 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                          className="h-full bg-gradient-to-r from-slate-700 to-slate-900 transition-all duration-1000 ease-out rounded-full"
                          style={{ width: `${currentPhase.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hover-card bg-white/30 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20">
                <h3 className="text-xl font-light tracking-wide text-slate-800 mb-6">
                  Tasks & Milestones
                </h3>
                <div className="space-y-3">
                  {currentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-slate-700 font-light ${
                          task.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hover-card bg-white/30 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20">
                <h3 className="text-xl font-light tracking-wide text-slate-800 mb-6">
                  Deliverables
                </h3>
                <div className="space-y-4">
                  {currentDeliverables.map((item) => {
                    const status = getDeliverableStatus(item.status)
                    const deliverableComments = comments[item.id] || []

                    return (
                      <div
                        key={item.id}
                        className={`p-6 rounded-2xl backdrop-blur-sm border border-white/30 ${status.bg} hover:shadow-lg transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <FileText className={`w-5 h-5 ${status.color}`} />
                            <span className="font-light text-slate-800">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-light tracking-wide ${status.color}`}
                            >
                              {status.text}
                            </span>
                            {item.file_url && (
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-white/50 rounded transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 text-slate-400" />
                              </a>
                            )}
                          </div>
                        </div>

                        {deliverableComments.length > 0 && (
                          <div className="mb-4 space-y-3">
                            {deliverableComments.map((comment) => (
                              <div
                                key={comment.id}
                                className={`p-4 rounded-xl text-sm backdrop-blur-sm ${
                                  comment.user_type === 'admin'
                                    ? 'bg-blue-100/60 border border-blue-200/30'
                                    : 'bg-white/60 border border-white/30'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-light text-slate-800">
                                    {comment.user_type === 'admin'
                                      ? '🎨 Team'
                                      : '👤 You'}
                                  </span>
                                  <span className="text-xs text-slate-500 font-light">
                                    {new Date(
                                      comment.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-900 font-light">
                                  {comment.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {files[item.id] && files[item.id].length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs font-light text-slate-600 mb-3 flex items-center gap-2 tracking-wide">
                              <Upload className="w-3 h-3" />
                              Attached Files ({files[item.id].length})
                            </div>
                            <div className="space-y-2">
                              {files[item.id].map((file) => {
                                const isImage =
                                  file.file_type?.startsWith('image/')
                                const isPdf = file.file_type?.includes('pdf')

                                return (
                                  <a
                                    key={file.id}
                                    href={file.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 hover:shadow-md transition-all group"
                                  >
                                    <div
                                      className={`p-2 rounded-lg ${
                                        isImage
                                          ? 'bg-blue-100/80'
                                          : isPdf
                                          ? 'bg-red-100/80'
                                          : 'bg-slate-100/80'
                                      }`}
                                    >
                                      <FileText
                                        className={`w-4 h-4 ${
                                          isImage
                                            ? 'text-blue-600'
                                            : isPdf
                                            ? 'text-red-600'
                                            : 'text-slate-600'
                                        }`}
                                      />
                                    </div>
                                    <span className="flex-1 truncate text-slate-700 text-sm font-light">
                                      {file.file_name}
                                    </span>
                                    <span className="text-xs text-slate-400 group-hover:text-slate-600 font-light">
                                      View
                                    </span>
                                  </a>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newComment[item.id] || ''}
                            onChange={(e) =>
                              setNewComment((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                addComment(item.id)
                              }
                            }}
                            placeholder="Leave feedback or ask a question..."
                            className="flex-1 px-4 py-3 text-sm bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-slate-400/30 focus:border-transparent font-light placeholder:text-slate-500 text-slate-800"
                          />
                          <button
                            onClick={() => addComment(item.id)}
                            disabled={
                              !newComment[item.id]?.trim() ||
                              submittingComment === item.id
                            }
                            className="px-6 py-3 bg-slate-800/80 backdrop-blur-sm text-white text-sm rounded-xl hover:bg-slate-900/80 transition-all duration-300 disabled:bg-slate-300/50 disabled:cursor-not-allowed font-light tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                          >
                            {submittingComment === item.id ? '...' : 'Send'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="hover-card bg-gradient-to-br from-violet-500/80 to-purple-600/80 backdrop-blur-xl rounded-3xl p-8 text-white shadow-xl border border-white/20">
                <h3 className="text-xl font-light mb-4 flex items-center gap-3 tracking-wide">
                  <ChevronRight className="w-5 h-5" />
                  What&apos;s Next
                </h3>
                <p className="text-violet-100 font-light leading-relaxed">
                  {currentPhase.next_steps}
                </p>
              </div>

              <div className="hover-card bg-white/30 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20">
                <h3 className="text-xl font-light tracking-wide text-slate-800 mb-6">
                  Quick Links
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      // Scroll to first deliverable comment input
                      const firstDeliverable = document.querySelector(
                        'input[placeholder*="Leave feedback"]'
                      ) as HTMLInputElement
                      if (firstDeliverable) {
                        firstDeliverable.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        })
                        firstDeliverable.focus()
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/40 transition-all duration-300 group backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-pink-500" />
                      <span className="text-slate-700 group-hover:text-slate-900 font-light">
                        View Designs
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/40 transition-all duration-300 group backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-blue-500" />
                      <span className="text-slate-700 group-hover:text-slate-900 font-light">
                        Upload Assets
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/40 transition-all duration-300 group backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-amber-500" />
                      <span className="text-slate-700 group-hover:text-slate-900 font-light">
                        Schedule Meeting
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="hover-card bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 text-white shadow-xl border border-white/20">
                <h3 className="text-xl font-light mb-4 tracking-wide">
                  Need Help?
                </h3>
                <p className="text-slate-300 text-sm mb-6 font-light leading-relaxed">
                  Questions about the project? We&apos;re here to help!
                </p>
                <a
                  href={`mailto:tewairama@proton.me?subject=Question about ${project.project_name}&body=Hi,%0D%0A%0D%0AI have a question about my project:%0D%0A%0D%0A`}
                  className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm text-slate-900 rounded-xl hover:bg-white transition-all duration-300 font-light tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light text-slate-800">
                  Upload Assets
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-600 font-light mb-6">
                Please email your assets to:{' '}
                <a
                  href={`mailto:tewairama@proton.me?subject=Assets for ${project.project_name}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  tewairama@proton.me
                </a>
              </p>
              <p className="text-sm text-slate-500 font-light">
                Or if you prefer, you can use a file sharing service like
                Dropbox or Google Drive and send us the link.
              </p>
            </div>
          </div>
        )}

        {/* Schedule Meeting Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light text-slate-800">
                  Schedule a Meeting
                </h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={scheduleMessage}
                onChange={(e) => setScheduleMessage(e.target.value)}
                placeholder="Let us know your preferred dates/times or any specific topics you'd like to discuss..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-transparent font-light resize-none"
                rows={5}
              />
              <button
                onClick={() => {
                  window.location.href = `mailto:tewairama@proton.me?subject=Meeting Request - ${
                    project.project_name
                  }&body=${encodeURIComponent(scheduleMessage)}`
                  setShowScheduleModal(false)
                  setScheduleMessage('')
                }}
                disabled={!scheduleMessage.trim()}
                className="w-full mt-4 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed font-light tracking-wide"
              >
                Send Meeting Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
