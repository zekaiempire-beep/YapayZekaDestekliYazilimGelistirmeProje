# Sınav Yönetim Sistemi

React Frontend ve NestJS Backend ile geliştirilmiş bir sınav yönetim uygulaması.

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

- [ ] Sınav CRUD işlemleri
- [ ] Sorular yönetimi
- [ ] Sınav sonuçları ve raporlama
- [ ] E-posta bildirimleri
- [ ] Sınav takvimi
- [ ] Kullanıcı yönetim paneli
- [ ] Test coverage
- [ ] Production build optimizasyonu

## Sorun Giderme

### CORS Hatası

Backend'deki CORS ayarlarını kontrol edin. `main.ts` dosyasında frontend URL'i doğru şekilde konfigüre edilmiş olmalıdır.

### Veritabanı bağlantı hatası

- PostgreSQL'in çalışıyor olduğundan emin olun
- `.env` dosyasındaki veritabanı bilgilerini kontrol edin

### Port kullanımda

- `lsof -i :3000` (Linux/Mac) - hangi proces port 3000'i kullanıyor kontrol edin
- `netstat -ano | findstr :3000` (Windows) - kullanımdaki portu kontrol edin

## Geliştirme

### Backend

Yeni module oluşturma:

```bash
nest generate module <module-name>
```

Yeni controller oluşturma:

```bash
nest generate controller <controller-name>
```

### Frontend

Yeni bileşen oluşturma:

```bash
# src/components/ klasöründe ComponentName.jsx dosyası oluşturun
```

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
