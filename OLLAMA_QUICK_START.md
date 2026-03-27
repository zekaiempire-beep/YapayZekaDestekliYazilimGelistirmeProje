# Ollama Entegrasyonu - Hızlı Başlangıç

## ✅ Yapılan Değişiklikler

### 1. **Ollama Analyzer Modülü** (`backend/utils/ollamaAnalyzer.js`)
- ✅ Ollama API ile iletişim kuran `analyzeExamAnswersWithOllama()` fonksiyonu
- ✅ Sınav cevaplarını analiz edip detaylı geri bildirim oluşturuyor
- ✅ Ollama bağlantısını kontrol eden `checkOllamaConnection()` fonksiyonu
- ✅ API hatasında fallback (yedek) yanıt sağlıyor

### 2. **API Routes** (`backend/routes/exams.js`)
- ✅ `/api/exams/submit` - `analyzer` parametresi eklendi
  - `analyzer: "ollama"` (varsayılan) 
  - `analyzer: "gemini"` (alternatif)
- ✅ `/api/exams/health/ollama` - Ollama durum kontrolü endpoint'i

### 3. **Konfigürasyon** (`backend/.env.example`)
- ✅ `OLLAMA_URL=http://localhost:11434`
- ✅ `OLLAMA_MODEL=mistral`

### 4. **Dokümantasyon**
- ✅ `OLLAMA_SETUP.md` - Kurulum rehberi
- ✅ `API_DOCS.md` - API belgeleri

## 🚀 Kurulum Adımları

### Adım 1: Ollama İndir ve Yükle
```bash
# Windows/Mac/Linux için indir:
# https://ollama.com/download
```

### Adım 2: Model İndir
```bash
ollama pull mistral
```

### Adım 3: Backend'i Konfigüre Et
```bash
cd backend
# .env dosyasını düzenle (varsa) veya .env.example'den kopyala
cp .env.example .env
```

### Adım 4: Backend'i Başlat
```bash
npm run dev
```

### Adım 5: Ollama Bağlantısını Test Et
```bash
curl http://localhost:3000/api/exams/health/ollama
```

## 📝 API Kullanımı

### Sınav Sonuçları Gönder (Ollama ile)
```bash
curl -X POST http://localhost:3000/api/exams/submit \
  -H "Content-Type: application/json" \
  -d '{
    "examId": "exam-1",
    "answers": [
      {"questionId": 1, "selectedAnswer": 0},
      {"questionId": 2, "selectedAnswer": 1}
    ],
    "analyzer": "ollama"
  }'
```

### Gemini Kullan (İsteğe bağlı)
```bash
curl -X POST http://localhost:3000/api/exams/submit \
  -H "Content-Type: application/json" \
  -d '{
    "examId": "exam-1",
    "answers": [...],
    "analyzer": "gemini"
  }'
```

## 🔧 Frontend Entegrasyonu

### React Örneği
```javascript
const handleExamSubmit = async (examId, answers) => {
  const response = await fetch('/api/exams/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      examId,
      answers,
      analyzer: 'ollama' // Ollama'yı kullan
    })
  });

  if (!response.ok) {
    throw new Error('Sınav gönderilemedi');
  }

  const result = await response.json();
  console.log('Başarı:', result.score, '/', result.totalQuestions);
  console.log('Geri Bildirim:', result.feedback);
};
```

## 📊 Yanıt Formatı

```json
{
  "id": "result-123",
  "score": 8,
  "totalQuestions": 10,
  "feedback": "📊 Başarı Oranı: %80 (8/10)\n\n📝 GÖZDEN GEÇİRİLMESİ GEREKEN KONULAR:\n...",
  "model": "Ollama (mistral)"
}
```

## ⚠️ Sorun Giderme

### "Ollama sunucusu yanıt vermedi"
```bash
# Terminal'de Ollama'yı çalıştır
ollama serve
```

### "Model yüklenmedi"
```bash
# Model indir
ollama pull mistral
ollama list  # Yüklü modelleri kontrol et
```

## 🎯 Sonraki Adımlar

1. ✅ Ollama'yı indir ve başlat
2. ✅ Model indir (`ollama pull mistral`)
3. ✅ Backend'i başlat (`npm run dev`)
4. ✅ Sınav sistemi üzerinde test et
5. ✅ Frontend'i update et (opsiyonel)

## 📚 Detaylı Rehberler

- **Kurulum**: [OLLAMA_SETUP.md](OLLAMA_SETUP.md)
- **API Belgeleri**: [API_DOCS.md](API_DOCS.md)

## 💡 İpuçları

- Mistral model en iyi denge sağlıyor (hız + kalite)
- İlk çalıştırmada model indirilecek (biraz zaman alabilir)
- Ollama çalışmazsa otomatik olarak fallback yanıt verilir
- Gemini API key'i varsa `analyzer: "gemini"` ile kullanabilirsin

---

**Artık siteyi Ollama ile AI değerlendirmesi yapıyor! 🎉**
