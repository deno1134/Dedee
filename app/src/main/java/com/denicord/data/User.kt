package com.denicord.data

data class User(
    val uid: String = "",
    val email: String = "",
    val displayName: String = "",
    val profileImageUrl: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val lastSeen: Long = System.currentTimeMillis()
) {
    // Firestore için boş constructor
    constructor() : this("", "", "", "", 0L, 0L)
}