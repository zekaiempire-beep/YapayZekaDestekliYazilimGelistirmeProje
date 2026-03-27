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

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) return

    if (question.correctAnswer === answer.selectedAnswer) {
      correctCount++
    } else {
      wrongAnswers.push({
        question: question.text,
        selectedAnswer: question.options[answer.selectedAnswer],
        correctAnswer: question.options[question.correctAnswer],
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
        const topic = questions.find(q => q.text === w.question)?.topic || 'Bilinmiyor'
        mockFeedback += `${i + 1}. 📌 KONU: ${topic}\n`
        mockFeedback += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        mockFeedback += `❓ Soru: "${w.question}"\n`
        mockFeedback += `❌ Seçtiğiniz: "${w.selectedAnswer}"\n`
        mockFeedback += `✅ Doğru cevap: "${w.correctAnswer}"\n`
        mockFeedback += `💡 Açıklama: Bu konu hakkında daha detaylı çalışmalısınız.\n`
        mockFeedback += `   - Konu ile ilgili ders notlarını gözden geçirin\n`
        mockFeedback += `   - Benzer sorular ile pratik yapın\n`
        mockFeedback += `   - Zaman ayırarak çalışın\n`
        mockFeedback += `\n`
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
      wrongAnswers: wrongAnswers,
    }
  }

  // Gemini API çağrısı
  const prompt = `Bir öğrenci sınava giriş yaptı. Başarı Oranı: %${percentage} (${correctCount}/${totalQuestions})

${wrongAnswers.length === 0 ? 
  `Tüm soruları doğru cevapladı. Kısa bir tebrik mesajı yaz. Maksimum 2 satır.` :
  `Yanlış cevaplanan ${wrongAnswers.length} soru var. Her soru için ŞU FORMAT'ı kullan:

KONU ADI: [sorının konu adını belirle]
HATA SEBEBI: [neden yanlış cevaplandığını 1-2 cümle ile açıkla]
TAVSIYE: [bu konuyu iyileştirmek için ne yapması gerektiğini 1-2 cümle ile say]

Yanlış cevaplar:
${wrongAnswers.map((w, i) => `${i + 1}. SORU: "${w.question}" - Doğru cevap: "${w.correctAnswer}" - Seçili: "${w.selectedAnswer}"`).join('\n')}`
}

ÖNEMLI: 
- Çok kısa ve öz cevap ver
- Her madde için maksimum 2 satır
- Detaylı açıklama yapma
- Sadece yanlış yapılan sorulara odaklan`

  // Gemini API varsa dene, yoksa mock response döndür
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    const result = await model.generateContent(prompt)
    const feedback = result.response.text()

    return {
      score: score,
      totalQuestions: totalQuestions,
      feedback: feedback,
      wrongAnswers: wrongAnswers,
    }
  } catch (error) {
    console.error('Gemini API Error:', error.message)
    
    // Hata durumunda fallback cevap
    let fallbackFeedback = `📊 Başarı Oranı: %${percentage} (${correctCount}/${totalQuestions})\n\n`
    
    if (wrongAnswers.length === 0) {
      fallbackFeedback += `🌟 Mükemmel! Tüm soruları doğru yanıtladınız!\n\nŞaşırtıcı bir sonuç değil mi? Çalışmalarınız gerçekten olumlu sonuç vermiş. İyi iş çıkardınız! 👏`
    } else {
      fallbackFeedback += `📝 Gözden Geçirilmesi Gereken Konular:\n\n`
      wrongAnswers.forEach((w, i) => {
        const question = questions.find(q => q.text === w.question)
        const topic = question?.topic || 'Konu'
        fallbackFeedback += `${i + 1}. 📌 Konu: ${topic}\n`
        fallbackFeedback += `━━━━━━━━━━━━━━━━━━━━━━━━\n`
        fallbackFeedback += `Soru: "${w.question}"\n`
        fallbackFeedback += `❌ Seçtiğiniz: "${w.selectedAnswer}"\n`
        fallbackFeedback += `✓ Doğru Cevap: "${w.correctAnswer}"\n\n`
        fallbackFeedback += `💡 Tavsiye:\n`
        fallbackFeedback += `• "${topic}" konusu hakkında daha fazla bilgi edinin\n`
        fallbackFeedback += `• Bu konuyla ilgili ek alıştırma problemleri çözün\n`
        fallbackFeedback += `• Konu materyalini tekrar gözden geçirerek pekiştirin\n\n`
      })
      fallbackFeedback += `🎯 Genel Öneriler:\n`
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
      wrongAnswers: wrongAnswers,
    }
  }
}
