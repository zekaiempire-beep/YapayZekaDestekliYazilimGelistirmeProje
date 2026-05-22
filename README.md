# Sınav Yönetim Sistemi

Bu proje, yapay zeka (Ollama API) entegrasyonu ile geliştirilen, çoktan seçmeli sınav süreçlerini otomatize eden ve kullanıcılara anında kişiselleştirilmiş geri bildirim sunan modern bir web uygulamasıdır. Temiz kod prensipleri ve istemci-sunucu mimarisine sadık kalınarak hem eğitmenler hem de öğrenciler için hızlı, kesintisiz ve eğitici bir deneyim hedeflenmiştir. 

# Kullanılan Teknolojiler
•	Backend: NestJS, Node.js, REST API

•	Frontend: React, Next.js, Tailwind CSS

•	Yapay Zeka (AI): Ollama API - Mistral (Yerel AI Model Entegrasyonu)

•	Veri Depolama: PostgreSQL Veritabanı ile sistem hafızasını kullanma.

# Temel Özellikler ve Sınav Mekanikleri

•	Öğrenci, Personel ve Admin şeklinde bir kayıt sistemi mevcuttur.

•	Personel ve Admin tarafından hazırlanan test sınavlarrını, öğrenciler uygulayabilmektedir ve sonuçları gönderebilmektedir.

•	Raporlama: Öğrencinin sınav sonucu rapor olarak admin panelinden görüntülenebilecek şekilde karşısına düşmekte.

•	 Değerlendirme: Admini öğrencinin sınav raporunu görüntüleyip, yanlış yapılan sorular için geribildirim yapabilmekte ve sınav sonuçlarını sonuçlarını yayınlayabilmektedir. Daha sonrası için de geribildirim notunu güncelleyebilmektedir.

•	Yayınlanan sınav raporu, öğrenci tarafından görüntülenebilmektedir.

•	AI Geri Bildirimi: Sistem sadece doğru/yanlış sayısını vermekle kalmaz. Sınav bitiminde gönderilen cevaplar backend üzerinden yapay zeka API’ya iletilir. Yapay zeka hatalı cevapları analiz eder, kavram yanılgılarını açıklar ve tamamen teşvik edici bir tonda kişiselleştirilmiş çalışma önerileri sunar.

•	İzole Edilmiş Paneller: Eğitmenler (Admin) ve Adaylar (Öğrenci) için farklı giriş noktaları ve yetki alanları sunulur.

•	Dinamik Soru Yönetimi: Admin panelinden saniyeler içinde yeni sorular eklenebilir, mevcut soruların metinleri veya doğru cevapları düzenlenebilir. Değişiklikler anında sisteme yansır.




## Proje Yapısı

```
sinavsistemiV2/
├── backend/          # NestJS API Sunucusu
│   ├── src/
│   │   ├── auth/     # Kimlik doğrulama (login, register, JWT)
│   │   ├── entities/ # Database entiteleri
│   │   ├── config/   # Yapılandırma dosyaları
│   │   └── main.ts   # Uygulama entry point
│   ├── .env          # Ortam değişkenleri
│   └── package.json
└── frontend/         # React Web Arayüzü
    ├── src/
    │   ├── pages/        # Giriş, Kayıt, Dashboard
    │   ├── components/   # Dashboard bileşenleri
    │   ├── context/      # Auth Context
    │   ├── services/     # API servisleri
    │   ├── guards/       # Rota koruyucuları
    │   └── App.jsx       # Ana uygulama
    ├── package.json
    └── public/
```

## Kullanıcı Rolleri

1. **Öğrenci (Student)**
   - Sınavları görüntüle
   - Yaklaşan sınavlara hazırlanma
   - Tamamlanan sınavların sonuçlarını görüntüleme

2. **Personel (Staff)**
   - Yeni sınav oluşturma
   - Sınavları yönetme
   - Sonuçları indirme
   - Son etkinlikleri takip etme

3. **Admin (Admin)**
   - Kullanıcıları yönetme
   - Tüm sınavları yönetme
   - Sistem raporlarını görüntüleme
   - Sistem ayarlarını yapılandırma

## Teknoloji Yığını

### Backend

- **NestJS** - Express tabanlı Node.js framework
- **TypeORM** - SQL ORM
- **PostgreSQL** - Veritabanı
- **JWT** - Token tabanlı kimlik doğrulama
- **Passport.js** - Kimlik doğrulama stratejileri

### Frontend

- **React** - UI kütüphanesi
- **React Router** - Sayfa yönlendirmesi
- **Axios** - HTTP istemci
- **CSS3** - Stil

## Kurulum ve Çalıştırma

### Ön Koşullar

- Node.js 16+
- PostgreSQL 12+
- npm
- Ollama / Model: Mistral

### Backend Kurulumu

1. Backend dizinine gidin:

```bash
cd backend
```

2. Bağımlılıkları kurun:

```bash
npm install
```

3. `.env` dosyasını kontrol edin ve veritabanı bağlantısını ayarlayın:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=sinavsistemi
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRATION=7d
```

4. Geliştirme sunucusunu başlatın:

```bash
npm run start:dev
```

Backend `http://localhost:3000` adresinde çalışacaktır.

### PostgreSQL Veritabanı Kurulumu

PostgreSQL'i yüklü değilse:

**Windows:**

```bash
# pgAdmin aracılığıyla veya psql kullanarak
CREATE DATABASE sinavsistemi;
```

**Linux/Mac:**

```bash
psql
CREATE DATABASE sinavsistemi;
```

### Frontend Kurulumu

1. Frontend dizinine gidin:

```bash
cd frontend
```

2. Bağımlılıkları kurun:

```bash
npm install
```

3. Geliştirme sunucusunu başlatın:

```bash
npm start
```

Frontend `http://localhost:3000` adresinde çalışacaktır. (React server)

## Gerekli Ports

- **Backend API**: `http://localhost:3000` (arka planda)
- **Frontend**: `http://localhost:3000` (React dev server'ında çalışacaktır, port ayarlanabilir)

Eğer çakışma yaşıyorsanız, frontend'i farklı portta çalıştırabilirsiniz:

```bash
PORT=3001 npm start
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Yeni kullanıcı kaydı
- `POST /login` - Kullanıcı girişi
- `GET /profile` - Kullanıcı profilini getir (JWT gerekli)

## Kullanıcı Akışı

### Kayıt Olma

1. `/register` sayfasına gidin
2. Ad, soyadı, e-posta, şifresi ve rolü girin
3. Kayıt ol düğmesine tıklayın
4. Otomatik olarak giriş sayfasına yönlendirilirsiniz

### Giriş Yapma

1. `/login` sayfasına gidin
2. E-posta ve şifrenizi girin
3. Giriş yap düğmesine tıklayın
4. Başarılı girişten sonra Dashboard'a yönlendirilirsiniz

### Dashboard

- Rolünüze göre farklı paneller görsrsünüz
- Çıkış Yap butonu ile oturumu sonlandırabilirsiniz

## Kimlik Doğrulama Akışı

1. Kullanıcı login yapar
2. Backend JWT token üretir ve geri gönderir
3. Token localStorage'da saklanır
4. Her API isteği Authorization header'ında token gönderilir
5. Backend token'ı doğrular ve işlemi yapılandırır

## Yapılacak İşler (Gelecek)

Eksikler ve Öneriler

-> (Erişilebilirlik )Öğrenci kayıt olduktan sonra bir öğrenci numarası atanabilir. Böylelikle öğrenci işlemleri konusunda kolaylık sağlar.

-> (Erişilebilirlik) Sınav sonuçları yayınlandıktan sonra sınav yayınlanma tarihi gösterilebilir

-> (Erişilebilirlik) Öğrenciye açıklama notu yazıldıktan sonra 'Değerlendirildi' gibi bir durum ifadesi eklenebilir ve sınav sonuçlarını yayınlama konusunda kolaylık sağlandırtabilir

-> (Erişilebilirlik) Kullanıcıları Yönet kısmına detaylı özellikler eklenebilir. (öğrenciye tıklayınca ortalamasını görüntüleme, hangi sınavlara girdiği vs. vs. gibi bilgiler)

-> (UI) Admin için onay bekleyen sınav varsa bildirim gözükebilir.

-> (UI) Öğrenci sonuçlarını görüntüleme ekranı güzelleştirilebilir, sayfa sayfa geçsin gibi. Aynı şekilde Admin de.

-> Personel review yapılabilir

## Sorun Giderme

### CORS Hatası

Backend'deki CORS ayarlarını kontrol edin. `main.ts` dosyasında frontend URL'i doğru şekilde konfigüre edilmiş olmalıdır.

### Veritabanı bağlantı hatası

- PostgreSQL'in çalışıyor olduğundan emin olun
kullanıcı adı: postgres
şifre: postgres
- 
- `.env` dosyasındaki veritabanı bilgilerini kontrol edin

### Port kullanımda

- `lsof -i :3000` (Linux/Mac) - hangi proces port 3000'i kullanıyor kontrol edin
- `netstat -ano | findstr :3000` (Windows) - kullanımdaki portu kontrol edin







