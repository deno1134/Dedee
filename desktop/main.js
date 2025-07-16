const { app, BrowserWindow, ipcMain, Menu, shell, dialog, globalShortcut } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let splashWindow;

// Uygulama hazır olduğunda
app.whenReady().then(() => {
  createSplashWindow();
  setTimeout(() => {
    createMainWindow();
  }, 2000);
  
  // Menü oluştur
  createMenu();
  
  // Global kısayollar
  registerGlobalShortcuts();
});

// Splash screen oluştur
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    show: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Splash screen HTML
  const splashHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(45deg, #5865F2, #7289DA);
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: 'Arial', sans-serif;
          color: white;
        }
        .splash-container {
          text-align: center;
        }
        .logo {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 20px;
          animation: pulse 2s infinite;
        }
        .loading {
          font-size: 16px;
          opacity: 0.8;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      </style>
    </head>
    <body>
      <div class="splash-container">
        <div class="logo">Denicord</div>
        <div class="loading">Yükleniyor...</div>
      </div>
    </body>
    </html>
  `;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`);
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });
}

// Ana pencere oluştur
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // Uygulama URL'sini yükle
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Geliştirme modunda DevTools aç
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
  });

  // Pencere kapatıldığında
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Yeni pencere açma isteklerini varsayılan tarayıcıda aç
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Menü oluştur
function createMenu() {
  const template = [
    {
      label: 'Denicord',
      submenu: [
        {
          label: 'Hakkında',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Denicord Hakkında',
              message: 'Denicord v1.0.0',
              detail: 'Discord benzeri modern sohbet uygulaması'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Ayarlar',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Çıkış',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Düzenle',
      submenu: [
        { label: 'Geri Al', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Yinele', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Kes', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Kopyala', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Yapıştır', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Tümünü Seç', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
      ]
    },
    {
      label: 'Görünüm',
      submenu: [
        { label: 'Yenile', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Zorla Yenile', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Geliştirici Araçları', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Tam Ekran', accelerator: 'F11', role: 'togglefullscreen' },
        { label: 'Yakınlaştır', accelerator: 'CmdOrCtrl+Plus', role: 'zoomin' },
        { label: 'Uzaklaştır', accelerator: 'CmdOrCtrl+-', role: 'zoomout' },
        { label: 'Gerçek Boyut', accelerator: 'CmdOrCtrl+0', role: 'resetzoom' }
      ]
    },
    {
      label: 'Pencere',
      submenu: [
        { label: 'Küçült', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Kapat', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: 'Yardım',
      submenu: [
        {
          label: 'GitHub',
          click: () => {
            shell.openExternal('https://github.com/denicord/denicord');
          }
        },
        {
          label: 'Hata Bildir',
          click: () => {
            shell.openExternal('https://github.com/denicord/denicord/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Global kısayollar
function registerGlobalShortcuts() {
  // Mikrofon kapatma/açma
  globalShortcut.register('CmdOrCtrl+Shift+M', () => {
    mainWindow.webContents.send('toggle-microphone');
  });

  // Ses kapatma/açma
  globalShortcut.register('CmdOrCtrl+Shift+D', () => {
    mainWindow.webContents.send('toggle-deafen');
  });

  // Hızlı sunucu değiştirme
  for (let i = 1; i <= 9; i++) {
    globalShortcut.register(`CmdOrCtrl+${i}`, () => {
      mainWindow.webContents.send('switch-server', i);
    });
  }
}

// IPC Event Handlers
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('close-window', () => {
  mainWindow.close();
});

ipcMain.handle('set-badge-count', (event, count) => {
  app.setBadgeCount(count);
});

// Tüm pencereler kapatıldığında
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Uygulama aktif olduğunda
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Uygulama kapanmadan önce
app.on('before-quit', () => {
  // Global kısayolları temizle
  globalShortcut.unregisterAll();
});

// Güvenlik: Sadece güvenli URL'lere izin ver
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (url !== contents.getURL()) {
      event.preventDefault();
    }
  });
});

// Notification permissions
ipcMain.handle('request-notification-permission', async () => {
  return true; // Electron'da notification izni her zaman verilir
});

// File system access
ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  const fs = require('fs').promises;
  try {
    await fs.writeFile(filePath, data, 'utf8');
    return true;
  } catch (error) {
    throw error;
  }
});

// Auto-updater (gelecekte eklenebilir)
// const { autoUpdater } = require('electron-updater');
// autoUpdater.checkForUpdatesAndNotify();