import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-6">
          Client Project Portal
        </h1>
        <p className="text-xl text-slate-300 mb-12">
          Track your project progress in real-time
        </p>
        
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 p-4 rounded-full">
              <Lock className="w-12 h-12 text-slate-700" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Access Your Project
          </h2>
          <p className="text-slate-600 mb-8">
            Enter your unique passcode to view your project dashboard
          </p>
          
          <Link 
            href="/project/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
          >
            View Demo Project
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}