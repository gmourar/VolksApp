import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

const NETWORK_PERMISSION_KEY = 'network_permission_granted';

export const NetworkPermissions = {
  // Verifica se já foi solicitada permissão de rede
  async checkNetworkPermission() {
    try {
      const permissionStatus = await AsyncStorage.getItem(NETWORK_PERMISSION_KEY);
      return permissionStatus === 'granted';
    } catch (error) {
      console.error('Erro ao verificar permissão de rede:', error);
      return false;
    }
  },

  // Solicita permissão de rede (só uma vez)
  async requestNetworkPermission() {
    try {
      // Verifica se já foi perguntado antes
      const hasPermission = await this.checkNetworkPermission();
      if (hasPermission) {
        return true;
      }

      // Verifica o status atual da rede
      const networkState = await Network.getNetworkStateAsync();
      console.log('Status da rede:', networkState);
      console.log('Plataforma:', Platform.OS);
      console.log('Versão Android:', Platform.Version);
      
      // Se já tem acesso à rede, salva como concedido
      if (networkState.isConnected) {
        await AsyncStorage.setItem(NETWORK_PERMISSION_KEY, 'granted');
        return true;
      }

      // Para redes locais, pode ser necessário configurar manualmente
      // Retorna true para permitir tentativas de conexão
      await AsyncStorage.setItem(NETWORK_PERMISSION_KEY, 'granted');
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão de rede:', error);
      // Em caso de erro, permite tentar mesmo assim
      await AsyncStorage.setItem(NETWORK_PERMISSION_KEY, 'granted');
      return true;
    }
  },

  // Reseta as permissões de rede (para testes)
  async resetNetworkPermission() {
    try {
      await AsyncStorage.removeItem(NETWORK_PERMISSION_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao resetar permissão de rede:', error);
      return false;
    }
  },

  // Verifica se o dispositivo está conectado à rede
  async isNetworkAvailable() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade da rede:', error);
      return false;
    }
  },

  // Verifica se pode acessar rede local específica
  async canAccessLocalNetwork(ipAddress) {
    try {
      // Para redes locais, sempre retorna true
      // O Android vai tentar a conexão mesmo assim
      return true;
    } catch (error) {
      console.error('Erro ao verificar acesso à rede local:', error);
      return true;
    }
  },

  // Função específica para Android 13
  async checkAndroid13NetworkAccess() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      console.log('Android 13+ detectado - verificando permissões especiais');
      
      // Para Android 13+, pode ser necessário verificar permissões adicionais
      try {
        const networkState = await Network.getNetworkStateAsync();
        console.log('Estado da rede no Android 13:', networkState);
        
        // Verifica se tem acesso à rede Wi-Fi
        if (networkState.type === Network.NetworkStateType.WIFI) {
          console.log('Conectado via Wi-Fi - rede local deve funcionar');
          return true;
        }
        
        return networkState.isConnected;
      } catch (error) {
        console.error('Erro ao verificar rede no Android 13:', error);
        return true; // Permite tentar mesmo assim
      }
    }
    
    return true;
  }
};
