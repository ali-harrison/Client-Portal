export interface Project {
  onboarding_completed: unknown
  id: string
  passcode: string
  client_name: string
  project_name: string
  start_date: string
  launch_date: string
  current_phase: number
  created_at: string
}

export interface Phase {
  id: string
  project_id: string
  phase_order: number
  name: string
  status: 'complete' | 'in-progress' | 'upcoming'
  completion: number
  next_steps: string
}

export interface Task {
  id: string
  phase_id: string
  name: string
  completed: boolean
  task_order: number
}

export interface Deliverable {
  id: string
  phase_id: string
  name: string
  status: 'delivered' | 'review' | 'in-progress' | 'not-started'
  file_url?: string
}

export interface ProjectComment {
  // Changed from Comment
  id: string
  deliverable_id: string
  project_id: string
  user_type: 'admin' | 'client'
  user_name: string
  message: string
  created_at: string
}

export interface ProjectFile {
  id: string
  project_id: string
  deliverable_id?: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_by: 'admin' | 'client'
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  password_hash: string
  created_at: string
}
