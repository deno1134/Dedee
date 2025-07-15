# Denicord - Kanal Sistemi

## 🎯 Özellikler

### 📁 **Kanal Sistemi**
- ✅ Kullanıcılar yeni sohbet kanalları oluşturabilir
- ✅ Kanal listesi sol menüde (Navigation Drawer) görüntülenir
- ✅ Her kanalın mesajları ayrı ayrı tutulur
- ✅ Varsayılan kanallar (genel, rastgele) otomatik oluşturulur

### 💬 **Mesajlaşma**
- ✅ Gerçek zamanlı mesajlaşma (in-memory)
- ✅ Mesaj gönderme ve görüntüleme
- ✅ Kullanıcı adı ve zaman damgası gösterimi
- ✅ Modern chat UI (bubble style)
- ✅ Otomatik scroll (yeni mesajlara)

### 🎨 **Kullanıcı Arayüzü**
- ✅ Material 3 Design
- ✅ Navigation Drawer ile kanal listesi
- ✅ Responsive tasarım
- ✅ Türkçe arayüz
- ✅ Dark/Light theme desteği

## 📱 **Ekran Görüntüleri ve Kullanım**

### 1. **Ana Sayfa (AnaSayfa)**
- **Sol menü**: Kanal listesi ve yeni kanal oluşturma
- **Üst bar**: Aktif kanal adı ve çıkış butonu
- **Ana alan**: Mesajlaşma ekranı

### 2. **Kanal Listesi**
- **Kanallar**: Tüm kanallar liste halinde
- **Aktif kanal**: Mavi renkte vurgulanır
- **Yeni kanal**: "+" butonu ile yeni kanal oluşturma

### 3. **Kanal Oluşturma**
- **Kanal adı**: Zorunlu alan
- **Açıklama**: İsteğe bağlı
- **Önizleme**: Kanal nasıl görüneceğini gösterir

### 4. **Mesajlaşma**
- **Mesaj listesi**: Tüm mesajlar kronolojik sırada
- **Mesaj gönderme**: Alt kısımda mesaj yazma alanı
- **Kullanıcı ayrımı**: Kendi mesajları sağda, diğerleri solda

## 🏗️ **Teknik Yapı**

### **Veri Modelleri**
```kotlin
data class Channel(
    val id: String,
    val name: String,
    val description: String,
    val createdBy: String,
    val createdAt: Long,
    val memberCount: Int,
    val isPrivate: Boolean
)

data class Message(
    val id: String,
    val channelId: String,
    val content: String,
    val senderEmail: String,
    val senderName: String,
    val timestamp: Long,
    val isEdited: Boolean
)
```

### **Mimari Bileşenler**
- **ChannelRepository**: Kanal ve mesaj verilerini yönetir
- **ChannelViewModel**: UI state'ini yönetir
- **Components**: Yeniden kullanılabilir UI bileşenleri

### **Dosya Yapısı**
```
app/src/main/java/com/denicord/
├── auth/                    # Firebase Authentication
│   ├── AuthRepository.kt
│   └── AuthViewModel.kt
├── channels/                # Kanal sistemi
│   ├── ChannelRepository.kt
│   └── ChannelViewModel.kt
├── components/              # UI bileşenleri
│   ├── ChannelList.kt
│   ├── ChatScreen.kt
│   └── CreateChannelDialog.kt
├── data/                    # Veri modelleri
│   ├── Channel.kt
│   └── Message.kt
├── screens/                 # Ekranlar
│   ├── AnaSayfa.kt
│   ├── LoginScreen.kt
│   └── SignUpScreen.kt
└── ui/theme/               # Tema dosyaları
```

## 🚀 **Nasıl Kullanılır**

### **1. Kanal Oluşturma**
1. Sol menüyü açın (hamburger menü)
2. "+" butonuna tıklayın
3. Kanal adı girin (zorunlu)
4. Açıklama girin (isteğe bağlı)
5. "Oluştur" butonuna tıklayın

### **2. Kanal Değiştirme**
1. Sol menüyü açın
2. İstediğiniz kanala tıklayın
3. Menü otomatik kapanır ve kanala geçer

### **3. Mesaj Gönderme**
1. Alt kısımdaki metin alanına mesajınızı yazın
2. "Gönder" butonuna tıklayın veya Enter tuşuna basın
3. Mesaj anında kanalda görüntülenir

### **4. Mesaj Görüntüleme**
- Kendi mesajlarınız: Sağ tarafta mavi renkte
- Diğer kullanıcılar: Sol tarafta gri renkte
- Zaman damgası: Her mesajın altında

## 🔧 **Geliştiriciler İçin**

### **Yeni Özellik Ekleme**
```kotlin
// Yeni kanal repository fonksiyonu
fun deleteChannel(channelId: String) {
    _channels.value = _channels.value.filter { it.id != channelId }
}

// ViewModel'e fonksiyon ekleme
fun deleteChannel(channelId: String) {
    channelRepository.deleteChannel(channelId)
}
```

### **UI Bileşeni Oluşturma**
```kotlin
@Composable
fun CustomChannelItem(
    channel: Channel,
    onClick: () -> Unit
) {
    // Özel UI implementasyonu
}
```

## 📊 **Veri Yönetimi**

### **In-Memory Storage**
- Şu anda tüm veriler bellekte tutulmaktadır
- Uygulama kapatıldığında veriler silinir
- Gerçek projelerde Firebase Firestore kullanılabilir

### **State Management**
- `StateFlow` ile reactive data
- `ViewModel` ile UI state yönetimi
- `Compose` state ile UI güncellemeleri

## 🎯 **Gelecek Planları**

### **v2.0 Özellikler**
- [ ] Firebase Firestore entegrasyonu
- [ ] Gerçek zamanlı mesajlaşma
- [ ] Mesaj düzenleme ve silme
- [ ] Dosya paylaşımı
- [ ] Kanal izinleri ve moderasyon
- [ ] Offline destek

### **v3.0 Özellikler**
- [ ] Sesli mesaj
- [ ] Video arama
- [ ] Grup görüntülü görüşme
- [ ] Bot desteği
- [ ] Özel emojiler

## 📝 **Lisans**
Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 **Katkıda Bulunma**
1. Fork edin
2. Feature branch oluşturun
3. Commit edin
4. Push edin
5. Pull request açın

---

**Denicord** - Modern Android sohbet uygulaması 🚀