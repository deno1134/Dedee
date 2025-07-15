package com.denicord.data

import java.util.UUID

data class Message(
    val id: String = UUID.randomUUID().toString(),
    val channelId: String,
    val content: String,
    val senderEmail: String,
    val senderName: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isEdited: Boolean = false
)