# 🗄️ PostgreSQL Kurulum ve Veritabanı Konfigürasyonu

## 1️⃣ PostgreSQL Kurulumu

### Windows

1. https://www.postgresql.org/download/windows/ adresinden PostgreSQL'ı indir
2. Installer'ı çalıştır
3. Setup sırasında:
   - Password: `postgres` (veya istediğin şifre)
   - Port: `5432` (default)
   - Locale: Turkish (Türkiye)

### macOS

```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 2️⃣ Veritabanını Oluştur

```bash
# PostgreSQL CLI'ye bağlan
psql -U postgres

# Terminal'de şu komutu çalıştır:
CREATE DATABASE sinav_platformu;
\q
```

Veya GUI ile daha kolay:

```bash
# pgAdmin açabilirsin (PostgreSQL kurulumu sırasında kurulur)
# adresini ziyaret et
```

## 3️⃣ Prisma Migrations Çalıştır

Backend klasöründe:

```bash
cd backend

# .env dosyasındaki DATABASE_URL'i kontrol et
# DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/sinav_platformu"

# Migrasyonları oluştur ve çalıştır
npm run prisma:migrate
# İçin bir isim sorulacak: "init" seç

# Başarılı oldu! ✅
```

## 4️⃣ Prisma Studio ile Veritabanını Görüntüle

```bash
npm run prisma:studio
```

Browser'da `http://localhost:5555` açılacak - burada tüm tabloları görebilirsin!

## 🔐 Veritabanı Bağlantı Bilgileri

```
Host: localhost
Port: 5432
Database: sinav_platformu
User: postgres
Password: postgres (veya kurulumda ayarladığın şifre)
```

## 📊 DataGrip Bağlantısı

1. **DataGrip'i aç**
2. **File → New → Data Source → PostgreSQL**
3. Şu bilgileri gir:
   ```
   Host: localhost
   Port: 5432
   User: postgres
   Password: postgres
   Database: sinav_platformu
   ```
4. **Test Connection** butonuna tıkla
5. **OK** butonuna tıkla

Artık tüm tabloları DataGrip'te görebilirsin! 🎉

## 🧪 Thunder Client ile Test

Thunder Client'ı VS Code'da aç:

- Extensions kısmından "Thunder Client" yükle
- Yeni request oluştur:
  - **POST** `http://localhost:5000/api/exams/management`
  - Headers: `Content-Type: application/json`
  - Body:
    ```json
    {
      "title": "Matematik Sınavı",
      "description": "9. Sınıf Matematik"
    }
    ```
  - **Send** butonuna tıkla

Başarılı oldu! Veritabanında yeni sınav kaydedildi! ✅

## 📝 Faydalı Komutlar

```bash
# Tüm veritabanı tablosunu sil ve yeniden oluştur
npm run prisma:migrate -- --name reset

# Prisma Client'ı regenerate et
npx prisma generate

# Veritabanındaki örnekleri görüntüle
npm run prisma:studio
```

## 🚨 Sorun Giderme

### "Could not connect to the database"

- PostgreSQL servisi çalışıyor mu? `services.msc` kontrol et
- DATABASE_URL biraz değişti mi? Kontrol et

### "Table does not exist"

- Migration'ı çalıştır: `npm run prisma:migrate`

### Port 5432 kullanımda

- Başka PostgreSQL instance'ı var mı?
- `.env` dosyasında farklı port kur
