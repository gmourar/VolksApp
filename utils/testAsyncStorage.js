import AsyncStorage from '@react-native-async-storage/async-storage';

export const testAsyncStorage = async () => {
  try {
    console.log('Testando AsyncStorage...');
    
    // Testa se o AsyncStorage está disponível
    if (!AsyncStorage) {
      console.error('AsyncStorage não está disponível');
      return false;
    }

    // Testa operações básicas
    const testKey = 'test_key';
    const testValue = 'test_value';
    
    // Testa escrita
    await AsyncStorage.setItem(testKey, testValue);
    console.log('Escrita no AsyncStorage funcionando');
    
    // Testa leitura
    const readValue = await AsyncStorage.getItem(testKey);
    if (readValue === testValue) {
      console.log('Leitura do AsyncStorage funcionando');
    } else {
      console.error('Leitura do AsyncStorage falhou');
      return false;
    }
    
    // Testa remoção
    await AsyncStorage.removeItem(testKey);
    const removedValue = await AsyncStorage.getItem(testKey);
    if (removedValue === null) {
      console.log('Remoção do AsyncStorage funcionando');
    } else {
      console.error('Remoção do AsyncStorage falhou');
      return false;
    }
    
    console.log('AsyncStorage está funcionando perfeitamente!');
    return true;
    
  } catch (error) {
    console.error('Erro ao testar AsyncStorage:', error);
    return false;
  }
};

// Função para limpar todas as configurações (útil para debug)
export const clearAllConfig = async () => {
  try {
    const keys = [
      'stand',
      'tablet_id', 
      'admin_password'
    ];
    
    await AsyncStorage.multiRemove(keys);
    console.log('Todas as configurações foram limpas');
    return true;
  } catch (error) {
    console.error('Erro ao limpar configurações:', error);
    return false;
  }
};
