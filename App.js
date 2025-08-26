import React, { useEffect } from 'react';
import { StatusBar } from 'react-native'; // <- agora o certo
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as NavigationBar from 'expo-navigation-bar';

import HomeScreen from './screens/HomeScreen.js';
import RegistrationScreen from './screens/RegistrationScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Esconde status bar
    StatusBar.setHidden(true, 'slide');

    // Esconde barra de navegação (taskbar)
    const hideNavBar = async () => {
      await NavigationBar.setVisibilityAsync('hidden');
      await NavigationBar.setBehaviorAsync('overlay-swipe');
    };
    hideNavBar();
  }, []);

  return (
    <NavigationContainer>
      {/* Aqui pode deixar style="light" ou "dark", mas hidden já foi forçado */}
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
  );
}
