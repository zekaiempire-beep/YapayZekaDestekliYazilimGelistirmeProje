# Ollama Entegrasyonu Kurulum Rehberi

Bu rehberde sınav platformunuzu Ollama ile entegre etmek için gereken tüm adımları bulacaksınız.

## Ollama Nedir?

Ollama, yerel bilgisayarınızda çalışan açık kaynak bir LLM (Large Language Model) sunucusudur. Bağlantı gerektirmez ve tamamıyla offline çalışır. İşletim sisteminizden önce API anahtarı olmadan AI modellerini kullanabilirsiniz.

## 1. Ollama'yı İndir ve Yükle

### Windows

- [Ollama Windows İndir](https://ollama.com/download/windows)
- İndirilen dosyayı çalıştırarak yükleyin
- Yükleme tamamlanmadan sonra sistem yeniden başlatılacaktır

### macOS

- [Ollama macOS İndir](https://ollama.com/download/mac)
- İndirilen dosyayı **Uygulamalar** klasörüne sürükleyin

### Linux

```bash
curl https://ollama.ai/install.sh | sh
```

## 2. Ollama Servisini Başlat

Yükleme tamamlandıktan sonra Ollama otomatik olarak başlamalıdır. Kontrol etmek için:

```bash
# Ollama'nın çalışıp çalışmadığını kontrol et
curl http://localhost:11434/api/tags
```

Eğer yanıt alırsan, Ollama başarıyla çalışıyor demektir.

## 3. Bir Model İndir

Backend'den modelleri kullanabilmek için modeli Ollama'ya indirmeniz gerekir. Popüler modeller:

### Mistral (Önerilir - Hızlı ve Verimli)

```bash
ollama pull mistral
```

### Llama 2 (Daha Güçlü Ama Yavaş)

```bash
ollama pull llama2
```

### Neural Chat (Açık Alan Konuşması için İyi)

```bash
ollama pull neural-chat
```

Hangi modeli seçtiğinizi öğrenebilirsiniz:

```bash
ollama list
```

## 4. Backend'i Yapılandır

### .env Dosyasını Oluştur

Proje kök dizininde `.env` dosyası oluşturun (yoksa):

```bash
# backend/.env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

**Not:** Başka bir bilgisayarda sunucu çalıştırıyorsanız `OLLAMA_URL` değerini değiştirin.

### Paketleri Yükle

```bash
cd backend
npm install
```

## 5. API Test Et

### 1. Ollama Bağlantısını Kontrol Et

```bash
curl http://localhost:3000/api/exams/health/ollama
```

Başarılı yanıt örneği:

```json
{
  "connected": true,
  "models": ["mistral"],
  "url": "http://localhost:11434"
}
```

### 2. Sınav Sonuçları Gönder

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

**Parametreler:**

- `examId`: Sınavın kimliği (zorunlu)
- `answers`: Öğrencinin cevapları (zorunlu)
- `analyzer`: "ollama" veya "gemini" (varsayılan: "ollama")

## 6. Frontend'den Kullanan

Frontend'den sınav sonuçlarını göndermek için `analyzer` parametresini dahil edin:

```javascript
// JavaScript örneği
const submitExam = async (examId, answers) => {
  const response = await fetch("/api/exams/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId,
      answers,
      analyzer: "ollama", // Ollama'yı kullan
    }),
  });

  return response.json();
};
```

## Sorun Giderme

### "Ollama sunucusu yanıt vermedi" hatası

1. Ollama'nın çalışıp çalışmadığını kontrol et: `ollama serve`
2. `OLLAMA_URL` doğru mu kontrol et
3. Firewall ayarlarını kontrol et

### Model yüklenmedi hatası

Model indirmek için:

```bash
ollama pull mistral
```

### Memory/Ram sorunları

Daha küçük bir model deneyin:

```bash
ollama pull tinyllama
```

## Model Önerileri

| Model       | Hız        | Kalite     | RAM  | Tavsiye           |
| ----------- | ---------- | ---------- | ---- | ----------------- |
| tinyllama   | ⭐⭐⭐⭐⭐ | ⭐         | 2GB  | Test Amaçlı       |
| mistral     | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | 7GB  | En İyi (Önerilir) |
| neural-chat | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | 13GB | Yüksek Kalite     |
| llama2      | ⭐⭐⭐     | ⭐⭐⭐⭐   | 7GB  | Genel Amaçlı      |

## Sonraki Adımlar

1. ✅ Backend'i başlat: `npm run dev`
2. ✅ Frontend'i başlat
3. ✅ Sınav platform'unda test et
4. ✅ API yanıtlarını kontrol et

## Kaynaklar

- [Ollama Resmi Sayfa](https://ollama.ai)
- [Ollama Model Kütüphanesi](https://ollama.ai/library)
- [API Belgeleri](https://github.com/ollama/ollama/blob/main/docs/api.md)
