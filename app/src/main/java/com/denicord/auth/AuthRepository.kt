package com.denicord.auth

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.denicord.data.model.User
import com.denicord.network.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import okhttp3.Interceptor
import okhttp3.Cache
import java.util.concurrent.TimeUnit
import java.io.File

private val Context.dataStore by preferencesDataStore(name = "auth_preferences")

class AuthRepository(private val context: Context) {
    
    private val authTokenKey = stringPreferencesKey("auth_token")
    private val userDataKey = stringPreferencesKey("user_data")
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = if (ApiConfig.isProduction) {
            HttpLoggingInterceptor.Level.BASIC
        } else {
            HttpLoggingInterceptor.Level.BODY
        }
    }
    
    private val authInterceptor = Interceptor { chain ->
        val token = runCatching {
            kotlinx.coroutines.runBlocking {
                getAuthToken().first()
            }
        }.getOrNull()
        
        val request = chain.request().newBuilder()
        if (token != null) {
            request.addHeader("Authorization", "Bearer $token")
        }
        request.addHeader("Content-Type", "application/json")
        request.addHeader("Accept", "application/json")
        chain.proceed(request.build())
    }
    
    private val cache = Cache(
        directory = File(context.cacheDir, "http_cache"),
        maxSize = ApiConfig.CACHE_SIZE
    )
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor(authInterceptor)
        .cache(cache)
        .connectTimeout(ApiConfig.CONNECT_TIMEOUT, TimeUnit.SECONDS)
        .readTimeout(ApiConfig.READ_TIMEOUT, TimeUnit.SECONDS)
        .writeTimeout(ApiConfig.WRITE_TIMEOUT, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(ApiConfig.BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    private val apiService = retrofit.create(ApiService::class.java)
    
    // DataStore token operations
    private fun getAuthToken(): Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[authTokenKey]
    }
    
    private suspend fun saveAuthToken(token: String) {
        context.dataStore.edit { preferences ->
            preferences[authTokenKey] = token
        }
    }
    
    private suspend fun clearAuthToken() {
        context.dataStore.edit { preferences ->
            preferences.remove(authTokenKey)
        }
    }
    
    private suspend fun saveUserData(user: User) {
        context.dataStore.edit { preferences ->
            preferences[userDataKey] = com.google.gson.Gson().toJson(user)
        }
    }
    
    private suspend fun clearUserData() {
        context.dataStore.edit { preferences ->
            preferences.remove(userDataKey)
        }
    }
    
    // Get current user from DataStore
    fun getCurrentUser(): Flow<User?> = context.dataStore.data.map { preferences ->
        val userData = preferences[userDataKey]
        if (userData != null) {
            try {
                com.google.gson.Gson().fromJson(userData, User::class.java)
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }
    }
    
    // Check if user is authenticated
    fun isAuthenticated(): Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[authTokenKey] != null
    }
    
    // Register new user
    suspend fun signUp(username: String, email: String, password: String, displayName: String? = null): Result<User> {
        return try {
            val request = RegisterRequest(
                username = username,
                email = email,
                password = password,
                displayName = displayName
            )
            
            val response = apiService.register(request)
            
            if (response.isSuccessful) {
                val authResponse = response.body()?.data
                if (authResponse != null) {
                    // Save token and user data
                    saveAuthToken(authResponse.token)
                    val user = authResponse.user.toUser()
                    saveUserData(user)
                    Result.success(user)
                } else {
                    Result.failure(Exception("Boş yanıt alındı"))
                }
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = try {
                    val errorResponse = com.google.gson.Gson().fromJson(errorBody, ApiResponse::class.java)
                    errorResponse.message
                } catch (e: Exception) {
                    if (response.code() == 400) "Geçersiz veriler" else "Kayıt işlemi başarısız"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Login user
    suspend fun signIn(emailOrUsername: String, password: String): Result<User> {
        return try {
            val request = LoginRequest(
                emailOrUsername = emailOrUsername,
                password = password
            )
            
            val response = apiService.login(request)
            
            if (response.isSuccessful) {
                val authResponse = response.body()?.data
                if (authResponse != null) {
                    // Save token and user data
                    saveAuthToken(authResponse.token)
                    val user = authResponse.user.toUser()
                    saveUserData(user)
                    Result.success(user)
                } else {
                    Result.failure(Exception("Boş yanıt alındı"))
                }
            } else {
                val errorMessage = when (response.code()) {
                    401 -> "Email/kullanıcı adı veya şifre hatalı"
                    403 -> "Hesabınız yasaklanmış"
                    404 -> "Kullanıcı bulunamadı"
                    else -> "Giriş işlemi başarısız"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Bağlantı hatası: ${e.message}"))
        }
    }
    
    // Logout user
    suspend fun signOut(): Result<Unit> {
        return try {
            // Try to call logout API
            try {
                apiService.logout()
            } catch (e: Exception) {
                // Even if API call fails, we should clear local data
            }
            
            // Clear local data
            clearAuthToken()
            clearUserData()
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Get current user from server
    suspend fun getCurrentUserFromServer(): Result<User> {
        return try {
            val response = apiService.getMe()
            
            if (response.isSuccessful) {
                val userResponse = response.body()?.data
                if (userResponse != null) {
                    val user = userResponse.toUser()
                    saveUserData(user)
                    Result.success(user)
                } else {
                    Result.failure(Exception("Boş yanıt alındı"))
                }
            } else {
                if (response.code() == 401) {
                    // Token expired, logout user
                    signOut()
                    Result.failure(Exception("Oturum süresi dolmuş"))
                } else {
                    Result.failure(Exception("Kullanıcı bilgileri alınamadı"))
                }
            }
        } catch (e: Exception) {
            Result.failure(Exception("Sunucu hatası: ${e.message}"))
        }
    }
    
    // Update user profile
    suspend fun updateProfile(displayName: String? = null, bio: String? = null, customStatus: String? = null, avatar: String? = null): Result<User> {
        return try {
            val request = UpdateProfileRequest(
                displayName = displayName,
                bio = bio,
                customStatus = customStatus,
                avatar = avatar
            )
            
            val response = apiService.updateProfile(request)
            
            if (response.isSuccessful) {
                val userResponse = response.body()?.data
                if (userResponse != null) {
                    val user = userResponse.toUser()
                    saveUserData(user)
                    Result.success(user)
                } else {
                    Result.failure(Exception("Boş yanıt alındı"))
                }
            } else {
                val errorMessage = when (response.code()) {
                    400 -> "Geçersiz profil bilgileri"
                    401 -> "Oturum süresi dolmuş"
                    else -> "Profil güncelleme başarısız"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Bağlantı hatası: ${e.message}"))
        }
    }
    
    // Update user status
    suspend fun updateStatus(status: String): Result<String> {
        return try {
            val request = UpdateStatusRequest(status = status)
            
            val response = apiService.updateStatus(request)
            
            if (response.isSuccessful) {
                val statusResponse = response.body()?.data
                if (statusResponse != null) {
                    // Update local user data
                    val currentUser = getCurrentUser().first()
                    if (currentUser != null) {
                        val updatedUser = currentUser.copy(status = status)
                        saveUserData(updatedUser)
                    }
                    Result.success(statusResponse.status)
                } else {
                    Result.failure(Exception("Boş yanıt alındı"))
                }
            } else {
                val errorMessage = when (response.code()) {
                    400 -> "Geçersiz durum"
                    401 -> "Oturum süresi dolmuş"
                    else -> "Durum güncelleme başarısız"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Bağlantı hatası: ${e.message}"))
        }
    }
    
    // Change password
    suspend fun changePassword(currentPassword: String, newPassword: String): Result<Unit> {
        return try {
            val request = ChangePasswordRequest(
                currentPassword = currentPassword,
                newPassword = newPassword
            )
            
            val response = apiService.changePassword(request)
            
            if (response.isSuccessful) {
                // Password changed successfully, user needs to login again
                signOut()
                Result.success(Unit)
            } else {
                val errorMessage = when (response.code()) {
                    400 -> "Mevcut şifre hatalı"
                    401 -> "Oturum süresi dolmuş"
                    else -> "Şifre değiştirme başarısız"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Bağlantı hatası: ${e.message}"))
        }
    }
    
    // Verify token
    suspend fun verifyToken(): Result<Boolean> {
        return try {
            val response = apiService.getMe()
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// Extension function to convert UserResponse to User
private fun UserResponse.toUser(): User {
    return User(
        id = this.id,
        username = this.username,
        email = this.email,
        displayName = this.displayName,
        avatar = this.avatar,
        status = this.status,
        bio = this.bio,
        customStatus = this.customStatus,
        isVerified = this.isVerified,
        createdAt = this.createdAt
    )
}