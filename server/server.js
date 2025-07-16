const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const fileRoutes = require('./routes/files');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Database connection - Updated for Render.com
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: process.env.DB_POOL_SIZE || 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ PostgreSQL bağlantısı başarılı'))
  .catch(err => console.error('❌ PostgreSQL bağlantı hatası:', err));

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint for Render.com
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Denicord API Server',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/health'
  });
});

// Socket.io connection handling
const connectedUsers = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log(`🔗 Yeni bağlantı: ${socket.id}`);

  // Kullanıcı giriş
  socket.on('user_connect', (userData) => {
    connectedUsers.set(socket.id, userData);
    userSockets.set(userData.id, socket.id);
    
    // Sunucudaki diğer kullanıcılara bildirim gönder
    socket.broadcast.emit('user_online', {
      userId: userData.id,
      username: userData.username,
      avatar: userData.avatar
    });
    
    console.log(`👤 Kullanıcı bağlandı: ${userData.username}`);
  });

  // Kanal katılma
  socket.on('join_channel', (channelId) => {
    socket.join(`channel_${channelId}`);
    console.log(`📢 Kanal ${channelId} katıldı`);
  });

  // Kanal ayrılma
  socket.on('leave_channel', (channelId) => {
    socket.leave(`channel_${channelId}`);
    console.log(`📤 Kanal ${channelId} ayrıldı`);
  });

  // Mesaj gönderme
  socket.on('send_message', async (messageData) => {
    try {
      // Mesajı veritabanına kaydet
      const result = await pool.query(
        'INSERT INTO messages (channel_id, user_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [messageData.channelId, messageData.userId, messageData.content]
      );
      
      const message = result.rows[0];
      
      // Tüm kanal üyelerine gönder
      io.to(`channel_${messageData.channelId}`).emit('new_message', {
        id: message.id,
        channelId: message.channel_id,
        content: message.content,
        user: messageData.user,
        timestamp: message.created_at
      });
      
      console.log(`💬 Mesaj: ${messageData.content}`);
    } catch (error) {
      console.error('Mesaj kaydetme hatası:', error);
      socket.emit('error', { message: 'Mesaj gönderilemedi' });
    }
  });

  // Yazıyor göstergesi
  socket.on('typing_start', (data) => {
    socket.to(`channel_${data.channelId}`).emit('user_typing', {
      userId: data.userId,
      username: data.username
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`channel_${data.channelId}`).emit('user_stop_typing', {
      userId: data.userId
    });
  });

  // Sesli sohbet
  socket.on('join_voice_channel', (voiceChannelId) => {
    socket.join(`voice_${voiceChannelId}`);
    socket.to(`voice_${voiceChannelId}`).emit('user_joined_voice', {
      userId: connectedUsers.get(socket.id)?.id,
      username: connectedUsers.get(socket.id)?.username
    });
  });

  socket.on('leave_voice_channel', (voiceChannelId) => {
    socket.leave(`voice_${voiceChannelId}`);
    socket.to(`voice_${voiceChannelId}`).emit('user_left_voice', {
      userId: connectedUsers.get(socket.id)?.id
    });
  });

  // WebRTC signaling
  socket.on('webrtc_offer', (data) => {
    socket.to(`voice_${data.channelId}`).emit('webrtc_offer', {
      offer: data.offer,
      userId: connectedUsers.get(socket.id)?.id
    });
  });

  socket.on('webrtc_answer', (data) => {
    socket.to(`voice_${data.channelId}`).emit('webrtc_answer', {
      answer: data.answer,
      userId: connectedUsers.get(socket.id)?.id
    });
  });

  socket.on('webrtc_ice_candidate', (data) => {
    socket.to(`voice_${data.channelId}`).emit('webrtc_ice_candidate', {
      candidate: data.candidate,
      userId: connectedUsers.get(socket.id)?.id
    });
  });

  // Bağlantı kesilme
  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    if (userData) {
      // Offline durumunu bildir
      socket.broadcast.emit('user_offline', {
        userId: userData.id
      });
      
      connectedUsers.delete(socket.id);
      userSockets.delete(userData.id);
      console.log(`👋 Kullanıcı ayrıldı: ${userData.username}`);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : 'İç sunucu hatası'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Sayfa bulunamadı'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Denicord server ${PORT} portunda çalışıyor`);
  console.log(`📡 Socket.io hazır`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, server, io };