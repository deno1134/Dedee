import SwiftUI

struct ContentView: View {
    @StateObject private var authManager = AuthManager()
    @StateObject private var serverManager = ServerManager()
    @StateObject private var chatManager = ChatManager()
    @StateObject private var voiceManager = VoiceManager()
    @StateObject private var networkManager = NetworkManager()
    
    var body: some View {
        ZStack {
            // Background
            Color.black
                .ignoresSafeArea()
            
            if authManager.isAuthenticated {
                MainTabView()
                    .environmentObject(authManager)
                    .environmentObject(serverManager)
                    .environmentObject(chatManager)
                    .environmentObject(voiceManager)
                    .environmentObject(networkManager)
            } else {
                LoginView()
                    .environmentObject(authManager)
                    .environmentObject(networkManager)
            }
        }
        .onAppear {
            authManager.checkAuthenticationStatus()
        }
    }
}

struct MainTabView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var serverManager: ServerManager
    @EnvironmentObject var chatManager: ChatManager
    @EnvironmentObject var voiceManager: VoiceManager
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            HStack(spacing: 0) {
                // Sol sidebar - Sunucular
                ServerSidebarView(selectedTab: $selectedTab)
                    .frame(width: 80)
                    .background(Color.black)
                
                // Orta panel - Kanallar
                ChannelListView()
                    .frame(width: 250)
                    .background(Color.gray.opacity(0.1))
                
                // Sağ panel - Chat
                ChatView()
                    .background(Color.white.opacity(0.05))
                
                // Sağ sidebar - Üyeler (iPad landscape)
                if UIDevice.current.orientation.isLandscape {
                    MemberListView()
                        .frame(width: 200)
                        .background(Color.gray.opacity(0.1))
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .statusBarHidden(false)
        .preferredColorScheme(.dark)
    }
}

struct ServerSidebarView: View {
    @Binding var selectedTab: Int
    @EnvironmentObject var serverManager: ServerManager
    @State private var showingCreateServer = false
    
    var body: some View {
        VStack(spacing: 8) {
            // Ana sunucu (DM)
            ServerIconView(
                server: nil,
                isSelected: selectedTab == 0,
                action: { selectedTab = 0 }
            )
            
            Divider()
                .background(Color.gray)
                .frame(height: 2)
            
            // Sunucu listesi
            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(Array(serverManager.servers.enumerated()), id: \.element.id) { index, server in
                        ServerIconView(
                            server: server,
                            isSelected: selectedTab == index + 1,
                            action: { 
                                selectedTab = index + 1
                                serverManager.selectServer(server)
                            }
                        )
                    }
                }
            }
            
            Spacer()
            
            // Sunucu ekle butonu
            Button(action: { showingCreateServer = true }) {
                Image(systemName: "plus")
                    .foregroundColor(.green)
                    .font(.system(size: 24))
                    .frame(width: 50, height: 50)
                    .background(Color.gray.opacity(0.3))
                    .clipShape(Circle())
            }
            .padding(.bottom, 20)
        }
        .padding(.vertical, 12)
        .sheet(isPresented: $showingCreateServer) {
            CreateServerView()
        }
    }
}

struct ServerIconView: View {
    let server: Server?
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            ZStack {
                if let server = server {
                    // Sunucu ikonu
                    if let iconURL = server.iconURL {
                        AsyncImage(url: iconURL) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Text(String(server.name.prefix(2)))
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                        }
                    } else {
                        // İkon yoksa kısaltma
                        Text(String(server.name.prefix(2)))
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                    }
                } else {
                    // Ana sunucu (DM) ikonu
                    Image(systemName: "house.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.white)
                }
            }
            .frame(width: 50, height: 50)
            .background(server == nil ? Color.blue : Color.gray.opacity(0.8))
            .clipShape(RoundedRectangle(cornerRadius: isSelected ? 15 : 25))
            .overlay(
                RoundedRectangle(cornerRadius: isSelected ? 15 : 25)
                    .stroke(isSelected ? Color.white : Color.clear, lineWidth: 2)
            )
            .scaleEffect(isSelected ? 1.1 : 1.0)
            .animation(.easeInOut(duration: 0.2), value: isSelected)
        }
    }
}

struct ChannelListView: View {
    @EnvironmentObject var serverManager: ServerManager
    @EnvironmentObject var chatManager: ChatManager
    @State private var showingCreateChannel = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Sunucu başlığı
            HStack {
                Text(serverManager.selectedServer?.name ?? "Direkt Mesajlar")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                
                Spacer()
                
                Button(action: { showingCreateChannel = true }) {
                    Image(systemName: "plus")
                        .foregroundColor(.gray)
                        .font(.system(size: 16))
                }
                .padding(.trailing, 16)
            }
            .background(Color.black.opacity(0.5))
            
            Divider()
                .background(Color.gray)
            
            // Kanal listesi
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 4) {
                    ForEach(serverManager.selectedServer?.channels ?? []) { channel in
                        ChannelRowView(channel: channel)
                    }
                }
                .padding(.vertical, 8)
            }
            
            Spacer()
            
            // Kullanıcı bilgisi
            UserInfoView()
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.black.opacity(0.5))
        }
        .sheet(isPresented: $showingCreateChannel) {
            CreateChannelView()
        }
    }
}

struct ChannelRowView: View {
    let channel: Channel
    @EnvironmentObject var chatManager: ChatManager
    
    var body: some View {
        HStack {
            Image(systemName: channel.type == .text ? "number" : "speaker.wave.2")
                .foregroundColor(.gray)
                .font(.system(size: 16))
            
            Text(channel.name)
                .foregroundColor(chatManager.selectedChannel?.id == channel.id ? .white : .gray)
                .font(.system(size: 16))
            
            Spacer()
            
            // Okunmamış mesaj sayısı
            if channel.unreadCount > 0 {
                Text("\(channel.unreadCount)")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.red)
                    .clipShape(Capsule())
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(
            chatManager.selectedChannel?.id == channel.id ? 
            Color.gray.opacity(0.3) : Color.clear
        )
        .onTapGesture {
            chatManager.selectChannel(channel)
        }
    }
}

struct ChatView: View {
    @EnvironmentObject var chatManager: ChatManager
    @State private var messageText = ""
    @State private var isTyping = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Chat başlığı
            HStack {
                Image(systemName: "number")
                    .foregroundColor(.gray)
                
                Text(chatManager.selectedChannel?.name ?? "Kanal seçin")
                    .font(.headline)
                    .foregroundColor(.white)
                
                Spacer()
                
                // Sesli sohbet butonu
                Button(action: {}) {
                    Image(systemName: "phone")
                        .foregroundColor(.gray)
                        .font(.system(size: 18))
                }
                
                // Video arama butonu
                Button(action: {}) {
                    Image(systemName: "video")
                        .foregroundColor(.gray)
                        .font(.system(size: 18))
                }
                
                // Üye listesi butonu
                Button(action: {}) {
                    Image(systemName: "person.2")
                        .foregroundColor(.gray)
                        .font(.system(size: 18))
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.black.opacity(0.5))
            
            Divider()
                .background(Color.gray)
            
            // Mesaj listesi
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 12) {
                    ForEach(chatManager.messages) { message in
                        MessageRowView(message: message)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            
            // Mesaj gönderme alanı
            MessageInputView(messageText: $messageText, isTyping: $isTyping)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.black.opacity(0.5))
        }
    }
}

struct MessageRowView: View {
    let message: Message
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Kullanıcı avatarı
            AsyncImage(url: message.user.avatarURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color.gray.opacity(0.5))
                    .overlay(
                        Text(String(message.user.displayName.prefix(1)))
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                    )
            }
            .frame(width: 40, height: 40)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(message.user.displayName)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Text(message.timestamp.formatted())
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                Text(message.content)
                    .font(.system(size: 16))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.leading)
                
                // Ek dosyalar
                if !message.attachments.isEmpty {
                    ForEach(message.attachments) { attachment in
                        AttachmentView(attachment: attachment)
                    }
                }
                
                // Tepkiler
                if !message.reactions.isEmpty {
                    ReactionView(reactions: message.reactions)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

struct MessageInputView: View {
    @Binding var messageText: String
    @Binding var isTyping: Bool
    @EnvironmentObject var chatManager: ChatManager
    
    var body: some View {
        HStack(spacing: 12) {
            // Dosya ekleme butonu
            Button(action: {}) {
                Image(systemName: "plus.circle.fill")
                    .foregroundColor(.gray)
                    .font(.system(size: 24))
            }
            
            // Mesaj yazma alanı
            TextField("Mesajınızı yazın...", text: $messageText)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .onSubmit {
                    sendMessage()
                }
                .onChange(of: messageText) { _ in
                    isTyping = !messageText.isEmpty
                }
            
            // Emoji butonu
            Button(action: {}) {
                Image(systemName: "face.smiling")
                    .foregroundColor(.gray)
                    .font(.system(size: 20))
            }
            
            // Gönder butonu
            Button(action: sendMessage) {
                Image(systemName: "arrow.up.circle.fill")
                    .foregroundColor(messageText.isEmpty ? .gray : .blue)
                    .font(.system(size: 24))
            }
            .disabled(messageText.isEmpty)
        }
    }
    
    private func sendMessage() {
        guard !messageText.isEmpty else { return }
        
        chatManager.sendMessage(messageText)
        messageText = ""
        isTyping = false
    }
}

struct UserInfoView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var voiceManager: VoiceManager
    @State private var showingUserMenu = false
    
    var body: some View {
        HStack {
            // Kullanıcı avatarı
            AsyncImage(url: authManager.currentUser?.avatarURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color.gray.opacity(0.5))
                    .overlay(
                        Text(String(authManager.currentUser?.displayName.prefix(1) ?? "U"))
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                    )
            }
            .frame(width: 32, height: 32)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 2) {
                Text(authManager.currentUser?.displayName ?? "Kullanıcı")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                
                Text(authManager.currentUser?.status ?? "offline")
                    .font(.system(size: 12))
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            // Mikrofon butonu
            Button(action: { voiceManager.toggleMicrophone() }) {
                Image(systemName: voiceManager.isMicrophoneEnabled ? "mic.fill" : "mic.slash.fill")
                    .foregroundColor(voiceManager.isMicrophoneEnabled ? .green : .red)
                    .font(.system(size: 16))
            }
            
            // Ses butonu
            Button(action: { voiceManager.toggleSpeaker() }) {
                Image(systemName: voiceManager.isSpeakerEnabled ? "speaker.wave.2.fill" : "speaker.slash.fill")
                    .foregroundColor(voiceManager.isSpeakerEnabled ? .green : .red)
                    .font(.system(size: 16))
            }
            
            // Ayarlar butonu
            Button(action: { showingUserMenu = true }) {
                Image(systemName: "gearshape.fill")
                    .foregroundColor(.gray)
                    .font(.system(size: 16))
            }
        }
        .sheet(isPresented: $showingUserMenu) {
            UserSettingsView()
        }
    }
}

struct MemberListView: View {
    @EnvironmentObject var serverManager: ServerManager
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Üyeler")
                .font(.headline)
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.black.opacity(0.5))
            
            Divider()
                .background(Color.gray)
            
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 8) {
                    ForEach(serverManager.selectedServer?.members ?? []) { member in
                        MemberRowView(member: member)
                    }
                }
                .padding(.vertical, 8)
            }
            
            Spacer()
        }
    }
}

struct MemberRowView: View {
    let member: Member
    
    var body: some View {
        HStack {
            // Kullanıcı avatarı
            AsyncImage(url: member.user.avatarURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color.gray.opacity(0.5))
                    .overlay(
                        Text(String(member.user.displayName.prefix(1)))
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                    )
            }
            .frame(width: 28, height: 28)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 2) {
                Text(member.nickname ?? member.user.displayName)
                    .font(.system(size: 14))
                    .foregroundColor(.white)
                
                if let customStatus = member.user.customStatus {
                    Text(customStatus)
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            // Online durumu
            Circle()
                .fill(statusColor(for: member.user.status))
                .frame(width: 8, height: 8)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 4)
    }
    
    private func statusColor(for status: String) -> Color {
        switch status {
        case "online": return .green
        case "away": return .orange
        case "busy": return .red
        default: return .gray
        }
    }
}

// Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}