# Denicord Deployment Guide - Render.com Blueprint

## 🚀 Tek Tıkla Deploy (Blueprint)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/SENIN_GITHUB_USERNAME/denicord)

### 1. Blueprint ile Deploy Etme

1. **Yukarıdaki "Deploy to Render" butonuna tıklayın**
2. **GitHub repository'nizi bağlayın**
3. **Service isimlerini kontrol edin:**
   - Database: `denicord-database` 
   - Backend: `denicord-backend`
   - Frontend: `denicord-frontend`
4. **Environment variables otomatik ayarlanacak**
5. **"Deploy" butonuna tıklayın**

### 2. Deployment Sonrası

Deploy işlemi tamamlandıktan sonra:

- **Database** ~2-3 dakika
- **Backend** ~3-5 dakika  
- **Frontend** ~2-3 dakika

### 3. URL'ler

Deploy tamamlandıktan sonra URL'leriniz:

- **Frontend**: `https://denicord-frontend.onrender.com`
- **Backend API**: `https://denicord-backend.onrender.com`
- **Database**: Internal connection (otomatik bağlı)

## 📱 Mobil Uygulama Güncellemesi

### Android App
`app/src/main/java/com/denicord/network/ApiService.kt` dosyasında:
```kotlin
private const val BASE_URL = "https://denicord-backend.onrender.com/"
```

### iOS App  
`ios-ipad/DenicordIpad/ContentView.swift` dosyasında:
```swift
private let apiURL = "https://denicord-backend.onrender.com"
```

## 🔧 Manual Deployment (Alternatif)

### 1. Database Oluşturma
```bash
# Render Dashboard'da PostgreSQL database oluştur
Database Name: denicord_db
User: denicord_user
```

### 2. Backend Deploy
```bash
# Render Dashboard'da Web Service oluştur
Build Command: npm install
Start Command: npm start
Environment Variables:
- NODE_ENV=production
- PORT=10000
- DATABASE_URL=(auto-generated)
- JWT_SECRET=(generate random)
- CORS_ORIGIN=https://denicord-frontend.onrender.com
```

### 3. Frontend Deploy
```bash
# Render Dashboard'da Static Site oluştur
Build Command: npm install && npm run build:web
Publish Directory: dist
Environment Variables:
- VITE_API_URL=https://denicord-backend.onrender.com
- VITE_WS_URL=https://denicord-backend.onrender.com
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify DATABASE_URL is set correctly
   - Check database service is running

2. **CORS Error**
   - Verify CORS_ORIGIN matches frontend URL
   - Check both HTTP and HTTPS

3. **Build Failed**
   - Check logs in Render dashboard
   - Verify package.json scripts

4. **Socket.io Connection Failed**
   - Verify VITE_WS_URL is set correctly
   - Check WebSocket port configuration

### Health Check URLs:
- Backend: `https://denicord-backend.onrender.com/api/health`
- Frontend: `https://denicord-frontend.onrender.com`

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://denicord-frontend.onrender.com
```

### Frontend (Build time)
```env
VITE_API_URL=https://denicord-backend.onrender.com
VITE_WS_URL=https://denicord-backend.onrender.com
```

## 🔄 Updates

Repository'nizi güncelledikten sonra:
1. Render otomatik deploy yapar
2. Değişiklikler 2-5 dakika içinde yayınlanır
3. Mobile app'leri yeniden build etmeniz gerekebilir

## 💾 Database Schema

Database ilk çalıştığında otomatik olarak tablolar oluşturulur:
- users
- servers  
- channels
- messages
- server_members
- ve diğerleri...

## 📞 Support

Deployment sorunları için:
1. Render Dashboard logs'larını kontrol edin
2. Health check URL'lerini test edin
3. Environment variables'ları doğrulayın

---

**🎉 Tebrikler! Denicord artık canlı ve kullanıma hazır!**