# Sınav Yönetim Sistemi

Merhaba! 👋 Bu proje şu an aşağıdaki özelliklere sahiptir:

## ✅ Tamamlanan Özellikler

### Backend (NestJS + PostgreSQL)

- ✅ Proje yapısı ve kurulumu
- ✅ PostgreSQL veritabanı konfigürasyonu
- ✅ User Entity (Öğrenci, Personel, Admin rolleri ile)
- ✅ Kimlik doğrulama sistemi:
  - ✅ Kullanıcı kayıt (Register)
  - ✅ Kullanıcı giriş (Login)
  - ✅ JWT token temelli oturum
  - ✅ Şifre hashlama (bcrypt)
- ✅ Yetkilendirme sistemi (Roles Guard)
- ✅ API koruması (JWT Strategy)
- ✅ CORS yapılandırması
- ✅ Global Validation Pipe

### Frontend (React + React Router)

- ✅ Proje yapısı ve kurulumu
- ✅ Sayfa yönlendirmesi (React Router)
- ✅ Auth Context (Durum yönetimi)
- ✅ Arayüz Bileşenleri:
  - ✅ Kayıt Sayfası (Register)
  - ✅ Giriş Sayfası (Login)
  - ✅ Dashboard (Rol bazlı)
  - ✅ Unauthorized sayfası
  - ✅ 404 Not Found sayfası
- ✅ Rota Koruyucuları (Protected Routes)
- ✅ Role-based Dashboard'lar:
  - ✅ Öğrenci Dashboard (Sınavları Görüntüle)
  - ✅ Personel Dashboard (Sınav Yönetimi)
  - ✅ Admin Dashboard (Sistem Yönetimi)
- ✅ Modern ve duyarlı tasarım
- ✅ Hata mesajları ve loading states

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register  - Yeni kullanıcı kaydı
POST   /api/auth/login     - Giriş yap
GET    /api/auth/profile   - Profil bilgisi (JWT gerekli)
```

### Örnek Kullanaıcılar (Kaydedebilirsiniz)

1. **Öğrenci**
   - Email: student@example.com
   - Role: student

2. **Personel**
   - Email: staff@example.com
   - Role: staff

3. **Admin**
   - Email: admin@example.com
   - Role: admin

## 🚀 Hızlı Başlangıç

### Adım 1: Backend'i Başlatın

```bash
cd backend
npm run start:dev
```

Backend http://localhost:3000 adresinde çalışacak

### Adım 2: Frontend'i Başlatın

```bash
cd frontend
npm start
```

Frontend otomatik olarak tarayıcıda açılacak

### Adım 3: Uygulamayı Deneyin

1. `/register` sayfasında yeni bir kullanıcı oluşturun
2. Kayıt olduktan sonra `/login` sayfasından giriş yapın
3. Dashboard'da rolünüze göre farklı panelleri görsrsünüz

## 📋 Şu An Test Edilebilecek Akışlar

1. **Kayıt Akışı**
   - Yeni kullanıcı oluşturma
   - Rol seçimi (Öğrenci, Personel, Admin)

2. **Giriş Akışı**
   - E-posta ve şifre ile giriş
   - JWT token üretimi ve saklaması

3. **Dashboard Panelleri**
   - Öğrenci: Sınav listesi ve durumu
   - Personel: Sınav yönetim arayüzü
   - Admin: Sistem istatistikleri ve kullanıcı listesi

4. **Güvenlik**
   - Korumalı rotalar (giriş yapmayanlar giriş sayfasına yönlendirilir)
   - Rol kontrollü erişim

## 🛠️ Yapılacaklar (Gelecek İmplantasyonlar)

- [ ] **Sınav Modülü**
  - Sınav oluşturma, düzeltme, silme
  - Sınav takvimi
  - Sınav özellikleri

- [ ] **Sorular Modülü**
  - Soru types (Çoktan seçmeli, Açık uçlu, vb)
  - Soru yönetimi

- [ ] **Sonuç Yönetimi**
  - Sınav sonuçlarını kaydetme
  - Rapor oluşturma
  - İstatistikler

- [ ] **Bildirim Sistemi**
  - E-posta bildirimleri
  - Sınav anımsatıcıları

- [ ] **İyileştirmeler**
  - Pagination
  - Arama ve filtreleme
  - Export özelliği (PDF, Excel)
  - Dark mode
  - Çoklu dil desteği

## 📚 Dosya Yapısı

```
sinavsistemiV2/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   └── decorators/
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── config/
│   │   │   └── database.config.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── components/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── RoleBasedDashboards.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── guards/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── README.md
└── QUICKSTART.md
```

## 🔑 Kullanılan Teknolojiler

| Backend     | Frontend     |
| ----------- | ------------ |
| NestJS      | React        |
| TypeORM     | React Router |
| PostgreSQL  | Axios        |
| JWT         | Context API  |
| Passport.js | CSS3         |
| Bcrypt      |              |

## 💡 İpuçları

1. **Geliştirme Sırasında**
   - Backend console.log'larından hata ayıklama yapabilirsiniz
   - Browser dev tools'u kullanarak frontend'i debug edebilirsiniz
   - Network tab'ında API çağrılarını görebilirsiniz

2. **Database**
   - TypeORM synchronize true ayarında olduğu için tablo otomatik oluşturulur
   - pgAdmin ile veritabanını görüntüleyebilirsiniz

3. **Token**
   - Token localStorage'da saklanır
   - Her sayfada refresh edilirse token kontrol edilir
   - Token geçersiz ise login sayfasına yönlendirilirsiniz

## ⚠️ Önemli Notlar

1. **Güvenlik**
   - `.env` dosyasında JWT_SECRET'i değiştirin (production'da)
   - Şifreler bcrypt ile hashleniyor
   - CORS sadece localhost'tan gelen istekleri kabul ediyor

2. **Veritabanı**
   - PostgreSQL 12+ kullanılmalı
   - Connection string `.env` dosyasında ayarlanmış

3. **Development**
   - Hot reload aktif (değişiklikler otomatik uygulanır)
   - Hata ayıklama için console kontrol edin

## 📞 Destek

Herhangi bir soru veya sorun yaşarsanız:

1. README.md dosyasını kontrol edin
2. Console ve Network tab'ında hataları kontrol edin
3. Backend ve Frontend sunucularının çalışıp çalışmadığını kontrol edin

## ✨ Keyifli kodlamalar! 🎉
