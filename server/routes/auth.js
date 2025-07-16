const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'denicord',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// JWT token oluşturma
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Token doğrulama middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token gerekli'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token geçersiz'
    });
  }
};

// Kullanıcı kayıt
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Kullanıcı adı 3-50 karakter arasında olmalı')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Kullanıcı adı sadece harf, rakam ve _ içerebilir'),
  body('email')
    .isEmail()
    .withMessage('Geçerli bir email adresi girin'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalı'),
  body('displayName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Görünen ad en fazla 100 karakter olabilir')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors: errors.array()
      });
    }

    const { username, email, password, displayName } = req.body;

    // Kullanıcı adı ve email kontrolü
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      const existingUsername = existingUser.rows.find(u => u.username === username);
      const existingEmail = existingUser.rows.find(u => u.email === email);
      
      return res.status(400).json({
        success: false,
        message: existingUsername ? 'Bu kullanıcı adı zaten kullanılıyor' : 'Bu email zaten kullanılıyor'
      });
    }

    // Şifre hash'le
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Kullanıcı oluştur
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name, status, created_at) 
       VALUES ($1, $2, $3, $4, 'online', NOW()) 
       RETURNING id, username, email, display_name, avatar, status, created_at`,
      [username, email, passwordHash, displayName || username]
    );

    const user = result.rows[0];

    // JWT token oluştur
    const token = generateToken(user.id);

    // Session kaydet
    const sessionResult = await pool.query(
      `INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, user_agent, expires_at) 
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days') 
       RETURNING id`,
      [
        user.id,
        crypto.createHash('sha256').update(token).digest('hex'),
        req.headers['user-agent'] || 'Unknown',
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'] || 'Unknown'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatar: user.avatar,
          status: user.status,
          createdAt: user.created_at
        },
        token,
        sessionId: sessionResult.rows[0].id
      }
    });

  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Kullanıcı giriş
router.post('/login', [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Email veya kullanıcı adı gerekli'),
  body('password')
    .notEmpty()
    .withMessage('Şifre gerekli')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors: errors.array()
      });
    }

    const { emailOrUsername, password } = req.body;

    // Kullanıcı bul
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [emailOrUsername]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email/kullanıcı adı veya şifre hatalı'
      });
    }

    const user = result.rows[0];

    // Şifre kontrolü
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email/kullanıcı adı veya şifre hatalı'
      });
    }

    // Banned kontrolü
    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        message: 'Hesabınız yasaklanmış'
      });
    }

    // JWT token oluştur
    const token = generateToken(user.id);

    // Session kaydet
    const sessionResult = await pool.query(
      `INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, user_agent, expires_at) 
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days') 
       RETURNING id`,
      [
        user.id,
        crypto.createHash('sha256').update(token).digest('hex'),
        req.headers['user-agent'] || 'Unknown',
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'] || 'Unknown'
      ]
    );

    // Kullanıcı durumunu online yap
    await pool.query(
      'UPDATE users SET status = $1, last_seen = NOW() WHERE id = $2',
      ['online', user.id]
    );

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatar: user.avatar,
          status: 'online',
          bio: user.bio,
          customStatus: user.custom_status,
          isVerified: user.is_verified,
          createdAt: user.created_at
        },
        token,
        sessionId: sessionResult.rows[0].id
      }
    });

  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Kullanıcı çıkış
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Session'ı pasif yap
      await pool.query(
        'UPDATE user_sessions SET is_active = FALSE WHERE token_hash = $1',
        [tokenHash]
      );
    }

    // Kullanıcı durumunu offline yap
    await pool.query(
      'UPDATE users SET status = $1, last_seen = NOW() WHERE id = $2',
      ['offline', req.user.id]
    );

    res.json({
      success: true,
      message: 'Çıkış başarılı'
    });

  } catch (error) {
    console.error('Çıkış hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Mevcut kullanıcı bilgilerini getir
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatar: user.avatar,
          status: user.status,
          bio: user.bio,
          customStatus: user.custom_status,
          isVerified: user.is_verified,
          twoFactorEnabled: user.two_factor_enabled,
          locale: user.locale,
          createdAt: user.created_at
        }
      }
    });

  } catch (error) {
    console.error('Kullanıcı bilgisi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Kullanıcı profil güncelle
router.put('/profile', authenticateToken, [
  body('displayName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Görünen ad en fazla 100 karakter olabilir'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio en fazla 500 karakter olabilir'),
  body('customStatus')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Özel durum en fazla 100 karakter olabilir')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors: errors.array()
      });
    }

    const { displayName, bio, customStatus, avatar } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE users 
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           custom_status = COALESCE($3, custom_status),
           avatar = COALESCE($4, avatar),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, username, email, display_name, avatar, bio, custom_status, status, is_verified, created_at`,
      [displayName, bio, customStatus, avatar, userId]
    );

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Profil güncellendi',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatar: user.avatar,
          status: user.status,
          bio: user.bio,
          customStatus: user.custom_status,
          isVerified: user.is_verified,
          createdAt: user.created_at
        }
      }
    });

  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Kullanıcı durumu güncelle
router.put('/status', authenticateToken, [
  body('status')
    .isIn(['online', 'offline', 'away', 'busy', 'invisible'])
    .withMessage('Geçerli durum değeri girin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    const userId = req.user.id;

    await pool.query(
      'UPDATE users SET status = $1, last_seen = NOW() WHERE id = $2',
      [status, userId]
    );

    res.json({
      success: true,
      message: 'Durum güncellendi',
      data: { status }
    });

  } catch (error) {
    console.error('Durum güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Şifre değiştirme
router.put('/password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre gerekli'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yeni şifre en az 6 karakter olmalı')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Mevcut şifre kontrolü
    const passwordMatch = await bcrypt.compare(currentPassword, req.user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre hatalı'
      });
    }

    // Yeni şifre hash'le
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Şifre güncelle
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Tüm session'ları geçersiz kıl (güvenlik için)
    await pool.query(
      'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Şifre güncellendi. Lütfen tekrar giriş yapın.'
    });

  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Token doğrulama
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token geçerli',
    data: {
      userId: req.user.id,
      username: req.user.username
    }
  });
});

module.exports = { router, authenticateToken };