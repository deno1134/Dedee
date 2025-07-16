# Denicord Deployment Guide - Render.com (ÜCRETSİZ)

## 🆓 Ücretsiz Plan Limitleri

- **Web Services**: 1 ücretsiz
- **Databases**: 1 ücretsiz (PostgreSQL)
- **Static Sites**: Sınırsız ücretsiz

## 🚀 Adım 1: Backend + Database (Blueprint)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/SENIN_GITHUB_USERNAME/denicord)

### Blueprint ile Deploy:
1. **Yukarıdaki butona tıklayın**
2. **GitHub repository'nizi bağlayın**
3. **Sadece backend ve database deploy edilecek:**
   - Database: `denicord-database` (FREE)
   - Backend: `denicord-backend` (FREE)
4. **"Deploy" butonuna tıklayın**

## 🎨 Adım 2: Frontend (Manuel - Static Site)

Backend deploy tamamlandıktan sonra:

### 1. Static Site Oluşturma
1. **Render Dashboard'a gidin**
2. **"New" → "Static Site" seçin**
3. **Aynı GitHub repository'yi seçin**

### 2. Static Site Ayarları
```
Name: denicord-frontend
Branch: main
Root Directory: desktop
Build Command: npm install && npm run build:web
Publish Directory: dist
```

### 3. Environment Variables
```
VITE_API_URL=https://denicord-backend.onrender.com
VITE_WS_URL=https://denicord-backend.onrender.com
```

### 4. Deploy
**"Create Static Site" butonuna tıklayın**

## 📋 Deployment Süreci

### Timeline:
- **Database**: ~2-3 dakika ✅
- **Backend**: ~3-5 dakika ✅
- **Frontend**: ~2-3 dakika ✅

### Final URLs:
- **Frontend**: `https://denicord-frontend.onrender.com`
- **Backend**: `https://denicord-backend.onrender.com`

## 🔧 Backend Environment Variables (Otomatik)

```env
NODE_ENV=production
DATABASE_URL=(auto-generated)
JWT_SECRET=(auto-generated)
CORS_ORIGIN=https://denicord-frontend.onrender.com
```

## 📱 Mobil App Güncellemesi

Deploy tamamlandıktan sonra:

### Android
`app/src/main/java/com/denicord/network/ApiService.kt`:
```kotlin
private const val BASE_URL = "https://denicord-backend.onrender.com/"
```

### iOS
`ios-ipad/DenicordIpad/ContentView.swift`:
```swift
private let apiURL = "https://denicord-backend.onrender.com"
```

## 🔄 Ücretsiz Plan Kısıtlamaları

- **Backend**: 750 saat/ay (sleep after 15 min inactivity)
- **Database**: 1GB storage, 1 million rows
- **Frontend**: Sınırsız bandwidth ve requests

## 🛠️ Sleep Mode Çözümü

Backend 15 dakika sonra uyur. Çözüm:

### 1. Ping Script (Opsiyonel)
```javascript
// Her 10 dakikada backend'e ping at
setInterval(() => {
  fetch('https://denicord-backend.onrender.com/api/health')
}, 10 * 60 * 1000);
```

### 2. UptimeRobot (Ücretsiz)
- https://uptimerobot.com/
- 5 dakikada bir ping
- Ücretsiz hesap yeterli

## 🎯 Avantajlar

✅ **Tamamen ücretsiz** - Para ödeme yok
✅ **Otomatik SSL** - HTTPS hazır
✅ **Git integration** - Push = deploy
✅ **Custom domains** - Kendi domain'inizi bağlayın
✅ **Monitoring** - Built-in logs

## 🚨 Troubleshooting

### 1. Backend Sleep
- İlk request 30 saniye sürebilir
- UptimeRobot kullanın

### 2. Database Connection
- Health check: `/api/health`
- Logs'larda connection string kontrol edin

### 3. CORS Hatası
- Frontend URL'ini backend CORS'a ekleyin
- Environment variables'ı kontrol edin

## 💡 Pro Tips

1. **Custom Domain**: Render'da ücretsiz SSL ile domain bağlayın
2. **Monitoring**: Render dashboard'da metrics takip edin
3. **Logs**: Real-time logs ile debug yapın
4. **Git Deploy**: Push to main = auto deploy

---

**🎉 Artık tamamen ücretsiz Discord clone'unuz hazır!**