package com.denicord.network

object ApiConfig {
    // Production URLs
    const val PRODUCTION_API_URL = "https://denicord-backend.onrender.com/api/"
    const val PRODUCTION_WS_URL = "wss://denicord-backend.onrender.com"
    
    // Development URLs
    const val DEV_API_URL = "http://10.0.2.2:3000/api/"
    const val DEV_WS_URL = "ws://10.0.2.2:3000"
    
    // Current configuration
    val isProduction = BuildConfig.BUILD_TYPE == "release"
    
    val BASE_URL = if (isProduction) {
        PRODUCTION_API_URL
    } else {
        DEV_API_URL
    }
    
    val WS_URL = if (isProduction) {
        PRODUCTION_WS_URL
    } else {
        DEV_WS_URL
    }
    
    // Timeouts
    const val CONNECT_TIMEOUT = 30L
    const val READ_TIMEOUT = 30L
    const val WRITE_TIMEOUT = 30L
    
    // Cache
    const val CACHE_SIZE = 10 * 1024 * 1024L // 10MB
    
    // File upload
    const val MAX_FILE_SIZE = 50 * 1024 * 1024L // 50MB
    
    // API Endpoints
    object Endpoints {
        const val AUTH = "auth"
        const val SERVERS = "servers"
        const val CHANNELS = "channels"
        const val MESSAGES = "messages"
        const val USERS = "users"
        const val FILES = "files"
        
        object Auth {
            const val LOGIN = "$AUTH/login"
            const val REGISTER = "$AUTH/register"
            const val LOGOUT = "$AUTH/logout"
            const val ME = "$AUTH/me"
            const val PROFILE = "$AUTH/profile"
            const val STATUS = "$AUTH/status"
            const val PASSWORD = "$AUTH/password"
            const val VERIFY = "$AUTH/verify"
        }
        
        object Servers {
            const val LIST = SERVERS
            const val CREATE = SERVERS
            const val DETAILS = "$SERVERS/{serverId}"
            const val UPDATE = "$SERVERS/{serverId}"
            const val DELETE = "$SERVERS/{serverId}"
            const val JOIN = "$SERVERS/join/{inviteCode}"
            const val LEAVE = "$SERVERS/{serverId}/leave"
        }
        
        object Channels {
            const val LIST = "$CHANNELS/{serverId}"
            const val CREATE = CHANNELS
            const val UPDATE = "$CHANNELS/{channelId}"
            const val DELETE = "$CHANNELS/{channelId}"
        }
        
        object Messages {
            const val LIST = "$MESSAGES/{channelId}"
            const val SEND = MESSAGES
            const val EDIT = "$MESSAGES/{messageId}"
            const val DELETE = "$MESSAGES/{messageId}"
            const val REACTIONS = "$MESSAGES/{messageId}/reactions"
        }
    }
    
    // WebSocket Events
    object SocketEvents {
        // Client to Server
        const val USER_CONNECT = "user_connect"
        const val JOIN_CHANNEL = "join_channel"
        const val LEAVE_CHANNEL = "leave_channel"
        const val SEND_MESSAGE = "send_message"
        const val TYPING_START = "typing_start"
        const val TYPING_STOP = "typing_stop"
        const val JOIN_VOICE_CHANNEL = "join_voice_channel"
        const val LEAVE_VOICE_CHANNEL = "leave_voice_channel"
        const val WEBRTC_OFFER = "webrtc_offer"
        const val WEBRTC_ANSWER = "webrtc_answer"
        const val WEBRTC_ICE_CANDIDATE = "webrtc_ice_candidate"
        
        // Server to Client
        const val USER_ONLINE = "user_online"
        const val USER_OFFLINE = "user_offline"
        const val NEW_MESSAGE = "new_message"
        const val USER_TYPING = "user_typing"
        const val USER_STOP_TYPING = "user_stop_typing"
        const val USER_JOINED_VOICE = "user_joined_voice"
        const val USER_LEFT_VOICE = "user_left_voice"
        const val ERROR = "error"
        const val CONNECT = "connect"
        const val DISCONNECT = "disconnect"
        const val RECONNECT = "reconnect"
    }
}