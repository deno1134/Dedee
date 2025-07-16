# 🎮 Denicord - Discord Clone

Complete Discord clone with real-time messaging, voice/video calls, and cross-platform support.

## 🚀 Live Demo

- **Web App**: [denicord-frontend.onrender.com](https://denicord-frontend.onrender.com)
- **API**: [denicord-backend.onrender.com](https://denicord-backend.onrender.com)

## 📱 Platforms

- **🖥️ Desktop**: Electron app (Windows, macOS, Linux)
- **📱 Android**: Native Kotlin app
- **📱 iPad**: Native SwiftUI app
- **🌐 Web**: React web application

## ✨ Features

### 💬 Core Features
- Real-time messaging with Socket.io
- Server and channel management
- User authentication (JWT)
- File and image sharing
- Emoji support
- User profiles and status

### 🎵 Voice & Video
- Voice channels with WebRTC
- Video calling support
- Screen sharing
- Push-to-talk functionality

### 🔧 Technical Features
- Custom backend with PostgreSQL
- REST API + WebSocket
- Real-time notifications
- Cross-platform compatibility
- Responsive design

## 🛠️ Tech Stack

### Backend
- **Node.js** + Express.js
- **PostgreSQL** database
- **Socket.io** for real-time communication
- **JWT** authentication
- **WebRTC** for voice/video

### Frontend
- **React** + Vite
- **Styled Components**
- **Socket.io Client**
- **WebRTC** for calls

### Mobile
- **Android**: Kotlin + Compose
- **iOS**: SwiftUI
- **WebSocket** clients

### Desktop
- **Electron** wrapper
- **React** frontend
- **Native** integrations

## 📁 Project Structure

```
denicord/
├── server/                 # Node.js backend
│   ├── routes/            # API endpoints
│   ├── database/          # Database schema
│   └── server.js          # Main server
├── desktop/               # Electron app
│   ├── src/              # React frontend
│   ├── main.js           # Electron main
│   └── package.json      # Dependencies
├── app/                   # Android app
│   └── src/main/java/    # Kotlin source
├── ios-ipad/              # iOS app
│   └── DenicordIpad/     # SwiftUI source
├── render.yaml            # Deployment config
└── DEPLOYMENT.md          # Deployment guide
```

## 🚀 Quick Deploy (FREE)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/denicord)

### 1. Backend + Database (Blueprint)
1. Click "Deploy to Render" button above
2. Connect your GitHub repository
3. Deploy backend + PostgreSQL database (FREE)

### 2. Frontend (Static Site)
1. Go to Render Dashboard
2. Create "Static Site"
3. Set build command: `npm install && npm run build:web`
4. Set publish directory: `dist`

**Full guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🏃‍♂️ Local Development

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd desktop
npm install
npm run dev:web
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb denicord
psql denicord < server/database/schema.sql
```

### 4. Environment Variables
```env
# server/.env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost/denicord
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

## 📱 Mobile Development

### Android
```bash
cd app
./gradlew assembleDebug
```

### iOS
```bash
cd ios-ipad
xcodebuild -scheme DenicordIpad build
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Servers
- `GET /api/servers` - Get user servers
- `POST /api/servers` - Create server
- `GET /api/servers/:id` - Get server details

### Messages
- `GET /api/messages/:channelId` - Get messages
- `POST /api/messages` - Send message
- `WebSocket` - Real-time messaging

## 🎯 Production Features

### Performance
- **CDN**: Static assets cached
- **Compression**: Gzip/Brotli
- **Rate limiting**: API protection
- **Connection pooling**: Database optimization

### Security
- **JWT** authentication
- **CORS** protection
- **Helmet** security headers
- **Input validation**

### Monitoring
- **Health checks**: `/api/health`
- **Logging**: Morgan + Winston
- **Metrics**: Built-in Render monitoring

## 🔄 Updates & Maintenance

### Auto-Deploy
- Push to `main` branch = auto-deploy
- Zero-downtime deployments
- Rollback support

### Database Migrations
- Automatic schema updates
- Backup before migrations
- Version control

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Credits

- **WebRTC**: Voice/video calling
- **Socket.io**: Real-time communication
- **Render.com**: Free hosting
- **PostgreSQL**: Database

---

**Made with ❤️ by Denicord Team**

[⭐ Star this repo](https://github.com/YOUR_USERNAME/denicord) if you found it helpful!