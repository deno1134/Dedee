package com.denicord.data

import java.util.UUID

data class Channel(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val description: String = "",
    val createdBy: String, // User email
    val createdAt: Long = System.currentTimeMillis(),
    val memberCount: Int = 1,
    val isPrivate: Boolean = false
)