'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          📚 Sınav Platformu
        </h1>
        <p className="text-center text-white/60 mb-8">Yapay Zeka Destekli Eğitim</p>

        {!userType && !showNameForm ? (
          <div className="space-y-4">
            <button
              onClick={() => setUserType('admin')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105"
            >
              🔐 Admin Girişi
            </button>
            <button
              onClick={() => setShowNameForm(true)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105"
            >
              👤 Aday Girişi
            </button>
            <button
              onClick={() => setShowNameForm(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105"
            >
              📊 Önceki Sonuçlarımı Görüntüle
            </button>
          </div>
        ) : showNameForm ? (
          <div className="space-y-4">
            <button
              onClick={() => {
                setShowNameForm(false)
                setCandidateName('')
              }}
              className="mb-4 text-sm text-white/60 hover:text-white"
            >
              ← Geri Git
            </button>
            <div>
              <label className="block text-white font-semibold mb-2">Ad Soyad</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCandidateSignUp()
                }}
                placeholder="Adınız ve soyadınız"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-3 focus:outline-none focus:border-white/40 transition"
                autoFocus
              />
            </div>
            <button
              onClick={handleCandidateSignUp}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105"
            >
              Sınava Başla ✓
            </button>
            <button
              onClick={handleViewPreviousResults}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105"
            >
              Önceki Sonuçları Gör 📊
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                setUserType(null)
                setCandidateName('')
              }}
              className="mb-6 text-sm text-white/60 hover:text-white"
            >
              ← Geri Git
            </button>
            {userType === 'admin' ? (
              <Link href="/admin">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105">
                  Admin Paneline Git →
                </button>
              </Link>
            ) : (
              <div className="space-y-3">
                <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-4">
                  <p className="text-white/80 text-sm">Hoş geldiniz,</p>
                  <p className="text-white font-bold text-lg">{candidateName}</p>
                </div>
                <Link href="/exam">
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105">
                    Sınava Başla →
                  </button>
                </Link>
                <button
                  onClick={() => router.push('/aday-sonuclar')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105"
                >
                  Önceki Sonuçlarım 📊
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
