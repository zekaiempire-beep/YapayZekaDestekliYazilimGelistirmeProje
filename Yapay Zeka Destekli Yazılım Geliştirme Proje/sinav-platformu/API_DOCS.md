# Sınav Platformu API Belgeleri

## Sınav Sonuçları Gönder

### Endpoint

```
POST /api/exams/submit
```

### İstek (Request)

```json
{
  "examId": "exam-123",
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": 0
    },
    {
      "questionId": 2,
      "selectedAnswer": 2
    }
  ],
  "analyzer": "ollama"
}
```

#### Parametreler

| Alan                       | Tür    | Zorunlu | Açıklama                                          |
| -------------------------- | ------ | ------- | ------------------------------------------------- |
| `examId`                   | string | ✅ Yes  | Sınavın kimliği                                   |
| `answers`                  | array  | ✅ Yes  | Öğrencinin cevapları                              |
| `answers[].questionId`     | number | ✅ Yes  | Sorunun kimliği                                   |
| `answers[].selectedAnswer` | number | ✅ Yes  | Seçilen cevap indeksi (0-3)                       |
| `analyzer`                 | string | ❌ No   | Analiz aracı: "ollama" (varsayılan) veya "gemini" |

### Başarılı Yanıt (200)

```json
{
  "id": "result-456",
  "score": 8,
  "totalQuestions": 10,
  "feedback": "📊 Başarı Oranı: %80 (8/10)\n\n📝 GÖZDEN GEÇİRİLMESİ GEREKEN KONULAR:\n\n1. 📌 KONU: Matematik\n..."
}
```

### Hata Yanıtları

#### 400 Bad Request

```json
{
  "error": "Geçersiz sınav verisi"
}
```

#### 404 Not Found

```json
{
  "error": "Bu sınav için soru bulunamadı"
}
```

#### 500 Server Error

```json
{
  "error": "Sınav işlenemedi. Lütfen daha sonra tekrar deneyin."
}
```

## Sınav Sonuçlarını Getir

### Endpoint

```
GET /api/exams/results/:examId
```

### Başarılı Yanıt

```json
[
  {
    "id": "result-456",
    "examId": "exam-123",
    "score": 8,
    "totalQuestions": 10,
    "feedback": "...",
    "timestamp": "2026-03-27T10:30:00Z",
    "answers": [
      {
        "questionId": 1,
        "selectedAnswer": 0,
        "question": {...}
      }
    ]
  }
]
```

## Ollama Bağlantısını Kontrol Et

### Endpoint

```
GET /api/exams/health/ollama
```

### Başarılı Yanıt

```json
{
  "connected": true,
  "models": ["mistral", "llama2"],
  "url": "http://localhost:11434"
}
```

### Başarısız Yanıt

```json
{
  "connected": false,
  "error": "connect ECONNREFUSED 127.0.0.1:11434",
  "hint": "Ollama'nın çalışıyor mu? Kontrol edin: http://localhost:11434"
}
```

## Frontend Örneği

### React/TypeScript

```typescript
interface SubmitExamRequest {
  examId: string;
  answers: Array<{
    questionId: number;
    selectedAnswer: number;
  }>;
  analyzer?: "ollama" | "gemini";
}

const submitExam = async (data: SubmitExamRequest) => {
  const response = await fetch("/api/exams/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      analyzer: data.analyzer || "ollama",
    }),
  });

  if (!response.ok) {
    throw new Error("Sınav gönderilemedi");
  }

  return response.json();
};

// Kullanım
const result = await submitExam({
  examId: "exam-123",
  answers: [
    { questionId: 1, selectedAnswer: 0 },
    { questionId: 2, selectedAnswer: 2 },
  ],
  analyzer: "ollama",
});
```

### JavaScript (Vanilla)

```javascript
async function submitExam(examId, answers, analyzer = "ollama") {
  const response = await fetch("/api/exams/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      examId,
      answers,
      analyzer,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Sınav gönderilemedi");
  }

  return response.json();
}

// Kullanım
try {
  const result = await submitExam(
    "exam-123",
    [
      { questionId: 1, selectedAnswer: 0 },
      { questionId: 2, selectedAnswer: 2 },
    ],
    "ollama",
  );

  console.log("Başarı Oranı:", result.score, "/", result.totalQuestions);
  console.log("Geri Bildirim:", result.feedback);
} catch (error) {
  console.error("Hata:", error.message);
}
```

## Analyzer Seçeneği

### Ollama (Varsayılan)

- ✅ Yerel çalışır, API anahtarı gerekli değil
- ✅ Tamamen offline
- ✅ Daha hızlı yanıt (genellikle)
- ❌ Sunucunun kurulu olması gerekir

### Gemini

- ✅ Cloud tabanlı, kurulum gerekmez
- ✅ Daha güçlü modeller
- ❌ API anahtarı gerekli
- ❌ İnternet bağlantısı gerekli

## Hata Yönetimi

Frontend'de hata yönetimi şu şekilde yapılmalıdır:

```javascript
async function handleExamSubmit(examId, answers) {
  try {
    // Ollama ile dene
    const result = await submitExam(examId, answers, "ollama");
    return result;
  } catch (error) {
    console.warn("Ollama hata:", error.message);

    // Ollama başarısız olursa Gemini'ye geç
    try {
      const result = await submitExam(examId, answers, "gemini");
      console.log("Gemini kullanıldı");
      return result;
    } catch (error) {
      console.error("Her iki analyzer da başarısız:", error.message);
      // Kullanıcıya hata mesajını göster
      throw error;
    }
  }
}
```

## Ollama Bağlantısını Kontrol Etme (Frontend)

```javascript
async function checkOllamaStatus() {
  try {
    const response = await fetch("/api/exams/health/ollama");
    const status = await response.json();

    if (status.connected) {
      console.log("✅ Ollama çalışıyor");
      console.log("Yüklü modeller:", status.models);
      return true;
    } else {
      console.log("❌ Ollama bağlanamadı:", status.error);
      return false;
    }
  } catch (error) {
    console.error("Ollama durumu kontrol edilemedi:", error);
    return false;
  }
}
```

---

**Not:** Tüm isteklerde JSON formatı kullanılır. CORS ayarları backend tarafından yapılandırılmıştır.
