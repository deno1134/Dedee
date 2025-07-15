# Denicord - Profil Sistemi

## 🎯 Özellikler

### 👤 **Kullanıcı Profili**
- ✅ Kullanıcı adı görüntüleme ve düzenleme
- ✅ E-posta adres görüntüleme (düzenlenemez)
- ✅ Profil resmi yükleme ve değiştirme
- ✅ Son görülme tarih/saat bilgisi
- ✅ Profil bilgileri Firestore'da saklanır

### 🖼️ **Profil Resmi**
- ✅ Firebase Storage entegrasyonu
- ✅ Galeri'den resim seçme
- ✅ Otomatik resize ve optimize
- ✅ Yükleme progress indicator
- ✅ Varsayılan profil ikonu

### 💾 **Veri Yönetimi**
- ✅ Firestore Database kullanımı
- ✅ Firebase Storage kullanımı
- ✅ Otomatik kullanıcı kaydı
- ✅ Gerçek zamanlı veri senkronizasyonu
- ✅ Offline cache desteği

### 🎨 **Kullanıcı Arayüzü**
- ✅ Material 3 Design
- ✅ Responsive tasarım
- ✅ Loading states
- ✅ Error handling
- ✅ Success/Error mesajları

## 📱 **Ekran Görüntüleri ve Kullanım**

### 1. **Profil Ekranı**
- **Profil Resmi**: Dairesel görüntü + kamera butonu
- **Kullanıcı Bilgileri**: Ad, e-posta, son görülme
- **Düzenleme**: Ad için düzenle butonu
- **Yenile**: Profil bilgilerini yenile butonu

### 2. **Resim Yükleme**
- **Kamera Butonu**: Profil resminin üzerinde
- **Galeri Seçici**: Sistemin galeri picker'ı
- **Yükleme**: Firebase Storage'a otomatik yükleme
- **Progress**: Yükleme sırasında loading indicator

### 3. **Profil Düzenleme**
- **Dialog**: Ad düzenleme için popup
- **Validation**: Boş alan kontrolü
- **Kaydetme**: Firestore'a otomatik kayıt
- **Feedback**: Başarı/hata mesajları

## 🏗️ **Teknik Yapı**

### **Veri Modeli**
```kotlin
data class User(
    val uid: String = "",
    val email: String = "",
    val displayName: String = "",
    val profileImageUrl: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val lastSeen: Long = System.currentTimeMillis()
)
```

### **Firebase Konfigürasyonu**
```
Firebase Authentication → Kullanıcı kimlik doğrulama
Firebase Firestore → Kullanıcı profil bilgileri
Firebase Storage → Profil resimleri
```

### **Firestore Koleksiyonu**
```
users/
├── {userId}/
│   ├── uid: String
│   ├── email: String
│   ├── displayName: String
│   ├── profileImageUrl: String
│   ├── createdAt: Long
│   └── lastSeen: Long
```

### **Storage Yapısı**
```
profile_images/
├── {userId}_{randomUUID}
├── {userId}_{randomUUID}
└── ...
```

## 🛠️ **Mimari Bileşenler**

### **UserRepository**
```kotlin
- getCurrentUser(): Mevcut kullanıcı bilgilerini getir
- createUser(user): Yeni kullanıcı oluştur
- updateUser(user): Kullanıcı bilgilerini güncelle
- uploadProfileImage(uri): Profil resmi yükle
- getUserById(userId): ID'ye göre kullanıcı getir
- updateLastSeen(): Son görülme zamanını güncelle
```

### **ProfileViewModel**
```kotlin
- user: State<User?> - Kullanıcı bilgileri
- isLoading: State<Boolean> - Yükleme durumu
- isUpdating: State<Boolean> - Güncelleme durumu
- isUploadingImage: State<Boolean> - Resim yükleme durumu
- errorMessage: State<String?> - Hata mesajı
- successMessage: State<String?> - Başarı mesajı
```

### **ProfileScreen**
```kotlin
- Profil resmi (AsyncImage + Coil)
- Kullanıcı bilgi kartları
- Düzenleme dialog'u
- Hata/başarı mesajları
- Image picker launcher
```

## 🚀 **Kurulum ve Yapılandırma**

### **1. Firebase Ayarları**
```bash
# Firebase Console'da projeyi oluşturun
# Authentication > Email/Password aktif edin
# Firestore Database oluşturun
# Storage bucket oluşturun
```

### **2. Firestore Güvenlik Kuralları**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **3. Storage Güvenlik Kuralları**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_images/{userId}_{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **4. Android Permissions**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

## 📁 **Dosya Yapısı**
```
app/src/main/java/com/denicord/
├── data/
│   └── User.kt                 # Kullanıcı veri modeli
├── profile/
│   ├── UserRepository.kt       # Firestore/Storage operations
│   └── ProfileViewModel.kt     # Profil state yönetimi
├── screens/
│   └── ProfileScreen.kt        # Profil UI ekranı
└── MainActivity.kt             # Navigation routing
```

## 🔧 **Kullanım Kılavuzu**

### **1. Profil Ekranına Gitme**
1. Ana sayfada sol menüyü açın (hamburger menü)
2. "Profil" butonuna tıklayın
3. Profil ekranı açılır

### **2. Profil Resmi Değiştirme**
1. Profil resminin üzerindeki kamera butonuna tıklayın
2. Galeri'den resim seçin
3. Resim otomatik olarak yüklenir ve güncellenir

### **3. Ad Değiştirme**
1. "Ad" kartının yanındaki düzenle butonuna tıklayın
2. Yeni adınızı girin
3. "Kaydet" butonuna tıklayın

### **4. Profil Bilgilerini Yenileme**
1. Sağ üst köşedeki yenile butonuna tıklayın
2. Profil bilgileri Firebase'den tekrar yüklenir

## ⚡ **Performans Optimizasyonları**

### **Image Loading**
- Coil library ile optimize edilmiş resim yükleme
- Crossfade animasyonu
- Placeholder ve error handling
- Memory cache

### **Firebase Optimizasyonu**
- Offline cache aktif
- Batch operations
- Minimum network calls
- Error retry mechanisms

## 🔐 **Güvenlik**

### **Authentication**
- Firebase Authentication ile doğrulama
- JWT token validation
- Session management

### **Data Security**
- Firestore güvenlik kuralları
- Storage güvenlik kuralları
- User ID validation
- Data encryption

## 🐛 **Hata Yönetimi**

### **Yaygın Hatalar**
```kotlin
// Network hataları
"Kullanıcı bilgileri yüklenemedi"

// Storage hataları
"Profil resmi yüklenemedi"

// Validation hataları
"Ad boş olamaz"

// Permission hataları
"Galeri erişim izni gerekli"
```

### **Çözüm Önerileri**
1. Internet bağlantısını kontrol edin
2. Firebase Console'da proje ayarlarını kontrol edin
3. Google-services.json dosyasının güncel olduğundan emin olun
4. Uygulama izinlerini kontrol edin

## 🎯 **Gelecek Özellikler**

### **v2.0 Planları**
- [ ] Profil resmi kırpma/düzenleme
- [ ] Biyografi/hakkında bölümü
- [ ] Kullanıcı durumu (online/offline)
- [ ] Profil gizlilik ayarları
- [ ] Tema tercihleri

### **v3.0 Planları**
- [ ] Profil rozetleri/başarılar
- [ ] Arkadaş sistemi
- [ ] Profil ziyaretçileri
- [ ] Özel profil teması
- [ ] Profil video desteği

## 🤝 **Katkıda Bulunma**

### **Geliştirme**
1. Fork yapın
2. Feature branch oluşturun
3. Kodunuzu yazın
4. Test edin
5. Pull request gönderin

### **Test Senaryoları**
- Profil resmi yükleme
- Ad güncelleme
- Offline kullanım
- Hata durumları
- Performance testleri

## 📊 **Metrics ve Analytics**

### **Takip Edilen Metrikler**
- Profil güncelleme oranı
- Resim yükleme başarı oranı
- Kullanıcı etkileşimi
- Hata oranları
- Loading süreleri

---

**Denicord Profil Sistemi** - Modern, güvenli ve kullanıcı dostu profil yönetimi 🚀