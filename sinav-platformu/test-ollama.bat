@echo off
REM Ollama Entegrasyonu Test Scripti (Windows)

echo.
echo 🔍 Sinav Platformu - Ollama Entegrasyonu Test Ediliyor...
echo.

set BASE_URL=http://localhost:3000

REM 1. Ollama Baglantisini Test Et
echo 1️⃣  Ollama Baglandisi Kontrol Ediliyor...
echo    Endpoint: GET /api/exams/health/ollama
curl -s "%BASE_URL%/api/exams/health/ollama"
echo.
echo.

REM 2. Backend'in Calissip Calismmadigini Kontrol Et
echo 2️⃣  Backend Baglandisi Kontrol Ediliyor...
curl -s "%BASE_URL%/api/exams/health/ollama" >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Backend calisiyor
) else (
    echo    ❌ Backend'e baglanalamadi
    echo    Lutfen backend'i basla: npm run dev
    pause
    exit /b 1
)
echo.

REM 3. Ornek Sinav Verisi
echo 3️⃣  Ornek Sinav Sonucu Gonderi
liyor...
echo    Endpoint: POST /api/exams/submit
echo.

curl -X POST "%BASE_URL%/api/exams/submit" ^
  -H "Content-Type: application/json" ^
  -d "{""examId"": ""test-exam-1"", ""answers"": [{""questionId"": 1, ""selectedAnswer"": 0}, {""questionId"": 2, ""selectedAnswer"": 1}, {""questionId"": 3, ""selectedAnswer"": 2}], ""analyzer"": ""ollama""}"

echo.
echo.
echo 4️⃣  Test Tamamlandi!
echo.
echo ✅ Basarili ysa:
echo    - Sinav sonuslari geri bildirimi gorecegiz
echo    - Basari orani ve analizler listelenecek
echo.
echo ❌ Hata aldiyan:
echo    1. Ollama'nin calisiyor mu? (ollama serve)
echo    2. Model yuklendi mi? (ollama pull mistral)
echo    3. Backend calisiyor mu? (npm run dev)
echo    4. .env dosyasinda OLLAMA_URL ve OLLAMA_MODEL dogru mu?
echo.

pause
