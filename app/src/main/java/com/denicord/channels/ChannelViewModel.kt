package com.denicord.channels

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.denicord.data.Channel
import com.denicord.data.Message
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ChannelViewModel : ViewModel() {
    private val channelRepository = ChannelRepository()
    
    val channels: StateFlow<List<Channel>> = channelRepository.channels
    val allMessages: StateFlow<Map<String, List<Message>>> = channelRepository.messages
    
    private val _currentChannelId = mutableStateOf("general")
    val currentChannelId: State<String> = _currentChannelId
    
    private val _currentChannelMessages = mutableStateOf<List<Message>>(emptyList())
    val currentChannelMessages: State<List<Message>> = _currentChannelMessages
    
    private val _isCreatingChannel = mutableStateOf(false)
    val isCreatingChannel: State<Boolean> = _isCreatingChannel
    
    private val _showCreateChannelDialog = mutableStateOf(false)
    val showCreateChannelDialog: State<Boolean> = _showCreateChannelDialog
    
    init {
        // İlk kanal mesajlarını yükle
        viewModelScope.launch {
            allMessages.collect { messagesMap ->
                _currentChannelMessages.value = messagesMap[_currentChannelId.value] ?: emptyList()
            }
        }
    }
    
    fun selectChannel(channelId: String) {
        _currentChannelId.value = channelId
        _currentChannelMessages.value = channelRepository.getChannelMessages(channelId)
    }
    
    fun getCurrentChannel(): Channel? {
        return channelRepository.getChannelById(_currentChannelId.value)
    }
    
    fun sendMessage(content: String, senderEmail: String, senderName: String) {
        if (content.isNotBlank()) {
            channelRepository.sendMessage(
                channelId = _currentChannelId.value,
                content = content.trim(),
                senderEmail = senderEmail,
                senderName = senderName
            )
            // Mesajları güncelle
            _currentChannelMessages.value = channelRepository.getChannelMessages(_currentChannelId.value)
        }
    }
    
    fun createChannel(name: String, description: String, createdBy: String) {
        if (name.isNotBlank()) {
            _isCreatingChannel.value = true
            
            viewModelScope.launch {
                try {
                    val newChannel = channelRepository.createChannel(
                        name = name.trim(),
                        description = description.trim(),
                        createdBy = createdBy
                    )
                    
                    // Yeni oluşturulan kanala geç
                    selectChannel(newChannel.id)
                    
                    _showCreateChannelDialog.value = false
                } catch (e: Exception) {
                    // Hata işleme
                } finally {
                    _isCreatingChannel.value = false
                }
            }
        }
    }
    
    fun showCreateChannelDialog() {
        _showCreateChannelDialog.value = true
    }
    
    fun hideCreateChannelDialog() {
        _showCreateChannelDialog.value = false
    }
}