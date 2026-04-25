'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [userType, setUserType] = useState<'admin' | 'aday' | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Sınav Platformu
        </h1>

        {!userType ? (
          <div className="space-y-4">
            <button
              onClick={() => setUserType('admin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Admin Girişi
            </button>
            <button
              onClick={() => setUserType('aday')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Aday Girişi
            </button>
            <Link href="/results">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition">
                📊 Sonuçlarımı Görüntüle
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setUserType(null)}
              className="mb-6 text-sm text-gray-600 hover:text-gray-800"
            >
              ← Geri Git
            </button>
            {userType === 'admin' ? (
              <Link href="/admin">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition">
                  Admin Paneline Git
                </button>
              </Link>
            ) : (
              <div className="space-y-3">
                <Link href="/exam">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition">
                    Sınava Başla
                  </button>
                </Link>
                <Link href="/results">
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition">
                    📊 Önceki Sonuçlarım
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
