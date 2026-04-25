# 🎓 AI Destekli Sınav Platformu

Yapay Zeka (Ollama API) tarafından desteklenen, çoktan seçmeli sınav soruları için geri bildirim veren web platformu.

## 🚀 Özellikler

- **Admin Paneli**: Soru ekleme, düzenleme ve silme
- **Aday Paneli**: Çoktan seçmeli sınavı çözme
- **AI Geri Bildirimi**: Ollama API kullanarak otomatik analiz ve kişiselleştirilmiş feedback
- **Sonuç Raporlama**: Başarı oranı ve detaylı AI tarafından yapılan analiz

## 📋 Proje Yapısı

```
sinav-platformu/
├── frontend/          # Next.js React uygulaması
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Ana sayfa (giriş)
│   │   │   ├── admin/page.tsx    # Admin paneli
│   │   │   ├── exam/page.tsx     # Sınav sayfası
│   │   │   └── globals.css       # Global stiller
│   │   ├── components/            # React bileşenleri
│   │   └── lib/                   # Yardımcı fonksiyonlar
│   └── package.json
│
└── backend/           # Express.js REST API
    ├── routes/
    │   ├── questions.js   # Soru yönetimi endpoints
    │   └── exams.js       # Sınav sonuç endpoints
    ├── utils/
    │   ├── storage.js     # JSON dosya depolaması
    │   └── OllamaAnalyzer.js  # Ollama AI entegrasyonu
    ├── data/              # JSON veri dosyaları
    └── server.js          # Express sunucusu
```

## 🛠️ Kurulum

### Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükle
npm install

# Sunucuyu başlat
npm run dev
# Server http://localhost:5000 adresinde çalışmaya başlar
```

### Frontend Kurulumu

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Development sunucusunu başlat
npm run dev
# Uygulama http://localhost:3000 adresinde açılır
```

## 📚 Kullanım
a
### Admin Paneli (http://localhost:3000)

1. Ana sayfadan "Admin Girişi" butonuna tıkla
2. Admin Paneline Git' butonuna tıkla
3. Soru Ekle ve Düzenle formunu kullan:
   - Soru metni yazın
   - 4 seçenek girin
   - Doğru cevabı seçin (radio button)
   - "Ekle" butonuna tıklayın

### Aday Paneli (http://localhost:3000)

1. Ana sayfadan "Aday Girişi" butonuna tıkla
2. "Sınava Başla" butonuna tıkla
3. Soruları cevaplayın:
   - Her sorunun 4 seçeneğinden birini seçin
   - Önceki/Sonraki butonlarıyla sorular arasında gezin
   - Tüm soruları cevaplayın
4. "Sınavı Gönder" butonuna tıklayın

### Sonuçlar

- Başarı oranı (Puan / Toplam Soru)
- Ollama AI tarafından yapılan detaylı geri bildirim
- Yanlış cevapların analiz ve iyileştirme önerileri

## 🔌 API Endpoints

### Sorular

```
GET    /api/questions              # Tüm soruları getir
POST   /api/questions              # Yeni soru ekle
PUT    /api/questions/:id          # Soruyu güncelle
DELETE /api/questions/:id          # Soruyu sil
```

**POST/PUT Body:**

```json
{
  "text": "Soru metni",
  "options": ["Seçenek 1", "Seçenek 2", "Seçenek 3", "Seçenek 4"],
  "correctAnswer": 0
}
```

### Sınavlar

```
POST   /api/exams/submit           # Sınav sonuçlarını gönder
GET    /api/exams/history          # Geçmiş sonuçları getir
```

**POST /api/exams/submit Body:**

```json
{
  "answers": [
    {
      "questionId": "uuid",
      "selectedAnswer": 0
    }
  ]
}
```

## 🤖 Ollama AI Entegrasyonu

Backend `/api/exams/submit` endpoint'ine sınav cevapları gönderildiğinde:

1. Yanlış cevaplar tespit edilir
2. Ollama API'ye yanlış cevaplar gönderilir
3. AI kapsamlı bir analiz yaparak:
   - Her hata için açıklama sunar
   - Zayıf konuları tanımlar
   - İyileştirme önerileri verir
   - Olumlu ve teşvik edici bir ton kullanır

## 🔐 Güvenlik Notları

- Bu örnek **demostrasyon** amaçlı olup, üretim ortamı için şu improvements gereklidir:
  - Kullanıcı kaydı ve kimlik doğrulama
  - JWT token tabanlı yetkilendirme
  - Gerçek bir veritabanı (PostgreSQL, MongoDB)
  - API rate limiting
  - HTTPS/SSL
  - CORS politikası kısıtlaması

## 📦 Bağımlılıklar

### Backend

- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variables
- `uuid` - Unique identifier generation
- `Ollama` - Ollama API client

### Frontend

- `next` - React framework
- `react` - UI library
- `tailwindcss` - CSS framework
- `axios` - HTTP client





