// Ollama entegrasyonu - Yerel LLM ile sınav değerlendirmesi
import { enrichAnswerWithWebSearch } from './webSearch.js'

export const analyzeExamAnswersWithOllama = async (questions, answers, model = 'mistral') => {
  // Doğru cevapları belirle ve yanlışları tespit et
  const wrongAnswers = []
  let correctCount = 0

  answers.forEach((answer, index) => {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) return

    if (question.correctAnswer === answer.selectedAnswer) {
      correctCount++
    } else {
      wrongAnswers.push({
        questionId: question.id,
        questionNumber: index + 1,  // Sınavda kaçıncı soru
        question: question.text,
        selectedAnswer: question.options[answer.selectedAnswer],
        correctAnswer: question.options[question.correctAnswer],
        topic: question.topic || 'Bilinmiyor',
        options: question.options,
      })
    }
  })

  const score = correctCount
  const totalQuestions = questions.length
  const percentage = Math.round((correctCount / questions.length) * 100)

  try {
    // Ollama endpoint'i kontrol et (varsayılan: http://localhost:11434)
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
    const ollamaModel = process.env.OLLAMA_MODEL || model

    // Ollama API'ye istek gönder
    const prompt = generatePrompt(percentage, correctCount, totalQuestions, wrongAnswers, questions)

    console.log(`🤖 Ollama çağrılıyor: ${ollamaUrl}/api/generate (Model: ${ollamaModel})`)

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
      }),
      timeout: 120000, // 2 dakika timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ollama API hatası (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    const feedback = data.response || data.text || ''

    if (!feedback) {
      throw new Error('Ollama yanıt verdi ama içeri boş')
    }

    console.log(`✅ Ollama başarılı yanıt verdi`)

    return {
      score: score,
      totalQuestions: totalQuestions,
      feedback: await formatFeedback(feedback, percentage, correctCount, totalQuestions, wrongAnswers),
      wrongAnswers: wrongAnswers,
      model: `Ollama (${ollamaModel})`,
    }
  } catch (error) {
    console.error('❌ Ollama API Hatası:', error.message)
    
    // Hata durumunda fallback cevap
    return {
      score: score,
      totalQuestions: totalQuestions,
      feedback: generateFallbackFeedback(percentage, correctCount, totalQuestions, wrongAnswers, questions),
      wrongAnswers: wrongAnswers,
      model: 'Fallback (Yerel)',
    }
  }
}

function generatePrompt(percentage, correctCount, totalQuestions, wrongAnswers, questions) {
  if (wrongAnswers.length === 0) {
    return `Bir öğrenci sınavda tüm soruları (%100) doğru cevapladı. Çok kısa bir tebrik mesajı yaz (2 satır max). Türkçe olsun.`
  }

  const wrongDescription = wrongAnswers
    .map((w) => {
      return `Soru ${w.questionNumber}: "${w.question}"\n   Konusu: ${w.topic}\n   Doğru cevap: "${w.correctAnswer}"\n   Öğrenci seçti: "${w.selectedAnswer}"`
    })
    .join('\n\n')

  return `Bir öğrenci sınavda %${percentage} başarı elde etti (${correctCount}/${totalQuestions} doğru).
Zephyr model olarak, detaylı ve kullanışlı geri bildirim ver.

Yanlış cevaplanan ${wrongAnswers.length} soru:
${wrongDescription}

Her yanlış soru için ŞU FORMAT'ı TAMAMEN AYNI ŞEKİLDE kullan (soru numarasını kesinlikle doğru yaz):

📌 SORU [NUMARA]
🏷️ KONU: [konunun adı - AI tarafından belirle]
━━━━━━━━━━━━━━━━━━━━━━━━
❓ Soru: [sorunun tam metni]
✅ Doğru Cevap: [doğru cevap - açıklamalı]
💡 Tavsiye Edilen Çalışma: [ne yapması gerektiğini kısa 2-3 cümle, pratik örnekler ver]

ÖNEMLİ KURALLAR:
- Her soru için yukarıdaki FORMAT'ı AYNEN kullan
- SORU numarasını kesinlikle [NUMARA] yerine gerçek numarayı (${wrongAnswers.map(w => w.questionNumber).join(', ')}) yaz
- Konu adını AI olarak sen belirle
- Doğru cevabı açık, detaylı ve anlaşılır yaz
- Tavsiye kısa, öz, pratik ve adım adım olsun
- Türkçe ve anlaşılır olsun
- Her hata için neden yapıldığını kısaca açıkla
- Sonunda kısa bir genel tavsiye ekle (2-3 satır)`
}

async function formatFeedback(feedback, percentage, correctCount, totalQuestions, wrongAnswers) {
  let formatted = `📊 Başarı Oranı: %${percentage} (${correctCount}/${totalQuestions})\n\n`

  if (wrongAnswers.length === 0) {
    formatted += `🌟 ${feedback}\n\n`
  } else {
    formatted += `📝 GÖZDEN GEÇİRİLMESİ GEREKEN KONULAR:\n\n`
    formatted += feedback

    // Web search enable'sa, extra kaynaklar ekle
    if (process.env.ENABLE_WEB_SEARCH === 'true') {
      formatted += `\n\n📚 KAYNAKLAR:\n`
      formatted += `Web araması yapılmıştır. Detaylı kaynaklar sonuç ayrıntısında yer almaktadır.`
    }
  }

  return formatted
}

function generateFallbackFeedback(percentage, correctCount, totalQuestions, wrongAnswers, questions) {
  let feedback = `📊 Başarı Oranı: %${percentage} (${correctCount}/${totalQuestions})\n\n`

  if (wrongAnswers.length === 0) {
    feedback += `🌟 MÜKEMMEL SONUÇ!\n`
    feedback += `Tüm soruları doğru cevapladığınız için tebrikler! 🎉\n`
    feedback += `Bu konuda oldukça iyi bir anlayış sergilemişsiniz.\n\n`
  } else {
    feedback += `📝 GÖZDEN GEÇİRİLMESİ GEREKEN KONULAR:\n\n`

    wrongAnswers.forEach((w) => {
      feedback += `📌 SORU ${w.questionNumber}\n`
      feedback += `🏷️ KONU: ${w.topic}\n`
      feedback += `━━━━━━━━━━━━━━━━━━━━━━━━\n`
      feedback += `❓ Soru: ${w.question}\n`
      feedback += `✅ Doğru Cevap: ${w.correctAnswer}\n`
      feedback += `💡 Tavsiye Edilen Çalışma: Bu konuyu daha derinlemesine öğrenmek için ders notlarınızı gözden geçirin ve benzer sorular çözün.\n`
      feedback += `\n`
    })

    feedback += `🎯 GENEL TAVSİYELER:\n`
    feedback += `• Zayıf olduğunuz konuları belirleyin ve ek materyallerle çalışın\n`
    feedback += `• Her soruyu çözdükten sonra neden yanlış yaptığınızı analiz edin\n`
    feedback += `• Düzenli ve planlı bir şekilde çalışış yapın\n\n`
    feedback += `💪 Başarı oranınız: %${percentage} - Biraz daha çalışma ile daha iyiye gidebilirsiniz!`
  }

  return feedback
}

// Ollama'nın çalışıp çalışmadığını kontrol et
export const checkOllamaConnection = async () => {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
    })

    if (response.ok) {
      const data = await response.json()
      return {
        connected: true,
        models: data.models?.map(m => m.name) || [],
        url: ollamaUrl,
      }
    }
    return { connected: false, error: 'Ollama sunucusu yanıt vermedi' }
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      hint: `Ollama'nın çalışıyor mu? Kontrol edin: ${process.env.OLLAMA_URL || 'http://localhost:11434'}`,
    }
  }
}
