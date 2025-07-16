# 🚀 Denicord - Modern Discord Klonu

Discord'un tüm özelliklerini içeren modern bir sohbet platformu. Cross-platform desteği ile Android, iOS (iPad), ve masaüstü uygulamaları.

## 🌟 Özellikler

### 💬 **Mesajlaşma**
- ✅ Gerçek zamanlı mesajlaşma
- ✅ Dosya paylaşımı
- ✅ Emoji ve tepki sistemi
- ✅ Mesaj düzenleme ve silme
- ✅ Mesaj arama
- ✅ Yazıyor göstergesi

### 🎤 **Ses ve Video**
- ✅ Sesli sohbet odaları
- ✅ Video arama
- ✅ Ekran paylaşımı
- ✅ Ses efektleri
- ✅ Müzik bot desteği

### 🏰 **Sunucular**
- ✅ Sunucu oluşturma ve yönetimi
- ✅ Kanal kategorileri
- ✅ Metin ve ses kanalları
- ✅ Özel kanallar
- ✅ Davet sistemi

### 👥 **Kullanıcı Yönetimi**
- ✅ Roller ve yetkiler
- ✅ Moderasyon araçları
- ✅ Kullanıcı profilleri
- ✅ Arkadaş sistemi
- ✅ Direkt mesajlaşma

### 🎨 **Arayüz**
- ✅ Modern ve responsive tasarım
- ✅ Koyu/açık tema desteği
- ✅ Özelleştirilebilir arayüz
- ✅ Bildirim sistemi

## 🏗️ Teknik Mimari

### 🔧 **Backend (Node.js)**
- **Express.js** - REST API
- **Socket.io** - Gerçek zamanlı iletişim
- **PostgreSQL** - Veritabanı
- **JWT** - Authentication
- **WebRTC** - Ses/video çağrıları
- **bcrypt** - Şifre hashleme
- **Multer** - Dosya upload

### 📱 **Android App (Kotlin)**
- **Jetpack Compose** - Modern UI
- **Retrofit** - HTTP Client
- **Room Database** - Offline cache
- **WebSocket** - Gerçek zamanlı bağlantı
- **WebRTC** - Ses/video desteği
- **Coil** - Görüntü yükleme
- **DataStore** - Ayarlar

### 🖥️ **Desktop App (Electron)**
- **React** - Frontend framework
- **Electron** - Cross-platform desktop
- **Socket.io Client** - WebSocket bağlantısı
- **Styled Components** - CSS-in-JS
- **Framer Motion** - Animasyonlar
- **Vite** - Build tool

### 🍎 **iPad App (Swift)**
- **SwiftUI** - Modern iOS UI
- **Combine** - Reactive programming
- **URLSession** - HTTP requests
- **WebRTC** - Ses/video çağrıları
- **CoreData** - Offline storage

## ⚡ Quick Start

### 🚀 **1-Click Deployment (Render.com)**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

#### Quick Steps:
1. **Fork** this repository
2. **Sign up** at [Render.com](https://render.com)
3. **Create PostgreSQL** database
4. **Deploy backend** (Node.js Web Service)
5. **Deploy frontend** (Static Site)
6. **Configure** environment variables
7. **Done!** Your app is live

📖 **Detailed Guide**: [QUICK_START.md](QUICK_START.md)

### 🗄️ **Database Setup**
```bash
# Create database
createdb denicord

# Deploy schema
psql $DATABASE_URL -f server/database/schema.sql
```

### 🌐 **Environment Variables**
```env
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:5432/denicord
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3000

# Frontend (.env)
VITE_API_URL=https://your-backend-url.onrender.com/api/
VITE_WS_URL=wss://your-backend-url.onrender.com
```

## 🚀 Kurulum

### Backend Server
```bash
cd server
npm install
cp .env.example .env
# .env dosyasını yapılandırın
npm start
```

### Android App
```bash
cd app
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

### Desktop App
```bash
cd desktop
npm install
npm run dev  # Geliştirme modu
npm run build  # Production build
```

### iPad App
```bash
cd ios-ipad
# Xcode ile DenicordIpad.xcodeproj'yi açın
# Build ve run
```

## 🌐 Production Deployment

### Render.com (Recommended)
- **Free tier** available
- **PostgreSQL** database included
- **Auto SSL** certificates
- **Global CDN**
- **Easy scaling**

📚 **Complete Guide**: [render-deploy/deployment-guide.md](render-deploy/deployment-guide.md)

### Alternative Platforms
- **Heroku** - PostgreSQL + Node.js
- **Vercel** - Frontend + Serverless API
- **Railway** - Full-stack deployment
- **DigitalOcean** - VPS deployment
- **AWS** - EC2 + RDS

## 🔧 Konfigürasyon

### Backend .env
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/denicord
DB_SSL=true

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-url.com
```

### Android Production
```kotlin
// app/src/main/java/com/denicord/network/ApiConfig.kt
const val PRODUCTION_API_URL = "https://your-backend-url.onrender.com/api/"
const val PRODUCTION_WS_URL = "wss://your-backend-url.onrender.com"
```

## 📱 Platform Desteği

| Platform | Durum | Deployment | Özellikler |
|----------|-------|------------|------------|
| 🌐 Web | ✅ Tamamlandı | Render.com | Full Discord features |
| 🤖 Android | ✅ Tamamlandı | GitHub Releases | APK distribution |
| 🖥️ Windows | ✅ Tamamlandı | Electron | Native app |
| 🍎 macOS | ✅ Tamamlandı | Electron | Native app |
| 🐧 Linux | ✅ Tamamlandı | Electron | AppImage |
| 📱 iPad | ✅ Tamamlandı | App Store | SwiftUI native |

## 🎯 API Endpoints

### Authentication
```
POST /api/auth/register    - Kayıt ol
POST /api/auth/login       - Giriş yap
POST /api/auth/logout      - Çıkış yap
GET  /api/auth/me          - Mevcut kullanıcı
PUT  /api/auth/profile     - Profil güncelle
```

### Servers
```
GET    /api/servers              - Sunucu listesi
POST   /api/servers              - Sunucu oluştur
GET    /api/servers/:id          - Sunucu detayı
PUT    /api/servers/:id          - Sunucu güncelle
DELETE /api/servers/:id          - Sunucu sil
POST   /api/servers/join/:code   - Sunucuya katıl
```

### Channels
```
GET    /api/channels/:serverId   - Kanal listesi
POST   /api/channels             - Kanal oluştur
PUT    /api/channels/:id         - Kanal güncelle
DELETE /api/channels/:id         - Kanal sil
```

### Messages
```
GET    /api/messages/:channelId  - Mesaj listesi
POST   /api/messages             - Mesaj gönder
PUT    /api/messages/:id         - Mesaj düzenle
DELETE /api/messages/:id         - Mesaj sil
```

### Health Check
```
GET    /api/health               - Server durumu
```

## 🔌 WebSocket Events

### Client → Server
```javascript
// Bağlantı
user_connect(userData)
join_channel(channelId)
leave_channel(channelId)

// Mesajlaşma
send_message(messageData)
typing_start(data)
typing_stop(data)

// Ses/Video
join_voice_channel(channelId)
leave_voice_channel(channelId)
webrtc_offer(data)
webrtc_answer(data)
```

### Server → Client
```javascript
// Kullanıcı durumu
user_online(userData)
user_offline(userData)

// Mesajlar
new_message(messageData)
user_typing(data)
user_stop_typing(data)

// Ses/Video
user_joined_voice(userData)
user_left_voice(userData)
webrtc_offer(data)
webrtc_answer(data)
```

## 📊 Live Demo

### 🌐 **Production URLs**
- **Web App**: https://denicord-frontend.onrender.com
- **API**: https://denicord-backend.onrender.com
- **API Health**: https://denicord-backend.onrender.com/api/health
- **Android APK**: [GitHub Releases](https://github.com/yourusername/denicord/releases)

### 📱 **Test Credentials**
```
Username: demo
Email: demo@denicord.com
Password: password123
```

## 🛡️ Güvenlik

- **JWT Authentication** - Güvenli oturum yönetimi
- **bcrypt** - Şifre hashleme
- **Helmet** - HTTP güvenlik başlıkları
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API hız sınırlaması
- **Input Validation** - Girdi doğrulama
- **SSL/TLS** - HTTPS encryption

## 📊 Performans

- **PostgreSQL** - Hızlı veritabanı sorguları
- **WebSocket** - Düşük gecikme mesajlaşma
- **Caching** - Redis ile önbellekleme
- **CDN** - Statik dosya dağıtımı
- **Compression** - Gzip sıkıştırma
- **Connection Pooling** - Database optimization

## 🎨 Tasarım

### Renk Paleti
```css
:root {
  --primary: #5865F2;      /* Discord Blue */
  --secondary: #7289DA;    /* Light Blue */
  --success: #3BA55C;      /* Green */
  --warning: #FAA61A;      /* Orange */
  --danger: #ED4245;       /* Red */
  --dark: #2F3136;         /* Dark Gray */
  --darker: #202225;       /* Darker Gray */
  --light: #36393F;        /* Light Gray */
}
```

### Tipografi
- **Başlık**: Whitney Bold
- **Metin**: Whitney Regular
- **Kod**: Consolas/Monaco

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 👥 Ekip

- **Backend Developer** - Node.js, PostgreSQL
- **Android Developer** - Kotlin, Jetpack Compose
- **Desktop Developer** - Electron, React
- **iOS Developer** - Swift, SwiftUI
- **UI/UX Designer** - Figma, Design System

## 🔗 Bağlantılar

- [Live Demo](https://denicord-frontend.onrender.com)
- [API Documentation](https://denicord-backend.onrender.com/api/health)
- [GitHub](https://github.com/yourusername/denicord)
- [Quick Start Guide](QUICK_START.md)
- [Deployment Guide](render-deploy/deployment-guide.md)
- [Backend Setup](BACKEND_SETUP.md)
- [GitHub Issues](https://github.com/yourusername/denicord/issues)
- [Community Server](https://discord.gg/denicord)
- [Twitter](https://twitter.com/denicord)

## 🎯 Roadmap

### v1.1 (Next Release)
- [ ] Mobile push notifications
- [ ] Dark/Light theme toggle
- [ ] Message reactions
- [ ] File drag & drop
- [ ] Voice activity detection

### v1.2 (Future)
- [ ] Screen sharing
- [ ] Message threads
- [ ] Custom emojis
- [ ] Bot API
- [ ] Slash commands

### v2.0 (Long Term)
- [ ] Video calls
- [ ] Server templates
- [ ] Advanced permissions
- [ ] Audit logs
- [ ] Analytics dashboard

---

**Denicord** - Modern Discord klonu 🚀 Made with ❤️ by Denicord Team

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/denicord?style=social)](https://github.com/yourusername/denicord)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/yourusername/denicord/releases)