package com.denicord.profile

import android.net.Uri
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.denicord.data.User
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {
    private val userRepository = UserRepository()
    
    private val _user = mutableStateOf<User?>(null)
    val user: State<User?> = _user
    
    private val _isLoading = mutableStateOf(false)
    val isLoading: State<Boolean> = _isLoading
    
    private val _isUpdating = mutableStateOf(false)
    val isUpdating: State<Boolean> = _isUpdating
    
    private val _isUploadingImage = mutableStateOf(false)
    val isUploadingImage: State<Boolean> = _isUploadingImage
    
    private val _errorMessage = mutableStateOf<String?>(null)
    val errorMessage: State<String?> = _errorMessage
    
    private val _successMessage = mutableStateOf<String?>(null)
    val successMessage: State<String?> = _successMessage
    
    init {
        loadCurrentUser()
    }
    
    private fun loadCurrentUser() {
        _isLoading.value = true
        _errorMessage.value = null
        
        viewModelScope.launch {
            try {
                val result = userRepository.getCurrentUser()
                if (result.isSuccess) {
                    _user.value = result.getOrNull()
                } else {
                    _errorMessage.value = "Kullanıcı bilgileri yüklenemedi: ${result.exceptionOrNull()?.message}"
                }
            } catch (e: Exception) {
                _errorMessage.value = "Beklenmeyen bir hata oluştu: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun updateProfile(displayName: String) {
        val currentUser = _user.value
        if (currentUser == null) {
            _errorMessage.value = "Kullanıcı bilgileri bulunamadı"
            return
        }
        
        if (displayName.isBlank()) {
            _errorMessage.value = "Ad boş olamaz"
            return
        }
        
        _isUpdating.value = true
        _errorMessage.value = null
        _successMessage.value = null
        
        viewModelScope.launch {
            try {
                val updatedUser = currentUser.copy(displayName = displayName.trim())
                val result = userRepository.updateUser(updatedUser)
                
                if (result.isSuccess) {
                    _user.value = updatedUser
                    _successMessage.value = "Profil başarıyla güncellendi"
                } else {
                    _errorMessage.value = "Profil güncellenemedi: ${result.exceptionOrNull()?.message}"
                }
            } catch (e: Exception) {
                _errorMessage.value = "Beklenmeyen bir hata oluştu: ${e.message}"
            } finally {
                _isUpdating.value = false
            }
        }
    }
    
    fun uploadProfileImage(uri: Uri) {
        _isUploadingImage.value = true
        _errorMessage.value = null
        _successMessage.value = null
        
        viewModelScope.launch {
            try {
                val result = userRepository.uploadProfileImage(uri)
                
                if (result.isSuccess) {
                    val imageUrl = result.getOrNull()
                    if (imageUrl != null) {
                        val currentUser = _user.value
                        if (currentUser != null) {
                            val updatedUser = currentUser.copy(profileImageUrl = imageUrl)
                            val updateResult = userRepository.updateUser(updatedUser)
                            
                            if (updateResult.isSuccess) {
                                _user.value = updatedUser
                                _successMessage.value = "Profil resmi başarıyla güncellendi"
                            } else {
                                _errorMessage.value = "Profil resmi kaydedilemedi: ${updateResult.exceptionOrNull()?.message}"
                            }
                        }
                    }
                } else {
                    _errorMessage.value = "Profil resmi yüklenemedi: ${result.exceptionOrNull()?.message}"
                }
            } catch (e: Exception) {
                _errorMessage.value = "Beklenmeyen bir hata oluştu: ${e.message}"
            } finally {
                _isUploadingImage.value = false
            }
        }
    }
    
    fun clearMessages() {
        _errorMessage.value = null
        _successMessage.value = null
    }
    
    fun refreshProfile() {
        loadCurrentUser()
    }
}