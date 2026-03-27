'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
}

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:5000/api/questions')
      setQuestions(response.data)
    } catch (error) {
      console.error('Sorular yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.text.trim() || formData.options.some(opt => !opt.trim())) {
      alert('Lütfen tüm alanları doldurun')
      return
    }

    try {
      setLoading(true)
      if (editingId) {
        await axios.put(`http://localhost:5000/api/questions/${editingId}`, formData)
      } else {
        await axios.post('http://localhost:5000/api/questions', formData)
      }
      resetForm()
      fetchQuestions()
    } catch (error) {
      console.error('Soru kaydedilemedi:', error)
      alert('Soru kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (question: Question) => {
    setFormData({
      text: question.text,
      options: question.options,
      correctAnswer: question.correctAnswer,
    })
    setEditingId(question.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Soruyu silmek istediğinizden emin misiniz?')) return

    try {
      setLoading(true)
      await axios.delete(`http://localhost:5000/api/questions/${id}`)
      fetchQuestions()
    } catch (error) {
      console.error('Soru silinemedi:', error)
      alert('Soru silinemedi')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    })
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Paneli</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Soru Ekle/Düzenle Formu */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">
              {editingId ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soru Metni
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Soruyu yazın..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seçenekler
                </label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options]
                        newOptions[index] = e.target.value
                        setFormData({ ...formData, options: newOptions })
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Seçenek ${index + 1}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() =>
                        setFormData({ ...formData, correctAnswer: index })
                      }
                      className="w-4 h-4"
                      title="Doğru cevap"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {loading ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Ekle'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    İptal Et
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Soru Listesi */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">
              Sorular ({questions.length})
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz soru eklenmemiş</p>
              ) : (
                questions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 border border-gray-300 rounded-lg hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-800 mb-2">{question.text}</p>
                    <div className="space-y-1 mb-3">
                      {question.options.map((option, index) => (
                        <p
                          key={index}
                          className={`text-sm ${
                            index === question.correctAnswer
                              ? 'text-green-600 font-semibold'
                              : 'text-gray-600'
                          }`}
                        >
                          {index + 1}. {option}
                        </p>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(question)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 rounded transition"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        disabled={loading}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-sm py-1 rounded transition"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
