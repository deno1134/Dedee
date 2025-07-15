package com.denicord.auth

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {
    private val authRepository = AuthRepository()
    
    private val _isLoading = mutableStateOf(false)
    val isLoading: State<Boolean> = _isLoading
    
    private val _errorMessage = mutableStateOf<String?>(null)
    val errorMessage: State<String?> = _errorMessage
    
    private val _isSignedIn = mutableStateOf(authRepository.currentUser != null)
    val isSignedIn: State<Boolean> = _isSignedIn
    
    fun signUp(email: String, password: String) {
        if (email.isEmpty() || password.isEmpty()) {
            _errorMessage.value = "Email ve şifre boş olamaz"
            return
        }
        
        _isLoading.value = true
        _errorMessage.value = null
        
        viewModelScope.launch {
            val result = authRepository.signUp(email, password)
            _isLoading.value = false
            
            if (result.isSuccess) {
                _isSignedIn.value = true
            } else {
                _errorMessage.value = getErrorMessage(result.exceptionOrNull())
            }
        }
    }
    
    fun signIn(email: String, password: String) {
        if (email.isEmpty() || password.isEmpty()) {
            _errorMessage.value = "Email ve şifre boş olamaz"
            return
        }
        
        _isLoading.value = true
        _errorMessage.value = null
        
        viewModelScope.launch {
            val result = authRepository.signIn(email, password)
            _isLoading.value = false
            
            if (result.isSuccess) {
                _isSignedIn.value = true
            } else {
                _errorMessage.value = getErrorMessage(result.exceptionOrNull())
            }
        }
    }
    
    fun signOut() {
        authRepository.signOut()
        _isSignedIn.value = false
    }
    
    fun clearError() {
        _errorMessage.value = null
    }
    
    private fun getErrorMessage(exception: Throwable?): String {
        return when (exception?.message) {
            "The email address is badly formatted." -> "Geçersiz email formatı"
            "The password is invalid or the user does not have a password." -> "Hatalı şifre"
            "There is no user record corresponding to this identifier." -> "Bu email ile kayıtlı kullanıcı bulunamadı"
            "The email address is already in use by another account." -> "Bu email zaten kullanılıyor"
            "The password is too weak." -> "Şifre çok zayıf (en az 6 karakter)"
            else -> "Bir hata oluştu: ${exception?.message}"
        }
    }
}