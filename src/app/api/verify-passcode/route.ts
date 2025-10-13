import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { projectId, passcode } = await request.json()

    // Validate input
    if (!projectId || !passcode) {
      return NextResponse.json(
        { success: false, message: 'Missing projectId or passcode' },
        { status: 400 }
      )
    }

    // Query database for matching project
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, passcode')
      .eq('id', projectId)
      .single()

    if (error || !project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if passcode matches
    if (project.passcode.toUpperCase() === passcode.toUpperCase()) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid passcode' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Passcode verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}