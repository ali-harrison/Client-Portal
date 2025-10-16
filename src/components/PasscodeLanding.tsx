/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'
import { floatIn, blurToFocus, revealText } from '@/utils/animations'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface PasscodeLandingProps {
  projectId: string
  onSuccess: () => void
}

export default function PasscodeLanding({
  projectId,
  onSuccess,
}: PasscodeLandingProps) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const sparklesRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (containerRef.current) {
      // Animate background
      gsap.to(containerRef.current, {
        backgroundPosition: '100% 50%',
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }

    if (titleRef.current) {
      revealText(titleRef.current, 0.3)
    }

    if (subtitleRef.current) {
      floatIn(subtitleRef.current, 0.6)
    }

    if (formRef.current) {
      blurToFocus(formRef.current, 0.9)
    }

    if (sparklesRef.current) {
      gsap.to(sparklesRef.current.children, {
        y: -20,
        opacity: 0,
        duration: 2,
        stagger: 0.2,
        repeat: -1,
        ease: 'power2.out',
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, passcode: passcode.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)

        // Animate success
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            scale: 1.1,
            filter: 'blur(20px)',
            opacity: 0,
            duration: 1,
            ease: 'power2.in',
            onComplete: () => {
              onSuccess()
            },
          })
        }
      } else {
        setError('Invalid passcode. Please try again.')

        // Shake animation on error
        if (formRef.current) {
          gsap.fromTo(
            formRef.current,
            { x: -10 },
            {
              x: 10,
              duration: 0.1,
              repeat: 5,
              yoyo: true,
              ease: 'power1.inOut',
            }
          )
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#9ca889] via-[#7ba8a8] to-[#6ba5c7] bg-[length:200%_200%]"
    >
      {/* Animated sparkles background */}
      <div ref={sparklesRef} className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
            }}
          />
        ))}
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-200/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/20 backdrop-blur-xl p-6 rounded-3xl border border-white/30 shadow-2xl">
            <Lock className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-5xl md:text-6xl font-light text-center mb-4 text-white tracking-wide"
          style={{
            textShadow: '0 2px 20px rgba(0,0,0,0.1)',
          }}
        >
          Welcome
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-center text-white/80 mb-12 font-light tracking-wide text-lg"
        >
          Enter your access code to view your project
        </p>

        {/* Form */}
        <div ref={formRef}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-2xl">
              <label
                htmlFor="passcode"
                className="block text-sm font-light text-white/90 mb-3 tracking-wide"
              >
                Access Code
              </label>
              <input
                id="passcode"
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                className="w-full px-6 py-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 font-light tracking-widest text-center text-xl transition-all duration-300"
                maxLength={9}
                disabled={loading || success}
                autoFocus
              />

              {error && (
                <p className="mt-4 text-red-200 text-sm text-center font-light animate-pulse">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || success || passcode.length < 5}
              className="w-full px-8 py-5 bg-white/90 backdrop-blur-sm text-slate-800 rounded-xl hover:bg-white transition-all duration-300 font-light tracking-wide text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : success ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Welcome! Opening...
                </span>
              ) : (
                <>
                  Enter Portal
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Helper text */}
          <p className="text-center text-white/60 text-sm mt-6 font-light">
            Don&apos;t have an access code?{' '}
            <a
              href="mailto:hello@yourdomain.com"
              className="text-white/90 hover:text-white underline transition-colors"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
