'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isAdminLoggedIn } from '@/lib/adminAuth'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import Link from 'next/link'

export default function AdminOnboardingView() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [loading, setLoading] = useState(true)
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const [project, setProject] = useState<any>(null)

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin')
      return
    }
    fetchOnboardingData()
  }, [projectId])

  const fetchOnboardingData = async () => {
    try {
      // Fetch project info
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectData) {
        setProject(projectData)
      }

      // Fetch onboarding responses
      const { data: responseData } = await supabase
        .from('onboarding_responses')
        .select('*')
        .eq('project_id', projectId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single()

      if (responseData) {
        setOnboardingData(responseData)
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadAsJSON = () => {
    const dataStr = JSON.stringify(onboardingData.response_data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project?.project_name}-onboarding.json`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading onboarding data...</p>
        </div>
      </div>
    )
  }

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/admin/project/${projectId}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              No Onboarding Data
            </h1>
            <p className="text-slate-600">
              The client hasn&apos;t completed their onboarding questionnaire
              yet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const data = onboardingData.response_data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/admin/project/${projectId}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {project?.project_name}
              </h1>
              <p className="text-slate-600">
                Onboarding Questionnaire Response
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Submitted:{' '}
                {new Date(onboardingData.submitted_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={downloadAsJSON}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {/* Content - I'll continue this in the next message */}
        {/* Content */}
        <div className="space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Company Name
                </label>
                <p className="text-slate-900 mt-1">
                  {data.company_name || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Years in Business
                </label>
                <p className="text-slate-900 mt-1">
                  {data.years_in_business || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Industry
                </label>
                <p className="text-slate-900 mt-1">{data.industry || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-500">
                Why Founded
              </label>
              <p className="text-slate-900 mt-1">
                {data.company_founded_reason || 'N/A'}
              </p>
            </div>
            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-500">
                Problems Solved
              </label>
              <p className="text-slate-900 mt-1">
                {data.problems_solved || 'N/A'}
              </p>
            </div>
            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-500">
                Long-term Goals
              </label>
              <p className="text-slate-900 mt-1">
                {data.long_term_goals || 'N/A'}
              </p>
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Target Audience
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Primary Audience
                </label>
                <p className="text-slate-900 mt-1">
                  {data.primary_audience || 'N/A'}
                </p>
              </div>
              {data.secondary_audience && (
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Secondary Audience
                  </label>
                  <p className="text-slate-900 mt-1">
                    {data.secondary_audience}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Ideal Consumer
                </label>
                <p className="text-slate-900 mt-1">
                  {data.ideal_consumer || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Audience Pain Points
                </label>
                <p className="text-slate-900 mt-1">
                  {data.audience_pain_points || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Brand Ecosystem */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Brand Ecosystem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.website_url && (
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Website
                  </label>
                  <a
                    href={data.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block"
                  >
                    {data.website_url}
                  </a>
                </div>
              )}
              {data.facebook && (
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Facebook
                  </label>
                  <a
                    href={data.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block"
                  >
                    {data.facebook}
                  </a>
                </div>
              )}
              {data.instagram && (
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Instagram
                  </label>
                  <a
                    href={data.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block"
                  >
                    {data.instagram}
                  </a>
                </div>
              )}
              {data.linkedin && (
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    LinkedIn
                  </label>
                  <a
                    href={data.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block"
                  >
                    {data.linkedin}
                  </a>
                </div>
              )}
              {data.twitter && (
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Twitter/X
                  </label>
                  <a
                    href={data.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block"
                  >
                    {data.twitter}
                  </a>
                </div>
              )}
              {data.tiktok && (
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    TikTok
                  </label>
                  <a
                    href={data.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block"
                  >
                    {data.tiktok}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Business Goals */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Business Goals
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Business Problem
                </label>
                <p className="text-slate-900 mt-1">
                  {data.business_problem || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Project Goals
                </label>
                <p className="text-slate-900 mt-1">
                  {data.project_goals || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Success Definition
                </label>
                <p className="text-slate-900 mt-1">
                  {data.success_definition || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Brand Values */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Brand Values & Tonality
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  What Company Stands For
                </label>
                <p className="text-slate-900 mt-1">
                  {data.company_stands_for || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Mission/Vision
                </label>
                <p className="text-slate-900 mt-1">
                  {data.mission_vision || 'N/A'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Brand Values
                  </label>
                  <p className="text-slate-900 mt-1">
                    {data.brand_values || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Brand Adjectives
                  </label>
                  <p className="text-slate-900 mt-1">
                    {data.brand_adjectives || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Brand Personality
                  </label>
                  <p className="text-slate-900 mt-1">
                    {data.brand_personality || 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Tone of Voice
                </label>
                <p className="text-slate-900 mt-1">
                  {data.tone_of_voice || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Brand Emotions
                </label>
                <p className="text-slate-900 mt-1">
                  {data.brand_emotions || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Messaging Goals */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Messaging Goals
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Visitor Feeling
                </label>
                <p className="text-slate-900 mt-1">
                  {data.visitor_feeling || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Visitor Goals
                </label>
                <p className="text-slate-900 mt-1">
                  {data.visitor_goals || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Key Message
                </label>
                <p className="text-slate-900 mt-1">
                  {data.key_message || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Competitors */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Competitor Analysis
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Top Competitors
                </label>
                <p className="text-slate-900 mt-1">
                  {data.competitors || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Differentiation
                </label>
                <p className="text-slate-900 mt-1">
                  {data.differentiation || 'N/A'}
                </p>
              </div>
              {data.inspiring_brands && (
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Inspiring Brands
                  </label>
                  <p className="text-slate-900 mt-1">{data.inspiring_brands}</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Project Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Budget
                </label>
                <p className="text-slate-900 mt-1">{data.budget || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Referral Source
                </label>
                <p className="text-slate-900 mt-1">
                  {data.referral_source || 'N/A'}
                </p>
              </div>
              {data.multiple_languages === 'yes' && data.languages && (
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Languages
                  </label>
                  <p className="text-slate-900 mt-1">{data.languages}</p>
                </div>
              )}
              {data.important_dates && (
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-slate-500">
                    Important Dates
                  </label>
                  <p className="text-slate-900 mt-1">{data.important_dates}</p>
                </div>
              )}
            </div>
            {(data.stock_photography ||
              data.photoshoot ||
              data.copywriting ||
              data.seo) && (
              <div className="mt-4">
                <label className="text-sm font-semibold text-slate-500">
                  Additional Services
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.stock_photography && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Stock Photography
                    </span>
                  )}
                  {data.photoshoot && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Custom Photoshoot
                    </span>
                  )}
                  {data.copywriting && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Copywriting
                    </span>
                  )}
                  {data.seo && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      SEO Services
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Name
                </label>
                <p className="text-slate-900 mt-1">
                  {data.first_name} {data.last_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Email
                </label>
                <p className="text-slate-900 mt-1">{data.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Phone
                </label>
                <p className="text-slate-900 mt-1">{data.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Role
                </label>
                <p className="text-slate-900 mt-1">{data.role || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500">
                  Preferred Contact Method
                </label>
                <p className="text-slate-900 mt-1">
                  {data.contact_preference || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
