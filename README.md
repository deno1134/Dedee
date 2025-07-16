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

## 🚀 Kurulum

### Backend Server
```bash
cd server
npm install
cp .env.example .env
# .env dosyasını yapılandırın
npm start
```

### PostgreSQL Veritabanı
```bash
# PostgreSQL yükleyin
createdb denicord
psql denicord < database/schema.sql
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

## 🔧 Konfigürasyon

### Backend .env
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=denicord

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

### Android IP Adresi
```kotlin
// AuthRepository.kt
private val retrofit = Retrofit.Builder()
    .baseUrl("http://YOUR_IP:3000/api/")  // IP adresini değiştirin
    .build()
```

## 📱 Platform Desteği

| Platform | Durum | Özellikler |
|----------|-------|------------|
| 🤖 Android | ✅ Tamamlandı | Tam özellik desteği |
| 🖥️ Windows | ✅ Tamamlandı | Electron-based |
| 🍎 macOS | ✅ Tamamlandı | Native look & feel |
| 🐧 Linux | ✅ Tamamlandı | AppImage format |
| 📱 iPad | ✅ Tamamlandı | SwiftUI native |

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

## 🛡️ Güvenlik

- **JWT Authentication** - Güvenli oturum yönetimi
- **bcrypt** - Şifre hashleme
- **Helmet** - HTTP güvenlik başlıkları
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API hız sınırlaması
- **Input Validation** - Girdi doğrulama

## 📊 Performans

- **PostgreSQL** - Hızlı veritabanı sorguları
- **WebSocket** - Düşük gecikme mesajlaşma
- **Caching** - Redis ile önbellekleme
- **CDN** - Statik dosya dağıtımı
- **Compression** - Gzip sıkıştırma

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

- [Live Demo](https://denicord.com)
- [Documentation](https://docs.denicord.com)
- [API Reference](https://api.denicord.com/docs)
- [GitHub](https://github.com/denicord/denicord)

## 📞 İletişim

- **Email**: team@denicord.com
- **Discord**: [Denicord Community](https://discord.gg/denicord)
- **Twitter**: [@denicord](https://twitter.com/denicord)

---

**Denicord** - Modern Discord klonu 🚀 Made with ❤️ by Denicord Team