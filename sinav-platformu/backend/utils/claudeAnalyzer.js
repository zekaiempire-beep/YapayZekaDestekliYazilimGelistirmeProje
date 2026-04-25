import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const analyzeExamAnswers = async (questions, answers) => {
  // Doğru cevapları belirle ve yanlışları tespit et
  const wrongAnswers = []
  let correctCount = 0

  answers.forEach((answer, index) => {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) return

    const correctIndex = parseInt(question.correctAnswer)
    const selectedIndex = parseInt(answer.selectedAnswer)

    if (correctIndex === selectedIndex) {
      correctCount++
    } else {
      wrongAnswers.push({
        questionId: question.id,
        questionNumber: index + 1,  // Sınavda kaçıncı soru
        question: question.text,
        selectedAnswer: question.options[selectedIndex],
        correctAnswer: question.options[correctIndex],
        topic: question.topic || 'Bilinmiyor',
        options: question.options,
      })
    }
  })

  const score = correctCount
  const totalQuestions = questions.length
  const percentage = Math.round((correctCount / questions.length) * 100)

  // Gemini API varsa kullan, yoksa mock response döndür
  if (!process.env.GEMINI_API_KEY) {
    let mockFeedback = `📊 Başarı Oranı: %${percentage} (${correctCount}/${totalQuestions})\n\n`

    if (wrongAnswers.length === 0) {
      mockFeedback += `🌟 MÜKEMMEL SONUÇ!\n`
      mockFeedback += `Tüm soruları doğru cevapladığınız için tebrikler! 🎉\n`
      mockFeedback += `Bu konuda oldukça iyi bir anlayış sergilemişsiniz. Böyle devam edin!`
    } else {
      mockFeedback += `📝 GÖZDEN GEÇIRILMESI GEREKEN KONULAR:\n\n`
      
      wrongAnswers.forEach((w, i) => {
        mockFeedback += `📌 SORU ${w.questionNumber}\n`
        mockFeedback += `🏷️ KONU: ${w.topic}\n`
        mockFeedback += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        mockFeedback += `❓ Soru: ${w.question}\n`
        mockFeedback += `✅ Doğru cevap: ${w.correctAnswer}\n\n`
      })
      
      mockFeedback += `💡 AI GERİ BİLDİRİMİ:\n\n`
      mockFeedback += `🎯 TAVSIYE EDILEN ÇALIŞMA:\n`
      wrongAnswers.forEach((w, i) => {
        mockFeedback += `Soru ${w.questionNumber}: Bu konu hakkında daha detaylı çalışmalısınız.\n   - Konu ile ilgili ders notlarını gözden geçirin\n   - Benzer sorular ile pratik yapın\n   - Zaman ayırarak çalışın\n\n`
      })

      mockFeedback += `🎯 GENEL TAVSIYELER:\n`
      mockFeedback += `• Zayıf olduğunuz konuları belirleyin ve extra pratik yapın\n`
      mockFeedback += `• Konuların temelini iyi anlamaya çalışın\n`
      mockFeedback += `• Düzenli ve planlı çalışış yapın\n`
      mockFeedback += `• Yanlış yaptığınız soruları tekrar çözyün\n\n`
      mockFeedback += `💪 Başarı oranınız: %${percentage} - Düzeltilmek için çok potansiyel var!`
    }

    return {
      score: score,
      totalQuestions: totalQuestions,
      feedback: mockFeedback,
      detailedAnalysis: await generateDetailedAnalysisFallback(wrongAnswers),
      wrongAnswers: wrongAnswers,
    }
  }

  // Gemini API çağrısı
  const prompt = `Bir öğrenci sınava giriş yaptı. Başarı Oranı: %${percentage} (${correctCount}/${totalQuestions})

${wrongAnswers.length === 0 ? 
  `Tüm soruları doğru cevapladı. Kısa bir tebrik mesajı yaz. Maksimum 2 satır.` :
  `Yanlış cevaplanan sorular için ŞU FORMAT'TA SADECE TAVSIYE YAZ (soru ve cevabı tekrar yazma):

Soru [NUMARA]: [2-3 cümle ile bu konuyu iyileştirmek için yapılabilir tavsiyeler]

${wrongAnswers.map((w) => `Soru ${w.questionNumber}: Konu: ${w.topic} | Doğru cevap: "${w.correctAnswer}" | Seçili: "${w.selectedAnswer}"`).join('\n')}

ÖNEMLİ:
- SADECE TAVSIYE YAZ, soru veya cevap metnini tekrar yazma
- Her tavsiye 2-3 cümle max
- Pratik ve yapılabilir öneriler ver
- ${wrongAnswers.map(w => w.questionNumber).join(', ')} numaralarının tavsiyelerini ver`
}`

  // Gemini API varsa dene, yoksa mock response döndür
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    const result = await model.generateContent(prompt)
    const aiFeedback = result.response.text()
    
    // Orijinal soru verileri + AI tavsiyesi
    let formattedFeedback = `📊 Başarı Oranı: %${percentage} (${correctCount}/${totalQuestions})\n\n`
    
    if (wrongAnswers.length === 0) {
      formattedFeedback += `🌟 ${aiFeedback}\n\n`
    } else {
      formattedFeedback += `📝 GÖZDEN GEÇİRİLMESİ GEREKEN KONULAR:\n\n`
      
      wrongAnswers.forEach((w) => {
        formattedFeedback += `📌 SORU ${w.questionNumber}\n`
        formattedFeedback += `🏷️ KONU: ${w.topic}\n`
        formattedFeedback += `━━━━━━━━━━━━━━━━━━━━━━━━\n`
        formattedFeedback += `❓ Soru: ${w.question}\n`
        formattedFeedback += `✅ Doğru Cevap: ${w.correctAnswer}\n\n`
      })
      
      formattedFeedback += `💡 AI GERİ BİLDİRİMİ:\n\n`
      formattedFeedback += aiFeedback
    }

    return {
      score: score,
      totalQuestions: totalQuestions,
      feedback: formattedFeedback,
      detailedAnalysis: await generateDetailedAnalysisWithGemini(wrongAnswers),
      wrongAnswers: wrongAnswers,
    }
  } catch (error) {
    console.error('Gemini API Error:', error.message)
    
    // Hata durumunda fallback cevap
    let fallbackFeedback = `📊 Başarı Oranı: %${percentage} (${correctCount}/${totalQuestions})\n\n`
    
    if (wrongAnswers.length === 0) {
      fallbackFeedback += `🌟 Mükemmel! Tüm soruları doğru yanıtladınız!\n\nŞaşırtıcı bir sonuç değil mi? Çalışmalarınız gerçekten olumlu sonuç vermiş. İyi iş çıkardınız! 👏`
    } else {
      fallbackFeedback += `📝 GÖZDEN GEÇİRİLMESİ GEREKEN KONULAR:\n\n`
      
      wrongAnswers.forEach((w) => {
        fallbackFeedback += `📌 SORU ${w.questionNumber}\n`
        fallbackFeedback += `🏷️ KONU: ${w.topic}\n`
        fallbackFeedback += `━━━━━━━━━━━━━━━━━━━━━━━━\n`
        fallbackFeedback += `❓ Soru: ${w.question}\n`
        fallbackFeedback += `✅ Doğru Cevap: ${w.correctAnswer}\n\n`
      })
      
      fallbackFeedback += `💡 AI GERİ BİLDİRİMİ:\n\n`
      fallbackFeedback += `🎯 TAVSIYE EDILEN ÇALIŞMA:\n`
      wrongAnswers.forEach((w) => {
        fallbackFeedback += `Soru ${w.questionNumber}: "${w.topic}" konusu hakkında daha fazla bilgi edinin, bu konuyla ilgili ek alıştırma problemleri çözün ve konu materyalini tekrar gözden geçirerek pekiştirin.\n\n`
      })
      fallbackFeedback += `🎯 GENEL TAVSIYELER:\n`
      fallbackFeedback += `🎯 GENEL TAVSIYELER:\n`
      fallbackFeedback += `• Yanlış cevaplanan konuları öncelikli olarak çalışın\n`
      fallbackFeedback += `• Her konunun temel kavramlarını iyi anlayın\n`
      fallbackFeedback += `• Başarınızı artırmak için düzenli pratik yapın\n`
      fallbackFeedback += `• Zor konular için ek kaynaklar kullanmaktan çekinmeyin\n\n`
      fallbackFeedback += `💪 Başarıya giden yol sabitlik ve sebat içerir. Çalışmaya devam edin!`
    }
    
    return {
      score: score,
      totalQuestions: totalQuestions,
      feedback: fallbackFeedback,
      detailedAnalysis: await generateDetailedAnalysisFallback(wrongAnswers),
      wrongAnswers: wrongAnswers,
    }
  }
}

// Gemini ile detaylı analiz
async function generateDetailedAnalysisWithGemini(wrongAnswers) {
  const analysis = []

  for (const question of wrongAnswers) {
    try {
      console.log(`🤖 Soru ${question.questionNumber} Gemini analizi yapılıyor...`)

      const questionPrompt = `Bir öğrenci şu soruyu yanlış cevapladı:

KONU: ${question.topic}
SORU: ${question.question}
DOĞRU CEVAP: ${question.correctAnswer}
ÖĞRENCİN SEÇTİĞİ: ${question.selectedAnswer}

Bu soruyla ilgili, öğrencinin bu konuyu daha iyi anlaması için kısa (2-3 cümle) ve pratik bir tavsiye ver. Tavsiye doğru cevabı da açıklayarak yapılmalı.`

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
      const result = await model.generateContent(questionPrompt)
      const aiAdvice = result.response.text() || 'Tavsiye oluşturulamadı.'

      analysis.push({
        questionNumber: question.questionNumber,
        question: question.question,
        topic: question.topic,
        correctAnswer: question.correctAnswer,
        userAnswer: question.selectedAnswer,
        aiAdvice: aiAdvice,
      })

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 800))
    } catch (error) {
      console.error(`Soru ${question.questionNumber} Gemini analiz hatası:`, error.message)
      analysis.push({
        questionNumber: question.questionNumber,
        question: question.question,
        topic: question.topic,
        correctAnswer: question.correctAnswer,
        userAnswer: question.selectedAnswer,
        aiAdvice: 'Analiz görüntülemeye devam et.',
      })
    }
  }

  return analysis
}

// Fallback detaylı analiz
async function generateDetailedAnalysisFallback(wrongAnswers) {
  const analysis = []

  for (const question of wrongAnswers) {
    try {
      analysis.push({
        questionNumber: question.questionNumber,
        question: question.question,
        topic: question.topic,
        correctAnswer: question.correctAnswer,
        userAnswer: question.selectedAnswer,
        aiAdvice: `Bu konuyu daha iyi anlamak için doğru cevap olan "${question.correctAnswer}" ile ilgili öğrenme materyallerini gözden geçirin.`,
      })
    } catch (error) {
      console.error(`Soru ${question.questionNumber} fallback hatası:`, error.message)
      analysis.push({
        questionNumber: question.questionNumber,
        question: question.question,
        topic: question.topic,
        correctAnswer: question.correctAnswer,
        userAnswer: question.selectedAnswer,
        aiAdvice: 'Analiz yüklenemedi.',
      })
    }
  }

  return analysis
}
