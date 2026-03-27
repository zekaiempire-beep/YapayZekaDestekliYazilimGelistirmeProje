// Ollama entegrasyonu - Yerel LLM ile sınav değerlendirmesi

export const analyzeExamAnswersWithOllama = async (questions, answers, model = 'mistral') => {
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
    })

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.statusCode}`)
    }

    const data = await response.json()
    const feedback = data.response || data.text || ''

    return {
      score: score,
      totalQuestions: totalQuestions,
      feedback: formatFeedback(feedback, percentage, correctCount, totalQuestions, wrongAnswers),
      wrongAnswers: wrongAnswers,
      model: `Ollama (${ollamaModel})`,
    }
  } catch (error) {
    console.error('Ollama API Error:', error.message)
    
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
    return `Bir öğrenci sınavda tüm soruları (%100) doğru cevapladı. Kısa bir tebrik mesajı yaz. İki satırdan fazla olmasın. Türkçe olsun.`
  }

  const wrongDescription = wrongAnswers
    .map((w, i) => {
      return `${i + 1}. Soru: "${w.question}"\n   Konusu: ${w.topic}\n   Doğru cevap: "${w.correctAnswer}"\n   Öğrenci seçti: "${w.selectedAnswer}"`
    })
    .join('\n\n')

  return `Bir öğrenci sınavda %${percentage} başarı elde etti (${correctCount}/${totalQuestions} doğru).

Yanlış cevaplanan ${wrongAnswers.length} soru:
${wrongDescription}

Her yanlış soru için ŞU FORMAT'ı TAMAMEN AYNI ŞEKİLDE kullan:

📌 KONU: [konunun adı]
━━━━━━━━━━━━━━━━━━━━━━━━
❌ Hata: [neden yanlış yapıldığını tekil cümle]. 
✓ Doğru: [doğru cevap açıklaması].
💡 Çalışma: [ne yapması gerektiğini tekil cümle].

ÖNEMLİ KURALLAR:
- Çok kısa ve öz cevap ver, maksimum 2-3 satır per soru
- Her hata için yukarıdaki FORMAT'ı kesinlikle kullan
- Türkçe ve anlaşılır olsun
- Öğrenciyi cesaretlendir
- Sonunda kısa bir genel tavsiye ekle`
}

function formatFeedback(feedback, percentage, correctCount, totalQuestions, wrongAnswers) {
  let formatted = `📊 Başarı Oranı: %${percentage} (${correctCount}/${totalQuestions})\n\n`

  if (wrongAnswers.length === 0) {
    formatted += `🌟 ${feedback}\n\n`
  } else {
    formatted += `📝 GÖZDEN GEÇİRİLMESİ GEREKEN KONULAR:\n\n`
    formatted += feedback
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

    wrongAnswers.forEach((w, i) => {
      feedback += `${i + 1}. 📌 KONU: ${w.topic}\n`
      feedback += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      feedback += `❓ Soru: "${w.question}"\n`
      feedback += `❌ Seçtiğiniz: "${w.selectedAnswer}"\n`
      feedback += `✅ Doğru cevap: "${w.correctAnswer}"\n`
      feedback += `💡 Çalışma: Bu konu hakkında daha detaylı çalışmalısınız.\n`
      feedback += `   - Konu ile ilgili ders notlarını gözden geçirin\n`
      feedback += `   - Benzer sorular ile pratik yapın\n`
      feedback += `   - Zaman ayırarak çalışın\n`
      feedback += `\n`
    })

    feedback += `🎯 GENEL TAVSIYELER:\n`
    feedback += `• Zayıf olduğunuz konuları belirleyin ve extra pratik yapın\n`
    feedback += `• Konuların temelini iyi anlamaya çalışın\n`
    feedback += `• Düzenli ve planlı çalışış yapın\n`
    feedback += `• Yanlış yaptığınız soruları tekrar çözyün\n\n`
    feedback += `💪 Başarı oranınız: %${percentage} - Düzeltilmek için çok potansiyel var!`
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
