package com.denicord

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.denicord.auth.AuthViewModel
import com.denicord.screens.AnaSayfa
import com.denicord.screens.LoginScreen
import com.denicord.screens.SignUpScreen
import com.denicord.screens.ProfileScreen
import com.denicord.ui.theme.DenicordTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DenicordTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    DenicordApp()
                }
            }
        }
    }
}

@Composable
fun DenicordApp() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = viewModel()
    val isSignedIn by authViewModel.isSignedIn
    
    LaunchedEffect(isSignedIn) {
        if (isSignedIn) {
            navController.navigate("anasayfa") {
                popUpTo("login") { inclusive = true }
            }
        } else {
            navController.navigate("login") {
                popUpTo("anasayfa") { inclusive = true }
            }
        }
    }
    
    NavHost(
        navController = navController,
        startDestination = if (isSignedIn) "anasayfa" else "login"
    ) {
        composable("login") {
            LoginScreen(
                onNavigateToSignUp = {
                    navController.navigate("signup")
                },
                authViewModel = authViewModel
            )
        }
        
        composable("signup") {
            SignUpScreen(
                onNavigateToLogin = {
                    navController.navigate("login")
                },
                authViewModel = authViewModel
            )
        }
        
        composable("anasayfa") {
            AnaSayfa(
                authViewModel = authViewModel,
                onNavigateToProfile = {
                    navController.navigate("profile")
                }
            )
        }
        
        composable("profile") {
            ProfileScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}