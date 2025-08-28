import React, { useEffect, useState } from 'react';
import { StatusBar, Animated, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';

import HomeScreen from './screens/HomeScreen.js';
import RegistrationScreen from './screens/RegistrationScreen';
import VideoSplashScreen from './VideoSplashScreen'; // Importe o componente

// Prevenir auto-hide da splash nativa
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [showVideoSplash, setShowVideoSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Configurações iniciais do sistema
    const setupApp = async () => {
      try {
        // Esconder splash nativa rapidamente para mostrar o vídeo
        setTimeout(async () => {
          await SplashScreen.hideAsync();
        }, 100);

        // Esconde status bar
        StatusBar.setHidden(true, 'slide');

        // Esconde barra de navegação (taskbar)
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        
      } catch (error) {
        console.log('Erro na configuração inicial:', error);
      }
    };

    setupApp();
  }, []);

  useEffect(() => {
    if (!showVideoSplash && !isAppReady) {
      // Inicializar app após o vídeo terminar
      initializeApp();
    }
  }, [showVideoSplash, isAppReady]);

  const initializeApp = async () => {
    try {
      // Aqui você pode carregar dados, fonts, configurações, etc.
      // Reduzido para 500ms já que o vídeo já deu tempo suficiente
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Animação de fade in mais rápida para o app principal
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      
      setIsAppReady(true);
    } catch (error) {
      console.log('Erro na inicialização do app:', error);
      setIsAppReady(true);
    }
  };

  const handleVideoSplashFinish = () => {
    setShowVideoSplash(false);
  };

  // Mostrar splash screen com vídeo
  if (showVideoSplash) {
    return <VideoSplashScreen onFinish={handleVideoSplashFinish} />;
  }

  // Mostrar loading enquanto app inicializa (opcional)
  if (!isAppReady) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // App principal com animação de entrada
  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#000',
              height: 80,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 24,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Menu Principal' }}
          />
          <Stack.Screen
            name="Registration"
            options={{ title: 'Novo Usuário' }}
          >
            {props => (
              <RegistrationScreen
                {...props}
                isProductionMode={props.route?.params?.isProductionMode ?? true}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </Animated.View>
  );
}