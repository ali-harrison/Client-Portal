'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAdminLoggedIn, logoutAdmin } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import { Project } from '@/lib/types'
import { Plus, LogOut, FolderOpen, Calendar, Users } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin')
      return
    }
    fetchProjects()
  }, [router])

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setProjects(data)
    }
    setLoading(false)
  }

  const handleLogout = () => {
    logoutAdmin()
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-600">
                Manage all client projects
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {projects.length}
                </div>
                <div className="text-sm text-slate-600">Total Projects</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {projects.filter((p) => p.current_phase < 4).length}
                </div>
                <div className="text-sm text-slate-600">Active Projects</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {
                    projects.filter((p) => {
                      const launch = new Date(p.launch_date)
                      const today = new Date()
                      const diff = Math.ceil(
                        (launch.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                      return diff <= 30 && diff > 0
                    }).length
                  }
                </div>
                <div className="text-sm text-slate-600">Launching Soon</div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">All Projects</h2>
            <Link
              href="/admin/project/new"
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          <div className="space-y-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/project/${project.id}`}
                className="block p-4 border border-slate-200 rounded-lg hover:border-slate-900 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {project.project_name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {project.client_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Launch Date</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {new Date(project.launch_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">
                      Phase {project.current_phase + 1} of 5
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 transition-all"
                        style={{
                          width: `${((project.current_phase + 1) / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                    {project.passcode}
                  </div>
                </div>
              </Link>
            ))}

            {projects.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">
                  No projects yet. Create your first one!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
