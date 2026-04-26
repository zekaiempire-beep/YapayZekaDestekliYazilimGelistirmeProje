'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Carousel from '@/components/Carousel'

export default function Home() {
  const [userType, setUserType] = useState<'admin' | 'aday' | null>(null)
  const [candidateName, setCandidateName] = useState('')
  const [showNameForm, setShowNameForm] = useState(false)
  const router = useRouter()

  const handleCandidateSignUp = () => {
    if (candidateName.trim()) {
      localStorage.setItem('candidateName', candidateName.trim())
      setUserType('aday')
      setShowNameForm(false)
    }
  }

  const handleViewPreviousResults = () => {
    if (candidateName.trim()) {
      localStorage.setItem('candidateName', candidateName.trim())
      router.push('/aday-sonuclar')
    }
  }

  return (
    <div className="relative w-full min-h-screen">
      {/* Carousel Background */}
      <Carousel />
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-black text-center text-white mb-1 whitespace-nowrap">📚 Sınav Platformu</h1>
        <p className="text-center text-white/70 mb-10 text-lg">Yapay Zeka Destekli Eğitim Sistemi</p>

        {!userType && !showNameForm ? (
          <div className="space-y-3">
            <button
              onClick={() => setUserType('admin')}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">🔐</span>
                <span>Admin Paneli</span>
              </div>
            </button>
            
            <button
              onClick={() => setShowNameForm(true)}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-green-500/50 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">👤</span>
                <span>Aday girişi</span>
              </div>
            </button>
          </div>
        ) : showNameForm ? (
          <div className="space-y-4">
            <button
              onClick={() => {
                setShowNameForm(false)
                setCandidateName('')
              }}
              className="mb-2 text-sm text-white/70 hover:text-white transition flex items-center gap-2"
            >
              ← Geri Git
            </button>
            
            <div className="mb-6">
              <label className="block text-white font-bold mb-3 text-lg">Adınız ve Soyadınız</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCandidateSignUp()
                }}
                placeholder="Adınız ve soyadınız"
                className="w-full bg-white/10 border-2 border-white/30 text-white placeholder-white/50 rounded-lg px-4 py-3 focus:outline-none focus:border-green-400 focus:bg-white/15 transition"
                autoFocus
              />
            </div>
            
            <button
              onClick={handleCandidateSignUp}
              className="w-full group bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-green-500/50 transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>Sınava Başla</span>
              <span className="text-xl">✓</span>
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                setUserType(null)
                setCandidateName('')
              }}
              className="mb-6 text-sm text-white/70 hover:text-white transition flex items-center gap-2"
            >
              ← Geri Git
            </button>
            {userType === 'admin' ? (
              <Link href="/admin">
                <button className="w-full group bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  <span>Admin Paneline Git</span>
                  <span>→</span>
                </button>
              </Link>
            ) : (
              <div className="space-y-3">
                <div className="bg-white/15 border-2 border-white/30 rounded-xl p-6 mb-4 backdrop-blur">
                  <p className="text-white/70 text-sm font-medium">Hoş geldiniz,</p>
                  <p className="text-white font-bold text-2xl mt-1">{candidateName}</p>
                </div>
                <Link href="/exam">
                  <button className="w-full group bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-green-500/50 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                    <span>Sınava Başla</span>
                    <span>→</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
