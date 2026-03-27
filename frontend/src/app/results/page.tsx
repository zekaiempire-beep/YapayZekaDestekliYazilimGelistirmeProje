'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

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
}

export default function ResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
  const [exams, setExams] = useState<Map<string, ExamInfo>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllResults()
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
        setError('Henüz sınav sonucu bulunmamaktadır.')
      }
    } catch (err) {
      console.error('Sonuçlar yüklenemedi:', err)
      setError('Sonuçlar yüklenirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-700 text-lg">Sonuçlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Sınav Sonuçlarım</h1>
            <p className="text-gray-600 mt-2">Önceki test sonuçlarınızı görüntüleyin</p>
          </div>
          <Link href="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition">
              ← Ana Sayfaya Dön
            </button>
          </Link>
        </div>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <p className="text-yellow-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sonuçlar Listesi */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 max-h-[70vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Sonuçlar</h2>

              {results.length === 0 ? (
                <p className="text-gray-600">Henüz sınav sonucu yok.</p>
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
                            ? 'bg-blue-50 border-blue-500 shadow-md'
                            : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <p className="font-semibold text-gray-800">
                          {exam?.title || `Sınav #${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          📊 %{percentage} ({result.score}/{result.totalQuestions})
                        </p>
                        {result.timestamp && (
                          <p className="text-xs text-gray-500 mt-2">
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
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    {exams.get(selectedResult.examId)?.title}
                  </h2>

                  {/* Başarı Kartı */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
                    <p className="text-lg opacity-90 mb-2">Başarı Oranınız</p>
                    <p className="text-5xl font-bold mb-2">
                      %{Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}
                    </p>
                    <p className="text-lg">
                      {selectedResult.score} / {selectedResult.totalQuestions} Doğru
                    </p>
                  </div>

                  {/* Geri Bildirim */}
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      📋 Detaylı Analiz
                    </h3>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed font-mono text-sm">
                      {selectedResult.feedback}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link href="/exam">
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                      ✏️ Yeni Sınava Gir
                    </button>
                  </Link>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    Temizle
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center h-[70vh]">
                <div className="text-center">
                  <p className="text-2xl text-gray-600 mb-4">
                    {results.length > 0
                      ? 'Sonuç ayrıntılarını görmek için listeden seçin'
                      : 'Henüz sonuç yok'}
                  </p>
                  <p className="text-gray-500">
                    {results.length > 0 && '↖️ Sol taraftan bir sonuç seçin'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
