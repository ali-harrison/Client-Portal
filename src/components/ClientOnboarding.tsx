'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

interface OnboardingData {
  // Company Info
  company_name: string
  company_founded_reason: string
  years_in_business: string
  industry: string
  problems_solved: string
  long_term_goals: string

  // Target Audience
  primary_audience: string
  secondary_audience: string
  tertiary_audience: string
  ideal_consumer: string
  market_research: string
  audience_pain_points: string
  brand_perception: string
  not_target: string

  // Brand Ecosystem
  website_url: string
  facebook: string
  twitter: string
  linkedin: string
  instagram: string
  tiktok: string
  other_presence: string

  // Business Goals
  business_problem: string
  project_goals: string
  success_definition: string

  // Brand Values
  company_stands_for: string
  mission_vision: string
  brand_values: string
  brand_adjectives: string
  not_associated_with: string
  brand_personality: string
  tone_of_voice: string
  brand_emotions: string
  perception_change: string

  // Brand Logistics
  brand_guidelines: string
  voice_document: string
  asset_library: string
  brand_changes: string

  // Messaging
  visitor_feeling: string
  visitor_goals: string
  key_message: string
  ctas: string

  // Marketing
  marketing_campaigns: string
  other_agencies: string
  agency_pain_points: string

  // Competitors
  competitors: string
  differentiation: string
  competitor_advantages: string
  inspiring_brands: string

  // Project Details
  budget: string
  referral_source: string
  multiple_languages: string
  languages: string
  important_dates: string
  stock_photography: boolean
  photoshoot: boolean
  copywriting: boolean
  seo: boolean
  existing_analytics: string

  // Login Info
  hosting_login: string
  domain_login: string
  cms_login: string
  email_platform_login: string
  other_integrations: string

  // Contact
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  contact_preference: string
  additional_notes: string

  brand_guide_urls: string[]
  logo_urls: string[]
  font_urls: string[]
  media_urls: string[]
}

interface ClientOnboardingProps {
  projectId: string
  onComplete?: () => void
}

export default function ClientOnboarding({
  projectId,
  onComplete,
}: ClientOnboardingProps) {
  const [currentSection, setCurrentSection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    brand_guidelines: '',
    voice_document: '',
    asset_library: '',
    multiple_languages: '',
    existing_analytics: '',
    contact_preference: 'email',
    stock_photography: false,
    photoshoot: false,
    copywriting: false,
    seo: false,
    brand_guide_urls: [], // ADD THESE 4 LINES
    logo_urls: [],
    font_urls: [],
    media_urls: [],
  })

  const totalSections = 13
  const progress = (currentSection / totalSections) * 100

  const handleInputChange = (field: keyof OnboardingData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateSection = (): boolean => {
    // Basic validation - you can enhance this
    return true
  }

  const handleNext = () => {
    if (validateSection()) {
      if (currentSection < totalSections) {
        setCurrentSection(currentSection + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrev = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('onboarding_responses').insert({
        project_id: projectId,
        response_data: formData,
        submitted_at: new Date().toISOString(),
      })

      if (error) throw error

      await supabase
        .from('projects')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      if (onComplete) onComplete()
    } catch (error) {
      console.error('Error submitting onboarding:', error)
      alert('There was an error submitting your information. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const [uploadingFiles, setUploadingFiles] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  )

  const uploadFiles = async (
    files: FileList,
    type: 'brand_guide' | 'logo' | 'font' | 'media'
  ) => {
    setUploadingFiles(type)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${projectId}/${type}/${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`

        // Update progress
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

        const { error } = await supabase.storage
          .from('onboarding-assets')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (error) {
          console.error('Upload error:', error)
          alert(`Error uploading ${file.name}: ${error.message}`)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('onboarding-assets')
          .getPublicUrl(fileName)

        if (urlData) {
          uploadedUrls.push(urlData.publicUrl)
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
        }
      }

      // Update form data with URLs
      const urlKey = `${type}_urls` as keyof OnboardingData
      handleInputChange(urlKey, [
        ...((formData[urlKey] as string[]) || []),
        ...uploadedUrls,
      ] as unknown)

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({})
      }, 2000)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setUploadingFiles(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Project Onboarding
          </h1>
          <p className="text-slate-600">
            Help us understand your brand and project needs
          </p>

          {/* Progress Bar */}
          <div className="mt-4 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Section {currentSection} of {totalSections}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8"></div>
        {/* Section 1: Company Information */}
        {currentSection === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              About Your Company
            </h2>
            <p className="text-slate-600 mb-6">
              Let&apos;s start with the basics about your business
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black placeholder:text-black"
                  value={formData.company_name || ''}
                  onChange={(e) =>
                    handleInputChange('company_name', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Why was your company founded? *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.company_founded_reason || ''}
                  onChange={(e) =>
                    handleInputChange('company_founded_reason', e.target.value)
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    How long in business? *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 5 years"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black placeholder:text-black"
                    value={formData.years_in_business || ''}
                    onChange={(e) =>
                      handleInputChange('years_in_business', e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Technology, Fashion"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black placeholder:text-black"
                    value={formData.industry || ''}
                    onChange={(e) =>
                      handleInputChange('industry', e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What problems does your business solve for customers? *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.problems_solved || ''}
                  onChange={(e) =>
                    handleInputChange('problems_solved', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Long-term goals for your brand and how the website fits in *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.long_term_goals || ''}
                  onChange={(e) =>
                    handleInputChange('long_term_goals', e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Target Audience */}
        {currentSection === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Target Audience
            </h2>
            <p className="text-slate-600 mb-6">Who are you trying to reach?</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Primary Target Audience *
                </label>
                <textarea
                  placeholder="Demographics, psychographics, behaviors..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.primary_audience || ''}
                  onChange={(e) =>
                    handleInputChange('primary_audience', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Secondary Target Audience
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.secondary_audience || ''}
                  onChange={(e) =>
                    handleInputChange('secondary_audience', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tertiary Target Audience
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.tertiary_audience || ''}
                  onChange={(e) =>
                    handleInputChange('tertiary_audience', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Describe your ideal target consumer *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.ideal_consumer || ''}
                  onChange={(e) =>
                    handleInputChange('ideal_consumer', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Do you have market research available?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="market_research"
                      value="yes"
                      checked={formData.market_research === 'yes'}
                      onChange={(e) =>
                        handleInputChange('market_research', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">Yes, I can share it</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="market_research"
                      value="no"
                      checked={formData.market_research === 'no'}
                      onChange={(e) =>
                        handleInputChange('market_research', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What are the needs, desires, and pain points of your audience?
                  *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.audience_pain_points || ''}
                  onChange={(e) =>
                    handleInputChange('audience_pain_points', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  How does your audience currently perceive your brand?
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.brand_perception || ''}
                  onChange={(e) =>
                    handleInputChange('brand_perception', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Anyone you do NOT want to target?
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.not_target || ''}
                  onChange={(e) =>
                    handleInputChange('not_target', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Brand Ecosystem */}
        {currentSection === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Brand Ecosystem
            </h2>
            <p className="text-slate-600 mb-6">
              Your current online and offline presence
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder:text-black"
                  value={formData.website_url || ''}
                  onChange={(e) =>
                    handleInputChange('website_url', e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder:text-black"
                    value={formData.facebook || ''}
                    onChange={(e) =>
                      handleInputChange('facebook', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Twitter/X
                  </label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder:text-black"
                    value={formData.twitter || ''}
                    onChange={(e) =>
                      handleInputChange('twitter', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/company/"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder:text-black"
                    value={formData.linkedin || ''}
                    onChange={(e) =>
                      handleInputChange('linkedin', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder:text-black"
                    value={formData.instagram || ''}
                    onChange={(e) =>
                      handleInputChange('instagram', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    TikTok
                  </label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder:text-black"
                    value={formData.tiktok || ''}
                    onChange={(e) =>
                      handleInputChange('tiktok', e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Other Online or Physical Presence
                </label>
                <textarea
                  placeholder="E.g., retail locations, other platforms, events..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.other_presence || ''}
                  onChange={(e) =>
                    handleInputChange('other_presence', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Business Goals */}
        {currentSection === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Business Goals & Objectives
            </h2>
            <p className="text-slate-600 mb-6">What are we solving for?</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What business problem are we trying to solve? *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.business_problem || ''}
                  onChange={(e) =>
                    handleInputChange('business_problem', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Business goals and objectives for this project *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.project_goals || ''}
                  onChange={(e) =>
                    handleInputChange('project_goals', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What will success look like? *
                </label>
                <textarea
                  placeholder="Be specific: metrics, outcomes, achievements..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.success_definition || ''}
                  onChange={(e) =>
                    handleInputChange('success_definition', e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Brand Values & Tonality */}
        {currentSection === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Brand Values & Tonality
            </h2>
            <p className="text-slate-600 mb-6">
              The heart and voice of your brand
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What does your company stand for? *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.company_stands_for || ''}
                  onChange={(e) =>
                    handleInputChange('company_stands_for', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Company Mission or Vision *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.mission_vision || ''}
                  onChange={(e) =>
                    handleInputChange('mission_vision', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Brand Values (list 3-5 core values) *
                </label>
                <textarea
                  placeholder="e.g., Innovation, Integrity, Sustainability..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.brand_values || ''}
                  onChange={(e) =>
                    handleInputChange('brand_values', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Adjectives that describe your brand *
                </label>
                <input
                  type="text"
                  placeholder="e.g., professional, innovative, trustworthy..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black placeholder:text-black"
                  value={formData.brand_adjectives || ''}
                  onChange={(e) =>
                    handleInputChange('brand_adjectives', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What DON&apos;T you want to be associated with?
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.not_associated_with || ''}
                  onChange={(e) =>
                    handleInputChange('not_associated_with', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Brand Personality *
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder:text-black"
                  value={formData.brand_personality || ''}
                  onChange={(e) =>
                    handleInputChange('brand_personality', e.target.value)
                  }
                  required
                >
                  <option value="">Select one...</option>
                  <option value="professional">Professional</option>
                  <option value="playful">Playful</option>
                  <option value="sophisticated">Sophisticated</option>
                  <option value="edgy">Edgy</option>
                  <option value="friendly">Friendly</option>
                  <option value="luxurious">Luxurious</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  How do you want to sound online? (Tone of Voice) *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.tone_of_voice || ''}
                  onChange={(e) =>
                    handleInputChange('tone_of_voice', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What emotions or associations should your brand evoke? *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.brand_emotions || ''}
                  onChange={(e) =>
                    handleInputChange('brand_emotions', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Does the market perception need to change?
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.perception_change || ''}
                  onChange={(e) =>
                    handleInputChange('perception_change', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Brand Logistics */}
        {currentSection === 6 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Brand Logistics
            </h2>
            <p className="text-slate-600 mb-6">
              Existing brand assets and guidelines
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Do you have existing brand guidelines?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="brand_guidelines"
                      value="yes"
                      checked={formData.brand_guidelines === 'yes'}
                      onChange={(e) =>
                        handleInputChange('brand_guidelines', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="brand_guidelines"
                      value="no"
                      checked={formData.brand_guidelines === 'no'}
                      onChange={(e) =>
                        handleInputChange('brand_guidelines', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Do you have a tone of voice or brand voice document?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voice_document"
                      value="yes"
                      checked={formData.voice_document === 'yes'}
                      onChange={(e) =>
                        handleInputChange('voice_document', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voice_document"
                      value="no"
                      checked={formData.voice_document === 'no'}
                      onChange={(e) =>
                        handleInputChange('voice_document', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Do you have an asset library? (photography, graphics, 3D,
                  typography)
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="asset_library"
                      value="yes"
                      checked={formData.asset_library === 'yes'}
                      onChange={(e) =>
                        handleInputChange('asset_library', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="asset_library"
                      value="no"
                      checked={formData.asset_library === 'no'}
                      onChange={(e) =>
                        handleInputChange('asset_library', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Anticipated brand changes or expansions in the near future?
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.brand_changes || ''}
                  onChange={(e) =>
                    handleInputChange('brand_changes', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 7: Messaging Goals */}
        {currentSection === 7 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Messaging Goals
            </h2>
            <p className="text-slate-600 mb-6">
              What should your website communicate?
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  How should visitors feel when interacting with your website? *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.visitor_feeling || ''}
                  onChange={(e) =>
                    handleInputChange('visitor_feeling', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Primary goals for visitors on your website *
                </label>
                <textarea
                  placeholder="e.g., Make a purchase, schedule a call, download a guide..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.visitor_goals || ''}
                  onChange={(e) =>
                    handleInputChange('visitor_goals', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Key message to communicate through your website *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.key_message || ''}
                  onChange={(e) =>
                    handleInputChange('key_message', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Specific calls to action or messaging priorities
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.ctas || ''}
                  onChange={(e) => handleInputChange('ctas', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 8: Existing Marketing */}
        {currentSection === 8 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Existing Marketing
            </h2>
            <p className="text-slate-600 mb-6">
              Current campaigns and partnerships
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Active marketing campaigns we should know about?
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.marketing_campaigns || ''}
                  onChange={(e) =>
                    handleInputChange('marketing_campaigns', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Other agencies currently working with you?
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.other_agencies || ''}
                  onChange={(e) =>
                    handleInputChange('other_agencies', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Any pain points while working with other agencies?
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.agency_pain_points || ''}
                  onChange={(e) =>
                    handleInputChange('agency_pain_points', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 9: Competitor Analysis */}
        {currentSection === 9 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Competitor Analysis
            </h2>
            <p className="text-slate-600 mb-6">
              Understanding your competitive landscape
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Top 3-5 Competitors *
                </label>
                <textarea
                  placeholder="List competitor names and websites..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.competitors || ''}
                  onChange={(e) =>
                    handleInputChange('competitors', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What sets your brand apart from competitors? *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.differentiation || ''}
                  onChange={(e) =>
                    handleInputChange('differentiation', e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Why might a customer choose a competitor?
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.competitor_advantages || ''}
                  onChange={(e) =>
                    handleInputChange('competitor_advantages', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Brands that inspire you (any industry)
                </label>
                <textarea
                  placeholder="Brand names and what you admire about them..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.inspiring_brands || ''}
                  onChange={(e) =>
                    handleInputChange('inspiring_brands', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 10: Project Details */}
        {currentSection === 10 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Project Details
            </h2>
            <p className="text-slate-600 mb-6">
              Timeline, budget, and technical requirements
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Budget Range *
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder:text-black"
                    value={formData.budget || ''}
                    onChange={(e) =>
                      handleInputChange('budget', e.target.value)
                    }
                    required
                  >
                    <option value="">Select range...</option>
                    <option value="under_10k">Under $10,000</option>
                    <option value="10k_25k">$10,000 - $25,000</option>
                    <option value="25k_50k">$25,000 - $50,000</option>
                    <option value="50k_100k">$50,000 - $100,000</option>
                    <option value="over_100k">Over $100,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    How did you hear about us? *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black placeholder:text-black"
                    value={formData.referral_source || ''}
                    onChange={(e) =>
                      handleInputChange('referral_source', e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Does the project need multiple languages?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="multiple_languages"
                      value="yes"
                      checked={formData.multiple_languages === 'yes'}
                      onChange={(e) =>
                        handleInputChange('multiple_languages', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="multiple_languages"
                      value="no"
                      checked={formData.multiple_languages === 'no'}
                      onChange={(e) =>
                        handleInputChange('multiple_languages', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">No</span>
                  </label>
                </div>
              </div>

              {formData.multiple_languages === 'yes' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Which languages?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Spanish, French, Mandarin"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black placeholder:text-black"
                    value={formData.languages || ''}
                    onChange={(e) =>
                      handleInputChange('languages', e.target.value)
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Important dates or launch deadlines
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.important_dates || ''}
                  onChange={(e) =>
                    handleInputChange('important_dates', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional services needed?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.stock_photography || false}
                      onChange={(e) =>
                        handleInputChange('stock_photography', e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-slate-700">Stock Photography</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.photoshoot || false}
                      onChange={(e) =>
                        handleInputChange('photoshoot', e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-slate-700">Custom Photoshoot</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.copywriting || false}
                      onChange={(e) =>
                        handleInputChange('copywriting', e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-slate-700">Copywriting</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.seo || false}
                      onChange={(e) =>
                        handleInputChange('seo', e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-slate-700">SEO Services</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Do you have existing analytics data?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="existing_analytics"
                      value="yes"
                      checked={formData.existing_analytics === 'yes'}
                      onChange={(e) =>
                        handleInputChange('existing_analytics', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="existing_analytics"
                      value="no"
                      checked={formData.existing_analytics === 'no'}
                      onChange={(e) =>
                        handleInputChange('existing_analytics', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 11: Login Information */}
        {currentSection === 11 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Login Information (Optional)
            </h2>
            <p className="text-slate-600 mb-4">
              Access credentials for existing platforms
            </p>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This information will be securely stored.
                Only provide if you&apos;re comfortable sharing at this stage.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hosting Login
                </label>
                <textarea
                  placeholder="Provider, URL, Username"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[100px] resize-vertical"
                  value={formData.hosting_login || ''}
                  onChange={(e) =>
                    handleInputChange('hosting_login', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Domain Registrar Login
                </label>
                <textarea
                  placeholder="Provider, URL, Username"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[100px] resize-vertical"
                  value={formData.domain_login || ''}
                  onChange={(e) =>
                    handleInputChange('domain_login', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  CMS Login
                </label>
                <textarea
                  placeholder="Platform, URL, Username"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[100px] resize-vertical"
                  value={formData.cms_login || ''}
                  onChange={(e) =>
                    handleInputChange('cms_login', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Marketing Platform (e.g., MailChimp)
                </label>
                <textarea
                  placeholder="Platform, URL, Username"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[100px] resize-vertical"
                  value={formData.email_platform_login || ''}
                  onChange={(e) =>
                    handleInputChange('email_platform_login', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Other Third-Party Integration Logins
                </label>
                <textarea
                  placeholder="List any other platforms we may need access to"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[100px] resize-vertical"
                  value={formData.other_integrations || ''}
                  onChange={(e) =>
                    handleInputChange('other_integrations', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 12: Asset Upload */}
        {currentSection === 12 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Brand Assets
            </h2>
            <p className="text-slate-600 mb-4">
              Upload your existing brand materials
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Upload any brand assets you have available. Files will be
                securely stored for the project.
              </p>
            </div>

            <div className="space-y-6">
              {/* Brand Guide */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Brand Guide Documentation
                </label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                  <input
                    type="file"
                    id="brand_guide"
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    disabled={uploadingFiles === 'brand_guide'}
                    onChange={async (e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        await uploadFiles(files, 'brand_guide')
                      }
                    }}
                  />
                  <label
                    htmlFor="brand_guide"
                    className={`cursor-pointer flex flex-col items-center ${
                      uploadingFiles === 'brand_guide' ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {uploadingFiles === 'brand_guide'
                        ? 'Uploading...'
                        : 'Click to upload or drag and drop'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      PDF, DOC, DOCX (Multiple files allowed)
                    </div>
                    {formData.brand_guide_urls &&
                      formData.brand_guide_urls.length > 0 && (
                        <div className="mt-3 text-xs text-green-700 font-medium">
                          ✓ {formData.brand_guide_urls.length} file(s) uploaded
                        </div>
                      )}
                  </label>
                  {Object.keys(uploadProgress).length > 0 && (
                    <div className="mt-4 space-y-2">
                      {Object.entries(uploadProgress).map(
                        ([name, progress]) => (
                          <div key={name} className="text-xs">
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-600">{name}</span>
                              <span className="text-slate-600">
                                {progress}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Files */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Logo Source Files
                </label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50/50 hover:bg-purple-50 transition-colors">
                  <input
                    type="file"
                    id="logo_files"
                    multiple
                    accept=".ai,.eps,.svg,.png,.pdf"
                    className="hidden"
                    disabled={uploadingFiles === 'logo'}
                    onChange={async (e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        await uploadFiles(files, 'logo')
                      }
                    }}
                  />
                  <label
                    htmlFor="logo_files"
                    className={`cursor-pointer flex flex-col items-center ${
                      uploadingFiles === 'logo' ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="text-4xl mb-2">🎨</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {uploadingFiles === 'logo'
                        ? 'Uploading...'
                        : 'Click to upload or drag and drop'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      AI, EPS, SVG, PNG, PDF (Multiple files allowed)
                    </div>
                    {formData.logo_urls && formData.logo_urls.length > 0 && (
                      <div className="mt-3 text-xs text-green-700 font-medium">
                        ✓ {formData.logo_urls.length} file(s) uploaded
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Font Files */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Font Files
                </label>
                <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                  <input
                    type="file"
                    id="font_files"
                    multiple
                    accept=".ttf,.otf,.woff,.woff2"
                    className="hidden"
                    disabled={uploadingFiles === 'font'}
                    onChange={async (e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        await uploadFiles(files, 'font')
                      }
                    }}
                  />
                  <label
                    htmlFor="font_files"
                    className={`cursor-pointer flex flex-col items-center ${
                      uploadingFiles === 'font' ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="text-4xl mb-2">Aa</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {uploadingFiles === 'font'
                        ? 'Uploading...'
                        : 'Click to upload or drag and drop'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      TTF, OTF, WOFF, WOFF2 (Multiple files allowed)
                    </div>
                    {formData.font_urls && formData.font_urls.length > 0 && (
                      <div className="mt-3 text-xs text-green-700 font-medium">
                        ✓ {formData.font_urls.length} file(s) uploaded
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Photos & Videos */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Photos & Video Content
                </label>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-6 bg-green-50/50 hover:bg-green-50 transition-colors">
                  <input
                    type="file"
                    id="media_files"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    disabled={uploadingFiles === 'media'}
                    onChange={async (e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        await uploadFiles(files, 'media')
                      }
                    }}
                  />
                  <label
                    htmlFor="media_files"
                    className={`cursor-pointer flex flex-col items-center ${
                      uploadingFiles === 'media' ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="text-4xl mb-2">📸</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {uploadingFiles === 'media'
                        ? 'Uploading...'
                        : 'Click to upload or drag and drop'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      JPG, PNG, MP4, MOV, etc. (Multiple files allowed)
                    </div>
                    {formData.media_urls && formData.media_urls.length > 0 && (
                      <div className="mt-3 text-xs text-green-700 font-medium">
                        ✓ {formData.media_urls.length} file(s) uploaded
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional Notes or File Links
                </label>
                <textarea
                  placeholder="Share any Dropbox, Google Drive links, or notes about your assets..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-vertical text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.additional_notes || ''}
                  onChange={(e) =>
                    handleInputChange('additional_notes', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 13: Contact Information */}
        {currentSection === 13 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Contact Information
            </h2>
            <p className="text-slate-600 mb-6">How can we reach you?</p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black placeholder:text-black"
                    value={formData.first_name || ''}
                    onChange={(e) =>
                      handleInputChange('first_name', e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black placeholder:text-black"
                    value={formData.last_name || ''}
                    onChange={(e) =>
                      handleInputChange('last_name', e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black placeholder:text-black"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Role/Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., CEO, Marketing Director"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black placeholder:text-black"
                  value={formData.role || ''}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Best way to contact you?
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder:text-black"
                  value={formData.contact_preference || 'email'}
                  onChange={(e) =>
                    handleInputChange('contact_preference', e.target.value)
                  }
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="text">Text/SMS</option>
                  <option value="video">Video Call</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handlePrev}
            disabled={currentSection === 1}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50"
          >
            {currentSection === totalSections ? (
              isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Submit
                </>
              )
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
