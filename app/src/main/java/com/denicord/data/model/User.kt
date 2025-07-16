package com.denicord.data.model

data class User(
    val id: String,
    val username: String,
    val email: String,
    val displayName: String,
    val avatar: String? = null,
    val status: String = "offline", // online, offline, away, busy, invisible
    val bio: String? = null,
    val customStatus: String? = null,
    val isVerified: Boolean = false,
    val twoFactorEnabled: Boolean = false,
    val locale: String = "tr-TR",
    val createdAt: String
)