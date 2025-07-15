# Firebase Kurulum Talimatları

## 1. Firebase Proje Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Proje oluştur" butonuna tıklayın
3. Proje adı olarak "Denicord" girin
4. Google Analytics ayarlarını yapın (isteğe bağlı)
5. Projeyi oluşturun

## 2. Android Uygulaması Ekleme

1. Firebase projesinde "Android" ikonuna tıklayın
2. Android paket adı: `com.denicord`
3. Uygulama takma adı: `Denicord`
4. Debug signing certificate SHA-1 (isteğe bağlı)
5. "Uygulamayı kaydet" butonuna tıklayın

## 3. google-services.json Dosyası

1. Firebase'den `google-services.json` dosyasını indirin
2. Bu dosyayı `app/` klasörüne kopyalayın
3. Mevcut placeholder dosyasını silip, gerçek dosyayı yapıştırın

## 4. Authentication Ayarları

1. Firebase Console'da "Authentication" sekmesine gidin
2. "Başlat" butonuna tıklayın
3. "Sign-in method" sekmesine gidin
4. "Email/Password" seçeneğini etkinleştirin
5. Ayarları kaydedin

## 5. Firestore Database Kurulumu

1. Firebase Console'da "Firestore Database" sekmesine gidin
2. "Veritabanı oluştur" butonuna tıklayın
3. "Test modunda başlat" seçeneğini seçin (geçici)
4. Konum seçin (Europe-west3 önerilen)
5. "Bitti" butonuna tıklayın
6. Proje kök dizinindeki `firestore.rules` dosyasını Firebase Console'da Rules sekmesine kopyalayın

## 6. Firebase Storage Kurulumu

1. Firebase Console'da "Storage" sekmesine gidin
2. "Başlat" butonuna tıklayın
3. "Test modunda başlat" seçeneğini seçin (geçici)
4. Konum seçin (Europe-west3 önerilen)
5. "Bitti" butonuna tıklayın
6. Proje kök dizinindeki `storage.rules` dosyasını Firebase Console'da Rules sekmesine kopyalayın

## 7. Projeyi Çalıştırma

1. Android Studio'da projeyi açın
2. Gradle sync yapın
3. Gerçek cihaz veya emülatörde çalıştırın

## Kullanım

### Yeni Kullanıcı Kaydı
- Email ve şifre ile yeni hesap oluşturabilirsiniz
- Şifre minimum 6 karakter olmalıdır

### Giriş Yapma
- Kayıtlı email ve şifre ile giriş yapabilirsiniz
- Giriş yaptıktan sonra "AnaSayfa" ekranına yönlendirilirsiniz

### Çıkış Yapma
- Ana sayfada sağ üst köşedeki çıkış butonu ile çıkış yapabilirsiniz

## Hata Çözümleri

### google-services.json Hatası
- `google-services.json` dosyasının `app/` klasöründe olduğundan emin olun
- Dosyanın geçerli bir JSON formatında olduğundan emin olun

### Firebase Bağlantı Hatası
- İnternet bağlantınızı kontrol edin
- Firebase projesinin aktif olduğundan emin olun

### Authentication Hatası
- Firebase Console'da Email/Password authentication'ın etkin olduğundan emin olun
- Geçerli email formatı kullanın
- Şifre minimum 6 karakter olmalıdır

## Ek Özellikler

Bu projede şu Firebase özellikleri kullanılmıştır:

### Firebase Authentication
- ✅ Email/Password ile kayıt
- ✅ Email/Password ile giriş
- ✅ Otomatik oturum yönetimi
- ✅ Çıkış yapma
- ✅ Hata mesajları (Türkçe)
- ✅ Loading durumları

### Firebase Firestore
- ✅ Kullanıcı profil bilgileri
- ✅ Kanal verileri
- ✅ Mesaj verileri
- ✅ Gerçek zamanlı senkronizasyon
- ✅ Offline cache desteği

### Firebase Storage
- ✅ Profil resmi yükleme
- ✅ Otomatik resim optimizasyonu
- ✅ Güvenli dosya erişimi
- ✅ Progress tracking

## Geliştirme Notları

### Authentication
- `AuthRepository`: Firebase Authentication işlemleri
- `AuthViewModel`: UI state yönetimi
- `LoginScreen`: Giriş ekranı
- `SignUpScreen`: Kayıt ekranı

### Profil Sistemi
- `UserRepository`: Firestore ve Storage işlemleri
- `ProfileViewModel`: Profil state yönetimi
- `ProfileScreen`: Profil düzenleme ekranı
- `User`: Kullanıcı veri modeli

### Kanal Sistemi
- `ChannelRepository`: Kanal ve mesaj yönetimi
- `ChannelViewModel`: Kanal state yönetimi
- `ChannelList`: Kanal listesi bileşeni
- `ChatScreen`: Mesajlaşma ekranı
- `AnaSayfa`: Ana sayfa (giriş yapan kullanıcılar için)

Daha fazla bilgi için [Firebase Documentation](https://firebase.google.com/docs/android/setup) sayfasını ziyaret edin.