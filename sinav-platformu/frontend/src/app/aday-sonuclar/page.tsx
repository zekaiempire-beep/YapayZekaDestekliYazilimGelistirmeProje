'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ExamResult {
  id: string
  examId: string
  score: number
  totalQuestions: number
  feedback: string
  timestamp?: string
}

interface ExamInfo {
  id: string
  title: string
  description?: string
  questionCount?: number
}

export default function AdaySonuclarPage() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
  const [exams, setExams] = useState<Map<string, ExamInfo>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidateName, setCandidateName] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    // localStorage'dan adayı al
    const savedName = localStorage.getItem('candidateName')
    if (savedName) {
      setCandidateName(savedName)
      fetchAllResults()
    } else {
      setError('Lütfen önce adınızı girin')
      setTimeout(() => router.push('/'), 2000)
    }
  }, [])

  const fetchAllResults = async () => {
    try {
      setLoading(true)
      setError(null)

      // Tüm sınavları getir
      const examsResponse = await axios.get('http://localhost:5000/api/exams/management')
      const examsMap = new Map()
      examsResponse.data.forEach((exam: ExamInfo) => {
        examsMap.set(exam.id, exam)
      })
      setExams(examsMap)

      // Her sınav için sonuçları getir
      const allResults: ExamResult[] = []
      for (const exam of examsResponse.data) {
        try {
          const resultsResponse = await axios.get(
            `http://localhost:5000/api/exams/results/${exam.id}`
          )
          allResults.push(...resultsResponse.data)
        } catch (err) {
          // Bu sınav için sonuç yoksa devam et
        }
      }

      // Tarihe göre sırala (en yeni önce)
      allResults.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0).getTime()
        const dateB = new Date(b.timestamp || 0).getTime()
        return dateB - dateA
      })

      setResults(allResults)

      if (allResults.length === 0) {
        setError('Henüz sınav sonucu bulunmamaktadır. Sınavlara katıldıktan sonra sonuçlarını görebilirsiniz.')
      }
    } catch (err) {
      console.error('Sonuçlar yüklenemedi:', err)
      setError('Sonuçlar yüklenirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">📊 Önceki Sınav Sonuçlarım</h1>
            <p className="text-white/60 mt-2">
              👤 <span className="font-semibold text-white">{candidateName}</span>
            </p>
          </div>
          <Link href="/">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105">
              ← Ana Sayfaya Dön
            </button>
          </Link>
        </div>

        {loading && (
          <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
            <p className="text-white/80 text-lg">⏳ Sonuçlar yükleniyor...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 backdrop-blur border border-red-400/50 rounded-xl p-4 mb-8">
            <p className="text-red-200">⚠️ {error}</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sonuçlar Listesi */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-6 max-h-[70vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-4">📋 Sınav Sonuçları</h2>

                {results.length === 0 ? (
                  <p className="text-white/60">Henüz sınav sonucu yok.</p>
                ) : (
                  <div className="space-y-3">
                    {results.map((result, index) => {
                      const exam = exams.get(result.examId)
                      const percentage = Math.round((result.score / result.totalQuestions) * 100)
                      const isSelected = selectedResult?.id === result.id

                      return (
                        <button
                          key={result.id}
                          onClick={() => setSelectedResult(result)}
                          className={`w-full text-left p-4 rounded-lg transition border-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400 shadow-lg'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <p className="font-semibold text-white">
                            {exam?.title || `Sınav #${index + 1}`}
                          </p>
                          <p className="text-sm text-white/70 mt-1">
                            📊 %{percentage} ({result.score}/{result.totalQuestions})
                          </p>
                          {result.timestamp && (
                            <p className="text-xs text-white/50 mt-2">
                              {new Date(result.timestamp).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sonuç Detayı */}
            <div className="lg:col-span-2">
              {selectedResult ? (
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur rounded-2xl border border-green-400/30 p-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-green-300 mb-6">
                      {exams.get(selectedResult.examId)?.title}
                    </h2>

                    {/* Başarı Kartları */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                        <p className="text-white/60 text-xs uppercase font-semibold mb-2">Doğru Cevaplar</p>
                        <p className="text-3xl font-bold text-green-400">{selectedResult.score}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                        <p className="text-white/60 text-xs uppercase font-semibold mb-2">Toplam Soru</p>
                        <p className="text-3xl font-bold text-white">{selectedResult.totalQuestions}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                        <p className="text-white/60 text-xs uppercase font-semibold mb-2">Başarı Oranı</p>
                        <p className="text-3xl font-bold text-cyan-400">
                          %{Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}
                        </p>
                      </div>
                    </div>

                    {/* Geri Bildirim */}
                    <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                      <h3 className="text-xl font-bold text-white mb-4">🤖 AI Geri Bildirimi</h3>
                      <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
                        {selectedResult.feedback}
                      </div>
                    </div>

                    {selectedResult.timestamp && (
                      <div className="mt-6 text-center">
                        <p className="text-white/60 text-sm">
                          📅 {new Date(selectedResult.timestamp).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-12 text-center">
                  <p className="text-white/60 text-lg">👈 Sonuç seçin</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
