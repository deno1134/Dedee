# 🗄️ Render.com PostgreSQL Deployment

## 1. Database Oluşturma

### Render Dashboard'dan:
1. **New** → **PostgreSQL** seçin
2. **Database Name**: `denicord`
3. **Database User**: `denicord_user` 
4. **Region**: `Frankfurt (EU)` (Türkiye'ye en yakın)
5. **Plan**: `Free` (development için)
6. **Create Database** tıklayın

### Database Bilgilerini Kaydedin:
```
Database: denicord
Username: denicord_user
Password: [render tarafından oluşturulacak]
Host: [render hostname]
Port: 5432
```

## 2. Schema Deployment

### Render Shell'den:
```bash
# Render dashboard'dan database'e bağlanın
# "Connect" → "External Connection" → "Command"

# Schema'yı deploy edin
psql $DATABASE_URL < database/schema.sql

# Veya manuel olarak:
psql $DATABASE_URL
\i database/schema.sql
```

### Local'dan Remote'a Bağlanma:
```bash
# Connection string'i .env'den alın
export DATABASE_URL="postgresql://username:password@hostname:5432/database"

# Schema'yı yükleyin
psql $DATABASE_URL -f server/database/schema.sql
```

## 3. Database Ayarları

### Environment Variables:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
DB_SSL=true
DB_POOL_SIZE=5
DB_CONNECTION_TIMEOUT=30000
```

### Connection Pool Ayarları:
```javascript
// server/database/connection.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: process.env.DB_POOL_SIZE || 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

module.exports = pool;
```

## 4. Migration Scripts

### Package.json'a ekleyin:
```json
{
  "scripts": {
    "db:migrate": "psql $DATABASE_URL -f database/schema.sql",
    "db:seed": "psql $DATABASE_URL -f database/seed.sql"
  }
}
```

### Seed Data (İsteğe Bağlı):
```sql
-- database/seed.sql
INSERT INTO users (username, email, password_hash, display_name, status) VALUES
('admin', 'admin@denicord.com', '$2b$12$dummy', 'Admin', 'online'),
('demo', 'demo@denicord.com', '$2b$12$dummy', 'Demo User', 'online');

INSERT INTO servers (name, description, owner_id, invite_code, is_public) VALUES
('Welcome Server', 'Hoş geldin sunucusu', (SELECT id FROM users WHERE username = 'admin'), 'WELCOME', true);
```