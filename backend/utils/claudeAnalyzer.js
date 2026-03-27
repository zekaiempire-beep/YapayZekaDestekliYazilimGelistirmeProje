import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

  // Claude API'ye yanlış cevapları analiz ettir
  const prompt = `Bir öğrenci sınava giriş yaptı. Toplam ${questions.length} sorudan ${correctCount} tanesini doğru cevapladı.

Yanlış cevaplanan sorular:
${wrongAnswers.map((w, i) => `
${i + 1}. SORU: "${w.question}"
   Seçenekler: ${w.options.map((o, idx) => `${idx + 1}) ${o}`).join(', ')}
   Öğrenci seçti: "${w.selectedAnswer}"
   Doğru cevap: "${w.correctAnswer}"
`).join('\n')}

Lütfen:
1. Her yanlış cevap için kısa bir açıklama yap
2. Öğrencinin hangi konularda zayıf olduğunu identify et
3. İyileştirme için somut öneriler sun
4. Öğrenciyi teşvik et ve olumlu bir ton kullan

Türkçe veya İngilizce yazabilirsin, öğrencinin seviyesine uyarla.`

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const feedback =
      message.content[0].type === 'text' ? message.content[0].text : ''

    return {
      score: correctCount,
      totalQuestions: questions.length,
      feedback: feedback,
      wrongAnswers: wrongAnswers,
    }
  } catch (error) {
    console.error('Claude API Error:', error)
    throw error
  }
}
