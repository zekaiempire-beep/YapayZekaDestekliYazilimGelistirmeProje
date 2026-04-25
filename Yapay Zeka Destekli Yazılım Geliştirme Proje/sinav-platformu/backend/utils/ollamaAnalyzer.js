// Ollama entegrasyonu - Yerel LLM ile sınav değerlendirmesi
import { searchWeb } from './webSearch.js'

export const analyzeExamAnswersWithOllama = async (questions, answers, model = 'mistral') => {
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
        questionNumber: index + 1,
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

  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
    const ollamaModel = process.env.OLLAMA_MODEL || model

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
      timeout: 120000,
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

    // Her soru için detaylı analiz yap (sadece Ollama, web search yok)
    console.log(`📚 Her soru için detaylı analiz yapılıyor...`)
    const detailedAnalysis = await generateDetailedAnalysisWithOllama(wrongAnswers, ollamaUrl, ollamaModel)

    return {
      score: score,
      totalQuestions: totalQuestions,
      feedback: await formatFeedback(feedback, percentage, correctCount, totalQuestions, wrongAnswers),
      detailedAnalysis: detailedAnalysis,
      wrongAnswers: wrongAnswers,
      model: `Ollama (${ollamaModel})`,
    }
  } catch (error) {
    console.error('❌ Ollama API Hatası:', error.message)
    
    const detailedAnalysis = await generateDetailedAnalysisFallback(wrongAnswers)

    return {
      score: score,
      totalQuestions: totalQuestions,
      feedback: generateFallbackFeedback(percentage, correctCount, totalQuestions, wrongAnswers, questions),
      detailedAnalysis: detailedAnalysis,
      wrongAnswers: wrongAnswers,
      model: 'Fallback (Yerel)',
    }
  }
}

// Her soru için detaylı analiz yap (sadece Ollama, web search yok)
async function generateDetailedAnalysisWithOllama(wrongAnswers, ollamaUrl, ollamaModel) {
  const analysis = []

  for (const question of wrongAnswers) {
    try {
      console.log(`🤖 Soru ${question.questionNumber} analizi yapılıyor...`)

      const questionPrompt = `Bir öğrenci şu soruyu yanlış cevapladı:

KONU: ${question.topic}
SORU: ${question.question}
DOĞRU CEVAP: ${question.correctAnswer}
ÖĞRENCİN SEÇTİĞİ: ${question.selectedAnswer}

Bu soruyla ilgili, öğrencinin bu konuyu daha iyi anlaması için kısa (2-3 cümle) ve pratik bir tavsiye ver. Tavsiye doğru cevabı da açıklayarak yapıl malı.`

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: questionPrompt,
          stream: false,
          temperature: 0.6,
        }),
        timeout: 60000,
      })

      let aiAdvice = ''
      if (response.ok) {
        const data = await response.json()
        aiAdvice = data.response || ''
      }

      analysis.push({
        questionNumber: question.questionNumber,
        question: question.question,
        topic: question.topic,
        correctAnswer: question.correctAnswer,
        userAnswer: question.selectedAnswer,
        aiAdvice: aiAdvice || 'Tavsiye oluşturulamadı.',
      })

      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Soru ${question.questionNumber} analiz hatası:`, error.message)
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

function generatePrompt(percentage, correctCount, totalQuestions, wrongAnswers, questions) {
  if (wrongAnswers.length === 0) {
    return `Bir öğrenci sınavda tüm soruları (%100) doğru cevapladı. Çok kısa bir tebrik mesajı yaz (2 satır max). Türkçe olsun.`
  }

  const wrongDescription = wrongAnswers
    .map((w) => {
      return `Soru ${w.questionNumber}: Konu: ${w.topic} | Doğru cevap: "${w.correctAnswer}" | Öğrenci seçti: "${w.selectedAnswer}"`
    })
    .join('\n')

  return `Bir öğrenci sınavda %${percentage} başarı elde etti (${correctCount}/${totalQuestions} doğru).

Yanlış cevaplanan soruların detayları:
${wrongDescription}

HER SORU İÇİN SADECE ŞU FORMAT'TA TAVSIYE CÜMLESI YAZ (daha fazla bilgi ekleme):

Soru [NUMARA]: [2-3 cümle ile bu konuyu iyileştirmek için ne yapması gerektiğini kısa ve pratik tavsiyeler]

ÖNEMLİ:
- SADECE TAVSIYE yazacaksın, soru veya cevabı tekrar yazma
- Soru numarasını doğru yaz: ${wrongAnswers.map(w => w.questionNumber).join(', ')}
- Her tavsiye 2-3 cümle max olsun
- Pratik ve yapılabilir tavsiyeler ver
- Sonunda (tüm sorulardan sonra) kısa 1-2 cümle genel tavsiye ekle`
}

async function formatFeedback(feedback, percentage, correctCount, totalQuestions, wrongAnswers) {
  let formatted = `📊 Başarı Oranı: %${percentage} (${correctCount}/${totalQuestions})\n\n`

  if (wrongAnswers.length === 0) {
    formatted += `🌟 ${feedback}\n\n`
  } else {
    formatted += `📝 GÖZDEN GEÇİRİLMESİ GEREKEN KONULAR:\n\n`
    
    // Orijinal soru verileri
    wrongAnswers.forEach((w) => {
      formatted += `📌 SORU ${w.questionNumber}\n`
      formatted += `🏷️ KONU: ${w.topic}\n`
      formatted += `━━━━━━━━━━━━━━━━━━━━━━━━\n`
      formatted += `❓ Soru: ${w.question}\n`
      formatted += `✅ Doğru Cevap: ${w.correctAnswer}\n\n`
    })
    
    formatted += `💡 AI GERİ BİLDİRİMİ:\n\n`
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
      feedback += `✅ Doğru Cevap: ${w.correctAnswer}\n\n`
    })

    feedback += `💡 AI GERİ BİLDİRİMİ:\n\n`
    feedback += `🎯 TAVSIYE EDILEN ÇALIŞMA:\n`
    wrongAnswers.forEach((w) => {
      feedback += `\nSoru ${w.questionNumber}: Bu konuyu daha derinlemesine öğrenmek için ders notlarınızı gözden geçirin ve benzer sorular çözün.\n`
    })

    feedback += `\n🎯 GENEL TAVSİYELER:\n`
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
