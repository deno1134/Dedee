const { contextBridge, ipcRenderer } = require('electron');

// Güvenli IPC API'sini renderer process'e açığa çıkar
contextBridge.exposeInMainWorld('electronAPI', {
  // Uygulama bilgileri
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Dialog işlemleri
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Pencere kontrolleri
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Notification badge
  setBadgeCount: (count) => ipcRenderer.invoke('set-badge-count', count),
  
  // Notification izni
  requestNotificationPermission: () => ipcRenderer.invoke('request-notification-permission'),
  
  // Dosya sistemi
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  
  // Event listeners
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onToggleMicrophone: (callback) => ipcRenderer.on('toggle-microphone', callback),
  onToggleDeafen: (callback) => ipcRenderer.on('toggle-deafen', callback),
  onSwitchServer: (callback) => ipcRenderer.on('switch-server', callback),
  
  // Event listener temizleme
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform bilgisi
  platform: process.platform,
  isElectron: true
});

// Bildirim API'sini düzenle
contextBridge.exposeInMainWorld('notification', {
  show: (title, options = {}) => {
    return new Promise((resolve, reject) => {
      try {
        const notification = new Notification(title, options);
        notification.onclick = () => resolve('clicked');
        notification.onclose = () => resolve('closed');
        notification.onerror = (error) => reject(error);
        resolve(notification);
      } catch (error) {
        reject(error);
      }
    });
  }
});

// Sistem bilgilerini açığa çıkar
contextBridge.exposeInMainWorld('system', {
  os: {
    platform: process.platform,
    arch: process.arch,
    version: process.getSystemVersion()
  },
  node: {
    version: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Güvenlik: Sadece belirlenen event'lere izin ver
const validChannels = [
  'open-settings',
  'toggle-microphone',
  'toggle-deafen',
  'switch-server'
];

// Event listener wrapper
const safeEventListener = (channel, callback) => {
  if (validChannels.includes(channel)) {
    ipcRenderer.on(channel, callback);
  } else {
    console.warn(`Geçersiz kanal: ${channel}`);
  }
};

// Console bilgilerini göster
console.log('Denicord Desktop - Preload Script Loaded');
console.log('Electron Version:', process.versions.electron);
console.log('Node Version:', process.versions.node);
console.log('Chrome Version:', process.versions.chrome);
console.log('Platform:', process.platform);

// Hata yakalama
process.on('uncaughtException', (error) => {
  console.error('Yakalanmamış Hata:', error);
});

window.addEventListener('error', (event) => {
  console.error('Window Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Yakalanmamış Promise Reddi:', event.reason);
});

// Performans monitoring
window.addEventListener('load', () => {
  console.log('Window Load Time:', performance.now(), 'ms');
});

// Memory usage monitoring (geliştirme modunda)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log('Memory Usage:', {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
    });
  }, 30000); // Her 30 saniyede bir
}