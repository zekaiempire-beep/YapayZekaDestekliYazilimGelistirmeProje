#!/bin/bash

# Ollama Entegrasyonu Test Scripti

echo "🔍 Sınav Platformu - Ollama Entegrasyonu Test Ediliyor..."
echo ""

BASE_URL="http://localhost:3000"

# 1. Ollama Bağlantısını Test Et
echo "1️⃣  Ollama Bağlantısı Kontrol Ediliyor..."
echo "   Endpoint: GET /api/exams/health/ollama"
curl -s "$BASE_URL/api/exams/health/ollama" | jq . | head -20
echo ""
echo ""

# 2. Backend'in Çalışıp Çalışmadığını Kontrol Et
echo "2️⃣  Backend Bağlantısı Kontrol Ediliyor..."
if curl -s "$BASE_URL/api/exams/health/ollama" > /dev/null; then
    echo "   ✅ Backend çalışıyor"
else
    echo "   ❌ Backend'e bağlanılamıyor"
    echo "   Lütfen backend'i başlat: npm run dev"
    exit 1
fi
echo ""

# 3. Örnek Sınav Verisi
echo "3️⃣  Örnek Sınav Sonucu Gönderiliyor..."
echo "   Endpoint: POST /api/exams/submit"
echo ""

# Örnek istek
curl -s -X POST "$BASE_URL/api/exams/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "examId": "test-exam-1",
    "answers": [
      {"questionId": 1, "selectedAnswer": 0},
      {"questionId": 2, "selectedAnswer": 1},
      {"questionId": 3, "selectedAnswer": 2}
    ],
    "analyzer": "ollama"
  }' | jq .

echo ""
echo "4️⃣  Test Tamamlandı!"
echo ""
echo "✅ Başarılıysa:"
echo "   - Sınav sonuşları geri bildirimi göreceğiz"
echo "   - Başarı oranı ve analizler listelenecek"
echo ""
echo "❌ Hata aldıysan:"
echo "   1. Ollama'nın çalışıyor mu? (ollama serve)"
echo "   2. Model yüklendi mi? (ollama pull mistral)"
echo "   3. Backend çalışıyor mu? (npm run dev)"
echo "   4. .env dosyasında OLLAMA_URL ve OLLAMA_MODEL doğru mu?"
