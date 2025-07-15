package com.denicord.channels

import com.denicord.data.Channel
import com.denicord.data.Message
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class ChannelRepository {
    private val _channels = MutableStateFlow<List<Channel>>(emptyList())
    val channels: StateFlow<List<Channel>> = _channels.asStateFlow()
    
    private val _messages = MutableStateFlow<Map<String, List<Message>>>(emptyMap())
    val messages: StateFlow<Map<String, List<Message>>> = _messages.asStateFlow()
    
    init {
        // Varsayılan kanalları oluştur
        createDefaultChannels()
    }
    
    private fun createDefaultChannels() {
        val defaultChannels = listOf(
            Channel(
                id = "general",
                name = "genel",
                description = "Genel sohbet kanalı",
                createdBy = "sistem"
            ),
            Channel(
                id = "random",
                name = "rastgele",
                description = "Rastgele konuşmalar",
                createdBy = "sistem"
            )
        )
        
        _channels.value = defaultChannels
        
        // Varsayılan mesajları oluştur
        val defaultMessages = mapOf(
            "general" to listOf(
                Message(
                    channelId = "general",
                    content = "Genel kanala hoş geldiniz! 👋",
                    senderEmail = "sistem",
                    senderName = "Sistem",
                    timestamp = System.currentTimeMillis() - 3600000 // 1 saat önce
                )
            ),
            "random" to listOf(
                Message(
                    channelId = "random",
                    content = "Rastgele konuşmalar için buradayız! 🎲",
                    senderEmail = "sistem",
                    senderName = "Sistem",
                    timestamp = System.currentTimeMillis() - 1800000 // 30 dakika önce
                )
            )
        )
        
        _messages.value = defaultMessages
    }
    
    fun createChannel(name: String, description: String, createdBy: String): Channel {
        val newChannel = Channel(
            name = name,
            description = description,
            createdBy = createdBy
        )
        
        _channels.value = _channels.value + newChannel
        
        // Yeni kanal için boş mesaj listesi oluştur
        val currentMessages = _messages.value.toMutableMap()
        currentMessages[newChannel.id] = emptyList()
        _messages.value = currentMessages
        
        return newChannel
    }
    
    fun sendMessage(channelId: String, content: String, senderEmail: String, senderName: String) {
        val newMessage = Message(
            channelId = channelId,
            content = content,
            senderEmail = senderEmail,
            senderName = senderName
        )
        
        val currentMessages = _messages.value.toMutableMap()
        val channelMessages = currentMessages[channelId] ?: emptyList()
        currentMessages[channelId] = channelMessages + newMessage
        _messages.value = currentMessages
    }
    
    fun getChannelMessages(channelId: String): List<Message> {
        return _messages.value[channelId] ?: emptyList()
    }
    
    fun getChannelById(channelId: String): Channel? {
        return _channels.value.find { it.id == channelId }
    }
}