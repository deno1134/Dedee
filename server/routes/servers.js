const express = require('express');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('./auth');
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

// Kullanıcının sunucularını getir
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        s.*,
        sm.nickname,
        sm.is_owner,
        sm.is_admin,
        sm.is_moderator,
        sm.joined_at
      FROM servers s
      JOIN server_members sm ON s.id = sm.server_id
      WHERE sm.user_id = $1
      ORDER BY sm.joined_at ASC
    `, [userId]);

    res.json({
      success: true,
      data: {
        servers: result.rows.map(server => ({
          id: server.id,
          name: server.name,
          description: server.description,
          icon: server.icon,
          banner: server.banner,
          ownerId: server.owner_id,
          inviteCode: server.invite_code,
          memberCount: server.member_count,
          verificationLevel: server.verification_level,
          isPublic: server.is_public,
          userRole: {
            nickname: server.nickname,
            isOwner: server.is_owner,
            isAdmin: server.is_admin,
            isModerator: server.is_moderator,
            joinedAt: server.joined_at
          },
          createdAt: server.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Sunucular getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Yeni sunucu oluştur
router.post('/', authenticateToken, [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Sunucu adı 1-100 karakter arasında olmalı'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Açıklama en fazla 500 karakter olabilir'),
  body('icon')
    .optional()
    .isURL()
    .withMessage('İkon geçerli bir URL olmalı'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic boolean değer olmalı')
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

    const { name, description, icon, isPublic = true } = req.body;
    const userId = req.user.id;

    // Davet kodu oluştur
    const inviteCode = crypto.randomBytes(5).toString('hex').toUpperCase();

    // Sunucu oluştur
    const serverResult = await pool.query(`
      INSERT INTO servers (name, description, icon, owner_id, invite_code, is_public, member_count)
      VALUES ($1, $2, $3, $4, $5, $6, 1)
      RETURNING *
    `, [name, description, icon, userId, inviteCode, isPublic]);

    const server = serverResult.rows[0];

    // Sunucu sahibini üye olarak ekle
    await pool.query(`
      INSERT INTO server_members (server_id, user_id, is_owner, is_admin, joined_at)
      VALUES ($1, $2, true, true, NOW())
    `, [server.id, userId]);

    // Varsayılan kanalları oluştur
    const defaultChannels = [
      { name: 'genel', type: 0, description: 'Genel sohbet kanalı' },
      { name: 'rastgele', type: 0, description: 'Rastgele konuşmalar' },
      { name: 'Genel', type: 1, description: 'Genel sesli sohbet' }
    ];

    const channelResults = await Promise.all(
      defaultChannels.map(async (channel, index) => {
        const result = await pool.query(`
          INSERT INTO channels (server_id, name, description, type, position)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [server.id, channel.name, channel.description, channel.type, index]);
        return result.rows[0];
      })
    );

    // Varsayılan rolleri oluştur
    const defaultRoles = [
      { name: '@everyone', position: 0, permissions: 104324161 }, // Temel izinler
      { name: 'Moderator', position: 1, permissions: 8 }, // Yönetici izinleri
    ];

    const roleResults = await Promise.all(
      defaultRoles.map(async (role, index) => {
        const result = await pool.query(`
          INSERT INTO roles (server_id, name, position, permissions)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [server.id, role.name, role.position, role.permissions]);
        return result.rows[0];
      })
    );

    // Audit log kaydı
    await pool.query(`
      INSERT INTO audit_logs (server_id, user_id, action_type, target_id, target_type, reason)
      VALUES ($1, $2, 'SERVER_CREATE', $3, 'SERVER', 'Sunucu oluşturuldu')
    `, [server.id, userId, server.id]);

    res.status(201).json({
      success: true,
      message: 'Sunucu başarıyla oluşturuldu',
      data: {
        server: {
          id: server.id,
          name: server.name,
          description: server.description,
          icon: server.icon,
          banner: server.banner,
          ownerId: server.owner_id,
          inviteCode: server.invite_code,
          memberCount: server.member_count,
          verificationLevel: server.verification_level,
          isPublic: server.is_public,
          createdAt: server.created_at
        },
        channels: channelResults.map(channel => ({
          id: channel.id,
          name: channel.name,
          description: channel.description,
          type: channel.type,
          position: channel.position
        })),
        roles: roleResults.map(role => ({
          id: role.id,
          name: role.name,
          position: role.position,
          permissions: role.permissions
        }))
      }
    });

  } catch (error) {
    console.error('Sunucu oluşturma hatası:', error);
    if (error.constraint === 'servers_invite_code_key') {
      return res.status(400).json({
        success: false,
        message: 'Davet kodu zaten kullanılıyor'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Sunucu detayları getir
router.get('/:serverId', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.user.id;

    // Kullanıcının sunucuda üye olup olmadığını kontrol et
    const memberCheck = await pool.query(`
      SELECT * FROM server_members 
      WHERE server_id = $1 AND user_id = $2
    `, [serverId, userId]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bu sunucuya erişim yetkiniz yok'
      });
    }

    const member = memberCheck.rows[0];

    // Sunucu bilgilerini getir
    const serverResult = await pool.query(`
      SELECT * FROM servers WHERE id = $1
    `, [serverId]);

    if (serverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sunucu bulunamadı'
      });
    }

    const server = serverResult.rows[0];

    // Kanalları getir
    const channelsResult = await pool.query(`
      SELECT c.*, cc.name as category_name
      FROM channels c
      LEFT JOIN channel_categories cc ON c.category_id = cc.id
      WHERE c.server_id = $1
      ORDER BY c.position ASC
    `, [serverId]);

    // Rolleri getir
    const rolesResult = await pool.query(`
      SELECT * FROM roles
      WHERE server_id = $1
      ORDER BY position DESC
    `, [serverId]);

    // Üyeleri getir (sadece aktif olanlar)
    const membersResult = await pool.query(`
      SELECT 
        sm.*,
        u.username,
        u.display_name,
        u.avatar,
        u.status,
        u.custom_status
      FROM server_members sm
      JOIN users u ON sm.user_id = u.id
      WHERE sm.server_id = $1
      ORDER BY sm.joined_at ASC
    `, [serverId]);

    res.json({
      success: true,
      data: {
        server: {
          id: server.id,
          name: server.name,
          description: server.description,
          icon: server.icon,
          banner: server.banner,
          ownerId: server.owner_id,
          inviteCode: server.invite_code,
          memberCount: server.member_count,
          verificationLevel: server.verification_level,
          isPublic: server.is_public,
          createdAt: server.created_at
        },
        userMembership: {
          nickname: member.nickname,
          isOwner: member.is_owner,
          isAdmin: member.is_admin,
          isModerator: member.is_moderator,
          joinedAt: member.joined_at
        },
        channels: channelsResult.rows.map(channel => ({
          id: channel.id,
          name: channel.name,
          description: channel.description,
          type: channel.type,
          position: channel.position,
          categoryName: channel.category_name,
          categoryId: channel.category_id,
          isPrivate: channel.is_private,
          isNsfw: channel.is_nsfw,
          topic: channel.topic,
          bitrate: channel.bitrate,
          userLimit: channel.user_limit,
          rateLimitPerUser: channel.rate_limit_per_user
        })),
        roles: rolesResult.rows.map(role => ({
          id: role.id,
          name: role.name,
          color: role.color,
          position: role.position,
          permissions: role.permissions,
          isHoisted: role.is_hoisted,
          isMentionable: role.is_mentionable,
          isManaged: role.is_managed
        })),
        members: membersResult.rows.map(member => ({
          id: member.id,
          userId: member.user_id,
          username: member.username,
          displayName: member.display_name,
          nickname: member.nickname,
          avatar: member.avatar,
          status: member.status,
          customStatus: member.custom_status,
          isOwner: member.is_owner,
          isAdmin: member.is_admin,
          isModerator: member.is_moderator,
          joinedAt: member.joined_at
        }))
      }
    });

  } catch (error) {
    console.error('Sunucu detayları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Sunucu güncelle
router.put('/:serverId', authenticateToken, [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Sunucu adı 1-100 karakter arasında olmalı'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Açıklama en fazla 500 karakter olabilir'),
  body('icon')
    .optional()
    .isURL()
    .withMessage('İkon geçerli bir URL olmalı'),
  body('banner')
    .optional()
    .isURL()
    .withMessage('Banner geçerli bir URL olmalı'),
  body('verificationLevel')
    .optional()
    .isInt({ min: 0, max: 4 })
    .withMessage('Doğrulama seviyesi 0-4 arasında olmalı'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic boolean değer olmalı')
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

    const { serverId } = req.params;
    const userId = req.user.id;
    const { name, description, icon, banner, verificationLevel, isPublic } = req.body;

    // Kullanıcının admin yetkisi var mı kontrol et
    const adminCheck = await pool.query(`
      SELECT * FROM server_members 
      WHERE server_id = $1 AND user_id = $2 AND (is_owner = true OR is_admin = true)
    `, [serverId, userId]);

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    // Sunucu güncelle
    const updateResult = await pool.query(`
      UPDATE servers 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          icon = COALESCE($3, icon),
          banner = COALESCE($4, banner),
          verification_level = COALESCE($5, verification_level),
          is_public = COALESCE($6, is_public),
          updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [name, description, icon, banner, verificationLevel, isPublic, serverId]);

    const server = updateResult.rows[0];

    // Audit log kaydı
    await pool.query(`
      INSERT INTO audit_logs (server_id, user_id, action_type, target_id, target_type, reason)
      VALUES ($1, $2, 'SERVER_UPDATE', $3, 'SERVER', 'Sunucu güncellendi')
    `, [serverId, userId, serverId]);

    res.json({
      success: true,
      message: 'Sunucu başarıyla güncellendi',
      data: {
        server: {
          id: server.id,
          name: server.name,
          description: server.description,
          icon: server.icon,
          banner: server.banner,
          ownerId: server.owner_id,
          inviteCode: server.invite_code,
          memberCount: server.member_count,
          verificationLevel: server.verification_level,
          isPublic: server.is_public,
          createdAt: server.created_at,
          updatedAt: server.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Sunucu güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Sunucu sil
router.delete('/:serverId', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.user.id;

    // Kullanıcının owner olup olmadığını kontrol et
    const ownerCheck = await pool.query(`
      SELECT * FROM server_members 
      WHERE server_id = $1 AND user_id = $2 AND is_owner = true
    `, [serverId, userId]);

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Sadece sunucu sahibi sunucuyu silebilir'
      });
    }

    // Sunucu sil (CASCADE ile tüm bağlantılı veriler silinir)
    await pool.query('DELETE FROM servers WHERE id = $1', [serverId]);

    res.json({
      success: true,
      message: 'Sunucu başarıyla silindi'
    });

  } catch (error) {
    console.error('Sunucu silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Davet kodu ile sunucuya katıl
router.post('/join/:inviteCode', authenticateToken, async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const userId = req.user.id;

    // Davet kodunu doğrula
    const serverResult = await pool.query(`
      SELECT * FROM servers WHERE invite_code = $1
    `, [inviteCode]);

    if (serverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Geçersiz davet kodu'
      });
    }

    const server = serverResult.rows[0];

    // Kullanıcı zaten üye mi kontrol et
    const memberCheck = await pool.query(`
      SELECT * FROM server_members 
      WHERE server_id = $1 AND user_id = $2
    `, [server.id, userId]);

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Zaten bu sunucunun üyesisiniz'
      });
    }

    // Sunucuya katıl
    await pool.query(`
      INSERT INTO server_members (server_id, user_id, joined_at)
      VALUES ($1, $2, NOW())
    `, [server.id, userId]);

    // Audit log kaydı
    await pool.query(`
      INSERT INTO audit_logs (server_id, user_id, action_type, target_id, target_type, reason)
      VALUES ($1, $2, 'MEMBER_JOIN', $3, 'USER', 'Davet kodu ile katıldı')
    `, [server.id, userId, userId]);

    res.json({
      success: true,
      message: 'Sunucuya başarıyla katıldınız',
      data: {
        server: {
          id: server.id,
          name: server.name,
          description: server.description,
          icon: server.icon,
          memberCount: server.member_count
        }
      }
    });

  } catch (error) {
    console.error('Sunucuya katılma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Sunucudan ayrıl
router.delete('/:serverId/leave', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.user.id;

    // Owner kontrolü
    const ownerCheck = await pool.query(`
      SELECT * FROM server_members 
      WHERE server_id = $1 AND user_id = $2 AND is_owner = true
    `, [serverId, userId]);

    if (ownerCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Sunucu sahibi sunucudan ayrılamaz. Önce sahipliği devretmelisiniz.'
      });
    }

    // Üyelikten çıkar
    const deleteResult = await pool.query(`
      DELETE FROM server_members 
      WHERE server_id = $1 AND user_id = $2
    `, [serverId, userId]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bu sunucunun üyesi değilsiniz'
      });
    }

    // Audit log kaydı
    await pool.query(`
      INSERT INTO audit_logs (server_id, user_id, action_type, target_id, target_type, reason)
      VALUES ($1, $2, 'MEMBER_LEAVE', $3, 'USER', 'Sunucudan ayrıldı')
    `, [serverId, userId, userId]);

    res.json({
      success: true,
      message: 'Sunucudan başarıyla ayrıldınız'
    });

  } catch (error) {
    console.error('Sunucudan ayrılma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;