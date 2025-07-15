package com.denicord.profile

import android.net.Uri
import com.denicord.data.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.util.UUID

class UserRepository {
    private val auth = FirebaseAuth.getInstance()
    private val firestore = FirebaseFirestore.getInstance()
    private val storage = FirebaseStorage.getInstance()
    
    private val usersCollection = firestore.collection("users")
    private val profileImagesRef = storage.reference.child("profile_images")
    
    suspend fun getCurrentUser(): Result<User?> {
        return try {
            val currentUser = auth.currentUser
            if (currentUser != null) {
                val document = usersCollection.document(currentUser.uid).get().await()
                if (document.exists()) {
                    val user = document.toObject(User::class.java)
                    Result.success(user)
                } else {
                    // Kullanıcı Firestore'da yoksa oluştur
                    val newUser = User(
                        uid = currentUser.uid,
                        email = currentUser.email ?: "",
                        displayName = currentUser.displayName ?: currentUser.email?.substringBefore("@") ?: "",
                        profileImageUrl = currentUser.photoUrl?.toString() ?: ""
                    )
                    createUser(newUser)
                    Result.success(newUser)
                }
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createUser(user: User): Result<Unit> {
        return try {
            usersCollection.document(user.uid).set(user).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateUser(user: User): Result<Unit> {
        return try {
            usersCollection.document(user.uid).set(user).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun uploadProfileImage(uri: Uri): Result<String> {
        return try {
            val currentUser = auth.currentUser
            if (currentUser != null) {
                val fileName = "${currentUser.uid}_${UUID.randomUUID()}"
                val imageRef = profileImagesRef.child(fileName)
                
                // Resmi yükle
                imageRef.putFile(uri).await()
                
                // Download URL'i al
                val downloadUrl = imageRef.downloadUrl.await()
                
                Result.success(downloadUrl.toString())
            } else {
                Result.failure(Exception("Kullanıcı oturumu bulunamadı"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getUserById(userId: String): Result<User?> {
        return try {
            val document = usersCollection.document(userId).get().await()
            if (document.exists()) {
                val user = document.toObject(User::class.java)
                Result.success(user)
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateLastSeen(): Result<Unit> {
        return try {
            val currentUser = auth.currentUser
            if (currentUser != null) {
                usersCollection.document(currentUser.uid)
                    .update("lastSeen", System.currentTimeMillis())
                    .await()
                Result.success(Unit)
            } else {
                Result.failure(Exception("Kullanıcı oturumu bulunamadı"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}