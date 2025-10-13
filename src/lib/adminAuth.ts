import { supabase } from './supabase'

export async function loginAdmin(email: string, password: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password) // Simple check - we'll improve this later
      .single()

    if (data) {
      // Store in localStorage for session
      localStorage.setItem('admin_session', JSON.stringify({ email: data.email, id: data.id }))
      return true
    }
    return false
  } catch (error) {
    console.error('Login error:', error)
    return false
  }
}

export function logoutAdmin() {
  localStorage.removeItem('admin_session')
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  const session = localStorage.getItem('admin_session')
  return !!session
}

export function getAdminSession() {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem('admin_session')
  return session ? JSON.parse(session) : null
}