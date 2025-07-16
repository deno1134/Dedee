# 🚀 Denicord Backend Kurulum Talimatları

## 📋 Gereksinimler

- **Node.js** v16 veya üzeri
- **PostgreSQL** v12 veya üzeri
- **npm** veya **yarn**
- **Git**

## 🔧 Kurulum Adımları

### 1. PostgreSQL Kurulumu

#### Windows
```bash
# PostgreSQL indirin ve yükleyin
https://www.postgresql.org/download/windows/

# psql ile bağlanın
psql -U postgres
```

#### macOS
```bash
# Homebrew ile yükleyin
brew install postgresql
brew services start postgresql

# Kullanıcı oluşturun
createuser -s postgres
```

#### Linux (Ubuntu/Debian)
```bash
# PostgreSQL yükleyin
sudo apt update
sudo apt install postgresql postgresql-contrib

# Kullanıcı değiştirin
sudo -u postgres psql
```

### 2. Veritabanı Oluşturma

```sql
-- PostgreSQL'e bağlanın
psql -U postgres

-- Veritabanı oluşturun
CREATE DATABASE denicord;

-- Kullanıcı oluşturun (isteğe bağlı)
CREATE USER denicord_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE denicord TO denicord_user;

-- Çıkış yapın
\q
```

### 3. Backend Kurulumu

```bash
# Projeyi klonlayın
git clone https://github.com/denicord/denicord.git
cd denicord

# Backend dizinine gidin
cd server

# Paketleri yükleyin
npm install

# Environment dosyasını oluşturun
cp .env.example .env
```

### 4. Environment Yapılandırması

`.env` dosyasını düzenleyin:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=denicord

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=*

# File Upload Configuration
MAX_FILE_SIZE=50MB
UPLOAD_DIR=uploads

# Optional: Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Denicord <noreply@denicord.com>
```

### 5. Veritabanı Şeması Oluşturma

```bash
# Veritabanına bağlanın
psql -U postgres -d denicord

# Şema dosyasını çalıştırın
\i database/schema.sql

# Veya terminal'den:
psql -U postgres -d denicord < database/schema.sql
```

### 6. Sunucuyu Başlatma

```bash
# Geliştirme modu
npm run dev

# Production modu
npm start
```

Sunucu `http://localhost:3000` adresinde çalışacak.

## 🧪 Test Etme

### API Endpoint Testi

```bash
# Sunucu durumu
curl http://localhost:3000/api/health

# Kullanıcı kaydı
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'

# Giriş yapma
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "password123"
  }'
```

### WebSocket Testi

```javascript
// Browser console'da test edin
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Kullanıcı bağlantısı
  socket.emit('user_connect', {
    id: 'user123',
    username: 'testuser',
    avatar: null
  });
});

socket.on('user_online', (data) => {
  console.log('User online:', data);
});
```

## 🔧 Sorun Giderme

### Database Bağlantı Hatası

```bash
# PostgreSQL çalışıyor mu?
sudo systemctl status postgresql

# Veritabanı var mı?
psql -U postgres -l

# Kullanıcı izinleri
psql -U postgres -c "SELECT usename, usecreatedb, usesuper FROM pg_user;"
```

### Port Kullanımda Hatası

```bash
# Portu kullanan process'i bulun
lsof -i :3000
netstat -tulpn | grep 3000

# Process'i sonlandırın
kill -9 PID
```

### JWT Token Hatası

```bash
# JWT secret'ın yeterli uzunlukta olduğundan emin olun (min 32 karakter)
# .env dosyasında JWT_SECRET'ı kontrol edin
```

## 📊 Performans Optimizasyonu

### 1. PostgreSQL Ayarları

```sql
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

### 2. Node.js Ayarları

```bash
# PM2 ile production'da çalıştırın
npm install -g pm2

# PM2 config dosyası (ecosystem.config.js)
module.exports = {
  apps: [{
    name: 'denicord-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

# PM2 ile başlatın
pm2 start ecosystem.config.js
```

### 3. Redis Cache (İsteğe Bağlı)

```bash
# Redis yükleyin
sudo apt install redis-server

# Redis config
# package.json'a redis ekleyin
npm install redis

# server.js'a redis cache ekleyin
const redis = require('redis');
const client = redis.createClient();
```

## 🛡️ Güvenlik

### 1. HTTPS Yapılandırması

```javascript
// server.js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('ssl/private.key'),
  cert: fs.readFileSync('ssl/certificate.crt')
};

const server = https.createServer(options, app);
```

### 2. Rate Limiting

```javascript
// npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // maksimum 100 istek
  message: 'Çok fazla istek gönderildi'
});

app.use('/api/', limiter);
```

### 3. Input Validation

```javascript
// Tüm route'larda express-validator kullanın
const { body, validationResult } = require('express-validator');

// Örnek validation
app.post('/api/auth/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('username').matches(/^[a-zA-Z0-9_]+$/)
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ...
});
```

## 📚 Ek Kaynaklar

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Socket.io Documentation](https://socket.io/docs/v4/)

## 🆘 Yardım

Sorun yaşıyorsanız:

1. **Log dosyalarını kontrol edin**
2. **Issue açın**: [GitHub Issues](https://github.com/denicord/denicord/issues)
3. **Discord'a katılın**: [Denicord Community](https://discord.gg/denicord)
4. **Email gönderin**: team@denicord.com

---

**Denicord Backend** - Modern Discord klonu server 🚀