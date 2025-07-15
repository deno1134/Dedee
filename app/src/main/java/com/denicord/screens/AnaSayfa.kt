package com.denicord.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.denicord.auth.AuthViewModel
import com.denicord.channels.ChannelViewModel
import com.denicord.components.ChatScreen
import com.denicord.components.ChannelList
import com.denicord.components.CreateChannelDialog
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnaSayfa(
    authViewModel: AuthViewModel = viewModel()
) {
    val currentUser = FirebaseAuth.getInstance().currentUser
    val channelViewModel: ChannelViewModel = viewModel()
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    
    val showCreateChannelDialog by channelViewModel.showCreateChannelDialog
    val currentChannel = channelViewModel.getCurrentChannel()
    
    // Show Create Channel Dialog
    if (showCreateChannelDialog) {
        CreateChannelDialog(
            channelViewModel = channelViewModel,
            userEmail = currentUser?.email ?: "",
            onDismiss = { channelViewModel.hideCreateChannelDialog() }
        )
    }
    
    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(
                modifier = Modifier.width(280.dp)
            ) {
                // User Info Header
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Denicord",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        
                        currentUser?.email?.let { email ->
                            Text(
                                text = email,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                            )
                        }
                    }
                }
                
                // Channel List
                ChannelList(
                    channelViewModel = channelViewModel,
                    onChannelSelected = { channelId ->
                        scope.launch {
                            drawerState.close()
                        }
                    }
                )
                
                Spacer(modifier = Modifier.weight(1f))
                
                // Logout Button
                OutlinedButton(
                    onClick = { authViewModel.signOut() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Icon(
                        Icons.Default.ExitToApp,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Çıkış Yap")
                }
            }
        },
        content = {
            Scaffold(
                topBar = {
                    TopAppBar(
                        title = {
                            Text(
                                text = "# ${currentChannel?.name ?: "kanal"}",
                                fontWeight = FontWeight.Bold
                            )
                        },
                        navigationIcon = {
                            IconButton(
                                onClick = {
                                    scope.launch {
                                        drawerState.open()
                                    }
                                }
                            ) {
                                Icon(
                                    Icons.Default.Menu,
                                    contentDescription = "Menü"
                                )
                            }
                        },
                        actions = {
                            IconButton(
                                onClick = { authViewModel.signOut() }
                            ) {
                                Icon(
                                    Icons.Default.ExitToApp,
                                    contentDescription = "Çıkış Yap"
                                )
                            }
                        }
                    )
                }
            ) { innerPadding ->
                ChatScreen(
                    channelViewModel = channelViewModel,
                    modifier = Modifier.padding(innerPadding)
                )
            }
        }
    )
}