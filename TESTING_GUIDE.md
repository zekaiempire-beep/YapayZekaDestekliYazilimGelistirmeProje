# 🧪 Thunder Client & DataGrip - API Testing ve Veritabanı Yönetimi

## ⚡ Thunder Client Kurulumu (VS Code)

### 1. Kurulum

1. VS Code'u aç
2. Extensions (Ctrl+Shift+X) 🔍
3. "Thunder Client" ara
4. Thunder Client (rangav tarafından) yükle
5. Sol sidebar'da ⚡ simgesini tıkla

### 2. Koleksiyon Oluştur

**New Collection** butonuna tıkla:

- Name: "Sınav Platformu API"
- Save seç

### 3. API Endpoints Ekle

#### **POST - Sınav Oluştur**

```
Method: POST
URL: http://localhost:5000/api/exams/management

Headers:
Content-Type: application/json

Body (Raw JSON):
{
  "title": "Matematik Sınavı",
  "description": "Cebir Konuları"
}
```

#### **GET - Tüm Sınavları Getir**

```
Method: GET
URL: http://localhost:5000/api/exams/management
```

#### **POST - Soru Ekle**

```
Method: POST
URL: http://localhost:5000/api/questions

Headers:
Content-Type: application/json

Body (Raw JSON):
{
  "examId": "BURAYA_SINAV_ID_KOY",
  "text": "2 + 2 kaçtır?",
  "options": ["2", "4", "6", "8"],
  "correctAnswer": 1
}
```

#### **GET - Sınavın Sorularını Getir**

```
Method: GET
URL: http://localhost:5000/api/questions/exam/BURAYA_SINAV_ID_KOY
```

#### **POST - Sınav Sonucunu Gönder**

```
Method: POST
URL: http://localhost:5000/api/exams/submit

Headers:
Content-Type: application/json

Body (Raw JSON):
{
  "examId": "BURAYA_SINAV_ID_KOY",
  "answers": [
    {
      "questionId": "BURAYA_SORU_ID_KOY",
      "selectedAnswer": 1
    }
  ]
}
```

#### **GET - Sınav Sonuçlarını Getir**

```
Method: GET
URL: http://localhost:5000/api/exams/results/BURAYA_SINAV_ID_KOY
```

---

## 🗄️ DataGrip Kurulumu (JetBrains)

### 1. DataGrip İndir

- https://www.jetbrains.com/datagrip/
- Ücretsiz trial veya lisans al
- Kur

### 2. PostgreSQL Bağlantısı Oluştur

A. **File → New → Data Source → PostgreSQL** seç

B. **Connection Ayarları:**

```
Host:      localhost
Port:      5432
Database:  sinav_platformu
User:      postgres
Password:  postgres
```

C. **Test Connection** → OK

### 3. Veritabanı Yapısını Gözle

Sol panel'de tablolar görülecek:

- `exams` - Sınavlar
- `questions` - Sorular
- `exam_results` - Sınav Sonuçları
- `exam_answers` - Verilen Cevaplar

### 4. SQL Sorguları Çalıştır

DataGrip'te yeni SQL tab aç:

```sql
-- Tüm sınavları göster
SELECT * FROM exams;

-- Tüm soruları göster
SELECT * FROM questions;

-- Sınav sonuçlarını göster
SELECT * FROM exam_results;

-- Belirli sınavın sonuçları
SELECT * FROM exam_results WHERE exam_id = 'BURAYA_ID_KOY';
```

---

## 📊 Veritabanı Şeması

```
exams
├── id (UUID)
├── title (String)
├── description (String)
└── createdAt (DateTime)

questions
├── id (UUID)
├── examId (UUID) → exams.id
├── text (String)
├── options (String[])
├── correctAnswer (Int)
└── createdAt (DateTime)

exam_results
├── id (UUID)
├── examId (UUID) → exams.id
├── score (Int)
├── totalQuestions (Int)
├── feedback (Text)
└── timestamp (DateTime)

exam_answers
├── id (UUID)
├── resultId (UUID) → exam_results.id
├── questionId (UUID) → questions.id
└── selectedAnswer (Int)
```

---

## 🔄 Tipik Workflow

### Admin: Sınav + Sorular Ekle

1. Thunder Client'ta POST - Sınav Oluştur çalıştır
2. Gelen `id` kopyala
3. POST - Soru Ekle'de `examId` olarak yapıştır
4. Birkaç soru daha ekle

### Aday: Sınav Çöz

1. Frontend'de Aday Paneli açı
2. Sınavı seç → sorularını cevapla
3. Gönder

### Admin: Sonuçları Görüntüle

1. Frontend'de Admin Paneli → Yapılan Sınavlar
2. Sınavı seç → sonuçları gözle
3. DataGrip'te: `SELECT * FROM exam_results WHERE exam_id = '...'`

---

## 💡 İpuçları

- **Thunder Client Collections'ı kaydet:** Save to File butonuna tıkla
- **DataGrip'te tablo düzenle:** Tabloya sağ tıkla seç
- **Markdown'da SQL:**
  ```sql
  SELECT * FROM exams LIMIT 5;
  ```
- **Hızlı Test:** Thunder Client'ta `Send` tuş basıp Response gözle

---

## 🚀 Otomatizasyon (Opsiyonel)

### Thunder Client Collection Template

```json
{
  "clientName": "Thunder Client",
  "dateExported": "2024-03-27",
  "version": "1.1",
  "folders": [],
  "requests": [
    {
      "name": "POST - Sınav Oluştur",
      "url": "localhost:5000/api/exams/management",
      "method": "POST",
      "headers": [{ "key": "Content-Type", "value": "application/json" }],
      "body": {
        "text": "{\"title\": \"Test Sınavı\"}"
      }
    }
  ]
}
```

Thunder Client → Collections → ... → **Export Collection** ile kaydet ve başkalarıyla paylaş!
