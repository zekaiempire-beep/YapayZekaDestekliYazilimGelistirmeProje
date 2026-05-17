#!/bin/bash

# Sınav Yönetim Sistemi - Kurulum Betiği

echo "🚀 Sınav Yönetim Sistemi Kurulumu Başlıyor..."

# Backend kurulumu
echo ""
echo "📦 Backend bağımlılıkları kurulumu..."
cd backend
npm install
echo "✅ Backend kurulumu tamamlandı"

# Frontend kurulumu
echo ""
echo "📦 Frontend bağımlılıkları kurulumu..."
cd ../frontend
npm install
echo "✅ Frontend kurulumu tamamlandı"

echo ""
echo "✨ Kurulum tamamlandı!"
echo ""
echo "Başlamak için:"
echo "1. Backend: cd backend && npm run start:dev"
echo "2. Frontend: cd frontend && npm start"
