package com.denicord.network

import com.denicord.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    // Authentication endpoints
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<AuthResponse>>
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthResponse>>
    
    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse<Unit>>
    
    @GET("auth/me")
    suspend fun getMe(): Response<ApiResponse<UserResponse>>
    
    @PUT("auth/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<ApiResponse<UserResponse>>
    
    @PUT("auth/status")
    suspend fun updateStatus(@Body request: UpdateStatusRequest): Response<ApiResponse<StatusResponse>>
    
    @PUT("auth/password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): Response<ApiResponse<Unit>>
    
    // Server endpoints
    @GET("servers")
    suspend fun getServers(): Response<ApiResponse<ServersResponse>>
    
    @POST("servers")
    suspend fun createServer(@Body request: CreateServerRequest): Response<ApiResponse<ServerResponse>>
    
    @GET("servers/{serverId}")
    suspend fun getServerDetails(@Path("serverId") serverId: String): Response<ApiResponse<ServerDetailsResponse>>
    
    @PUT("servers/{serverId}")
    suspend fun updateServer(@Path("serverId") serverId: String, @Body request: UpdateServerRequest): Response<ApiResponse<ServerResponse>>
    
    @DELETE("servers/{serverId}")
    suspend fun deleteServer(@Path("serverId") serverId: String): Response<ApiResponse<Unit>>
    
    @POST("servers/join/{inviteCode}")
    suspend fun joinServer(@Path("inviteCode") inviteCode: String): Response<ApiResponse<ServerResponse>>
    
    @DELETE("servers/{serverId}/leave")
    suspend fun leaveServer(@Path("serverId") serverId: String): Response<ApiResponse<Unit>>
    
    // Channel endpoints
    @GET("channels/{serverId}")
    suspend fun getChannels(@Path("serverId") serverId: String): Response<ApiResponse<ChannelsResponse>>
    
    @POST("channels")
    suspend fun createChannel(@Body request: CreateChannelRequest): Response<ApiResponse<ChannelResponse>>
    
    @PUT("channels/{channelId}")
    suspend fun updateChannel(@Path("channelId") channelId: String, @Body request: UpdateChannelRequest): Response<ApiResponse<ChannelResponse>>
    
    @DELETE("channels/{channelId}")
    suspend fun deleteChannel(@Path("channelId") channelId: String): Response<ApiResponse<Unit>>
    
    // Message endpoints
    @GET("messages/{channelId}")
    suspend fun getMessages(@Path("channelId") channelId: String, @Query("limit") limit: Int = 50, @Query("before") before: String? = null): Response<ApiResponse<MessagesResponse>>
    
    @POST("messages")
    suspend fun sendMessage(@Body request: SendMessageRequest): Response<ApiResponse<MessageResponse>>
    
    @PUT("messages/{messageId}")
    suspend fun editMessage(@Path("messageId") messageId: String, @Body request: EditMessageRequest): Response<ApiResponse<MessageResponse>>
    
    @DELETE("messages/{messageId}")
    suspend fun deleteMessage(@Path("messageId") messageId: String): Response<ApiResponse<Unit>>
    
    @POST("messages/{messageId}/reactions")
    suspend fun addReaction(@Path("messageId") messageId: String, @Body request: AddReactionRequest): Response<ApiResponse<Unit>>
    
    @DELETE("messages/{messageId}/reactions")
    suspend fun removeReaction(@Path("messageId") messageId: String, @Body request: RemoveReactionRequest): Response<ApiResponse<Unit>>
    
    // User endpoints
    @GET("users/search")
    suspend fun searchUsers(@Query("query") query: String): Response<ApiResponse<UsersResponse>>
    
    @GET("users/{userId}")
    suspend fun getUser(@Path("userId") userId: String): Response<ApiResponse<UserResponse>>
    
    // Friend endpoints
    @GET("users/friends")
    suspend fun getFriends(): Response<ApiResponse<FriendsResponse>>
    
    @POST("users/friends/request")
    suspend fun sendFriendRequest(@Body request: FriendRequestRequest): Response<ApiResponse<Unit>>
    
    @PUT("users/friends/{requestId}")
    suspend fun respondToFriendRequest(@Path("requestId") requestId: String, @Body request: FriendRequestResponse): Response<ApiResponse<Unit>>
    
    @DELETE("users/friends/{friendId}")
    suspend fun removeFriend(@Path("friendId") friendId: String): Response<ApiResponse<Unit>>
    
    // Direct message endpoints
    @GET("messages/direct/{userId}")
    suspend fun getDirectMessages(@Path("userId") userId: String, @Query("limit") limit: Int = 50, @Query("before") before: String? = null): Response<ApiResponse<DirectMessagesResponse>>
    
    @POST("messages/direct")
    suspend fun sendDirectMessage(@Body request: SendDirectMessageRequest): Response<ApiResponse<DirectMessageResponse>>
    
    // File upload endpoints
    @POST("files/upload")
    suspend fun uploadFile(@Body request: UploadFileRequest): Response<ApiResponse<FileResponse>>
}

// Request/Response models
data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val displayName: String? = null
)

data class LoginRequest(
    val emailOrUsername: String,
    val password: String
)

data class UpdateProfileRequest(
    val displayName: String? = null,
    val bio: String? = null,
    val customStatus: String? = null,
    val avatar: String? = null
)

data class UpdateStatusRequest(
    val status: String
)

data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)

data class CreateServerRequest(
    val name: String,
    val description: String? = null,
    val icon: String? = null,
    val isPublic: Boolean = true
)

data class UpdateServerRequest(
    val name: String? = null,
    val description: String? = null,
    val icon: String? = null,
    val banner: String? = null,
    val verificationLevel: Int? = null,
    val isPublic: Boolean? = null
)

data class CreateChannelRequest(
    val serverId: String,
    val name: String,
    val description: String? = null,
    val type: Int = 0,
    val categoryId: String? = null,
    val isPrivate: Boolean = false,
    val isNsfw: Boolean = false
)

data class UpdateChannelRequest(
    val name: String? = null,
    val description: String? = null,
    val topic: String? = null,
    val isPrivate: Boolean? = null,
    val isNsfw: Boolean? = null,
    val rateLimitPerUser: Int? = null
)

data class SendMessageRequest(
    val channelId: String,
    val content: String,
    val replyToId: String? = null,
    val attachments: List<String>? = null
)

data class EditMessageRequest(
    val content: String
)

data class AddReactionRequest(
    val emojiName: String,
    val emojiId: String? = null
)

data class RemoveReactionRequest(
    val emojiName: String,
    val emojiId: String? = null
)

data class FriendRequestRequest(
    val username: String
)

data class FriendRequestResponse(
    val accept: Boolean
)

data class SendDirectMessageRequest(
    val recipientId: String,
    val content: String
)

data class UploadFileRequest(
    val file: ByteArray,
    val filename: String,
    val contentType: String
)

// Response models
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null,
    val errors: List<ValidationError>? = null
)

data class ValidationError(
    val field: String,
    val message: String
)

data class AuthResponse(
    val user: UserResponse,
    val token: String,
    val sessionId: String
)

data class UserResponse(
    val id: String,
    val username: String,
    val email: String,
    val displayName: String,
    val avatar: String?,
    val status: String,
    val bio: String?,
    val customStatus: String?,
    val isVerified: Boolean,
    val twoFactorEnabled: Boolean? = null,
    val locale: String? = null,
    val createdAt: String
)

data class StatusResponse(
    val status: String
)

data class ServersResponse(
    val servers: List<ServerResponse>
)

data class ServerResponse(
    val id: String,
    val name: String,
    val description: String?,
    val icon: String?,
    val banner: String?,
    val ownerId: String,
    val inviteCode: String,
    val memberCount: Int,
    val verificationLevel: Int,
    val isPublic: Boolean,
    val userRole: UserRole? = null,
    val createdAt: String,
    val updatedAt: String? = null
)

data class UserRole(
    val nickname: String?,
    val isOwner: Boolean,
    val isAdmin: Boolean,
    val isModerator: Boolean,
    val joinedAt: String
)

data class ServerDetailsResponse(
    val server: ServerResponse,
    val userMembership: UserRole,
    val channels: List<ChannelResponse>,
    val roles: List<RoleResponse>,
    val members: List<MemberResponse>
)

data class ChannelsResponse(
    val channels: List<ChannelResponse>
)

data class ChannelResponse(
    val id: String,
    val name: String,
    val description: String?,
    val type: Int,
    val position: Int,
    val categoryName: String?,
    val categoryId: String?,
    val isPrivate: Boolean,
    val isNsfw: Boolean,
    val topic: String?,
    val bitrate: Int?,
    val userLimit: Int?,
    val rateLimitPerUser: Int,
    val createdAt: String,
    val updatedAt: String
)

data class RoleResponse(
    val id: String,
    val name: String,
    val color: String,
    val position: Int,
    val permissions: Long,
    val isHoisted: Boolean,
    val isMentionable: Boolean,
    val isManaged: Boolean
)

data class MemberResponse(
    val id: String,
    val userId: String,
    val username: String,
    val displayName: String,
    val nickname: String?,
    val avatar: String?,
    val status: String,
    val customStatus: String?,
    val isOwner: Boolean,
    val isAdmin: Boolean,
    val isModerator: Boolean,
    val joinedAt: String
)

data class MessagesResponse(
    val messages: List<MessageResponse>
)

data class MessageResponse(
    val id: String,
    val channelId: String,
    val content: String,
    val type: Int,
    val isEdited: Boolean,
    val isPinned: Boolean,
    val replyToId: String?,
    val user: UserResponse,
    val attachments: List<AttachmentResponse>?,
    val reactions: List<ReactionResponse>?,
    val createdAt: String,
    val updatedAt: String
)

data class AttachmentResponse(
    val id: String,
    val filename: String,
    val fileSize: Int,
    val fileType: String,
    val url: String,
    val width: Int?,
    val height: Int?,
    val duration: Int?
)

data class ReactionResponse(
    val emojiName: String,
    val emojiId: String?,
    val count: Int,
    val users: List<UserResponse>
)

data class UsersResponse(
    val users: List<UserResponse>
)

data class FriendsResponse(
    val friends: List<FriendResponse>,
    val requests: List<FriendRequestInfo>
)

data class FriendResponse(
    val id: String,
    val user: UserResponse,
    val createdAt: String
)

data class FriendRequestInfo(
    val id: String,
    val sender: UserResponse,
    val recipient: UserResponse,
    val status: String,
    val createdAt: String
)

data class DirectMessagesResponse(
    val messages: List<DirectMessageResponse>
)

data class DirectMessageResponse(
    val id: String,
    val sender: UserResponse,
    val recipient: UserResponse,
    val content: String,
    val isRead: Boolean,
    val isEdited: Boolean,
    val createdAt: String,
    val updatedAt: String
)

data class FileResponse(
    val id: String,
    val filename: String,
    val url: String,
    val size: Int,
    val type: String
)