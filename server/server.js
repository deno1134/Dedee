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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'denicord',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ PostgreSQL bağlantısı başarılı'))
  .catch(err => console.error('❌ PostgreSQL bağlantı hatası:', err));

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

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
  socket.on('send_message', (messageData) => {
    // Mesajı veritabanına kaydet
    io.to(`channel_${messageData.channelId}`).emit('new_message', messageData);
    console.log(`💬 Mesaj: ${messageData.content}`);
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Denicord server ${PORT} portunda çalışıyor`);
  console.log(`📡 Socket.io hazır`);
});

module.exports = { app, server, io };