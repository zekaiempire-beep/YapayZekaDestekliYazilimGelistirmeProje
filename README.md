# AI Sınav Platformu - Ollama Destekli Akıllı Değerlendirme Sistemi

Bu proje, yapay zeka (Ollama API) entegrasyonu ile geliştirilen, çoktan seçmeli sınav süreçlerini otomatize eden ve kullanıcılara anında kişiselleştirilmiş geri bildirim sunan modern bir web uygulamasıdır. Temiz kod prensipleri ve istemci-sunucu mimarisine sadık kalınarak hem eğitmenler hem de öğrenciler için hızlı, kesintisiz ve eğitici bir deneyim hedeflenmiştir.

# Kullanılan Teknolojiler
•	Backend: Node.js, REST API

•	Frontend: React, Next.js, Tailwind CSS

•	Yapay Zeka (AI): Ollama API (Yerel AI Model Entegrasyonu)

•	Veri Depolama: Yerel JSON Dosya Sistemi (uuid ile benzersiz kimliklendirme)

•	Ağ & Entegrasyon: Axios HTTP İstemcisi, CORS, Dot.env (Çevre Değişkenleri Yönetimi)


# Temel Özellikler ve Sınav Mekanikleri
•	AI Geri Bildirimi: Sistem sadece doğru/yanlış sayısını vermekle kalmaz. Sınav bitiminde gönderilen cevaplar backend üzerinden yapay zeka API’ya iletilir. Yapay zeka hatalı cevapları analiz eder, kavram yanılgılarını açıklar ve tamamen teşvik edici bir tonda kişiselleştirilmiş çalışma önerileri sunar.

•	İzole Edilmiş Paneller: Eğitmenler (Admin) ve Adaylar (Öğrenci) için farklı giriş noktaları ve yetki alanları sunulur.

•	Dinamik Soru Yönetimi: Admin panelinden saniyeler içinde yeni sorular eklenebilir, mevcut soruların metinleri veya doğru cevapları düzenlenebilir. Değişiklikler anında sisteme yansır.

•	Anlık Raporlama: Öğrenci sınavı bitirdiği an, herhangi bir bekleme süresi olmadan başarı oranı (Puan / Toplam Soru) ve AI analiz raporu ekranda oluşturulur.


# Proje Klasör Yapısı
1. Frontend/app: Sistemin kullanıcı arayüzü (UI) katmanıdır. page.tsx (Ana sayfa), admin/page.tsx (Yönetim Paneli) ve exam/page.tsx (Sınav Ekranı) gibi temel sayfalar burada yönlendirilir.

2. Frontend/components & lib: Tekrar kullanılabilir React UI bileşenleri ve frontend tarafındaki yardımcı fonksiyonların tutulduğu, kod tekrarını önleyen mimari alandır. 

3. Backend/routes: Sistemin dışa açılan API kapılarıdır. questions.js (Soru CRUD işlemleri) ve exams.js (Sınav değerlendirme) uç noktaları buradan yönetilir. 

4. Backend/utils & data: Veri işleme mantığının bulunduğu yerdir. storage.js (JSON veri yazma/okuma) ve uygulamanın beyni olan OllamaAnalyzer.js (Yapay zeka entegrasyonu) bu katmanda çalışır.

# Kurulum ve Çalıştırma Rehberi
Sistemi bilgisayarınızda yerel olarak çalıştırmak için Node.js ve arka plan analizleri için Ollama'nın kurulu olması gerekmektedir.

1. Ön Gereksinimler
•	Node.js

•	Ollama (Bilgisayarda kurulu ve uygun modelin indirilmiş olması gerekir)


2. Adım Çalıştırma Proje iki farklı sunucu (Backend ve Frontend) olarak ayağa kalkmaktadır. İki ayrı terminal (veya CMD/PowerShell) ekranı açın:
Terminal 1 (Backend Sunucusu):
Bash

cd backend

npm install <------- (bağımlılıkları yükle)

npm run dev

Terminal 2 (Frontend Arayüzü):
Bash

cd frontend

npm install <------- (bağımlılıkları yükle)

npm run dev



3. Uygulamaya Erişim

•	Ana Sayfa (Giriş Seçimi): http://localhost:3000

•	Admin Paneli: http://localhost:3000/admin

•	Aday Sınav Ekranı: http://localhost:3000/exam

•	Backend API: http://localhost:5000

# Geliştirici Rehberi: API Yönetimi ve Entegrasyon (Cheat Sheet)
Dış sistemlerin veya geliştiricilerin sisteme entegre olabilmesi için tasarlanan temel API Endpoint'leri aşağıda listelenmiştir:

1. Soru Yönetimi (CRUD İşlemleri):
•	GET /api/questions : Tüm soruları listeler.

•	POST /api/questions : Yeni soru ekler.

•	PUT /api/questions/:id : Belirtilen soruyu günceller.

•	DELETE /api/questions/:id : Belirtilen soruyu siler.


Örnek POST/PUT Body Payload:
JSON
{
  "text": "Soru metni",
  "options": ["Seçenek 1", "Seçenek 2", "Seçenek 3", "Seçenek 4"],
  "correctAnswer": 0
}


2. Sınav ve Değerlendirme Sistemi:
•	POST /api/exams/submit : Öğrencinin cevaplarını gönderir ve AI analizini başlatır.

•	GET /api/exams/history : Geçmiş sınav sonuçlarını ve AI raporlarını getirir.



Örnek Sınav Gönderim (Submit) Payload:
JSON
{
  "answers": [
    {
      "questionId": "uuid-örnek-id-1234",
      "selectedAnswer": 0
    }
  ]
}


# Kullanıcı Rehberi (Nasıl Kullanılır?)
Admin (Eğitmen) Olarak Soru Ekleme:

1.	Ana sayfadan "Admin Girişi" butonuna tıklayın.
	
3.	Yönetim panelinde soru metnini ve 4 farklı seçeneği ilgili kutulara girin.
	
5.	Doğru olan seçeneği işaretleyin ve "Ekle" butonuna basarak soruyu sisteme dahil edin.
	

Aday (Öğrenci) Olarak Sınava Katılma:

1.	Ana sayfadan "Aday Girişi" butonuna ve ardından "Sınava Başla" butonuna tıklayın.

2.	Ekrana gelen sorularda doğru olduğunu düşündüğünüz şıkkı seçin. Önceki/Sonraki butonları ile sorular arasında gezinebilirsiniz.
	
3.	Tüm soruları tamamladığınızda "Sınavı Gönder" butonuna tıklayın. Saniyeler içinde yapay zeka analiziniz ve başarı puanınız ekranda belirecektir.
	

# Güvenlik ve Üretim Ortamı (Production) İyileştirmeleri

Bu proje mevcut haliyle bir demostrasyon (PoC) altyapısına sahiptir. Kurumsal bir yapıya (Enterprise) geçiş yapmak ve projeyi canlıya (Production) almak için aşağıdaki mimari geliştirmelerin yapılması hedeflenmektedir:

•	Kimlik Doğrulama & Yetkilendirme: Admin ve Öğrenci girişleri için JWT (JSON Web Token) tabanlı güvenli oturum yönetimi eklenmelidir.

•	Kalıcı Veri Katmanı: Mevcut JSON tabanlı geçici depolama mimarisi yerine, PostgreSQL veya MongoDB gibi kurumsal düzeyde bir ilişkisel/doküman veri tabanına geçilmelidir.

•	Hizmet Sürekliliği ve Güvenlik: Kötü niyetli API isteklerini engellemek için Rate Limiting, sunucu taraflı CORS kısıtlamaları ve iletişimin şifrelenmesi için HTTPS/SSL sertifikaları yapılandırılmalıdır.




