import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { ConfigStorage } from '../utils/configStorage';

const { width, height } = Dimensions.get('window');

export default function PasswordModal({ visible, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyPassword = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (!password.trim()) {
        Alert.alert('Erro', 'Por favor, digite a senha');
        return;
      }

      if (!ConfigStorage || typeof ConfigStorage.verifyPassword !== 'function') {
        console.error('ConfigStorage não está disponível');
        Alert.alert('Erro', 'Sistema de configuração não disponível');
        return;
      }

      const isValid = await ConfigStorage.verifyPassword(password);
      
      if (isValid) {
        setPassword('');
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
        onClose();
      } else {
        Alert.alert('Erro', 'Senha incorreta');
        setPassword('');
      }
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      Alert.alert('Erro', 'Erro ao verificar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter') {
      handleVerifyPassword();
    }
  };

  const isTablet = width >= 768;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.centeredView}>
        <View style={[
          styles.modalView,
          isTablet ? styles.modalViewTablet : styles.modalViewMobile
        ]}>
          <View style={styles.iconContainer}>
            <View style={styles.lockIcon}>
              <Text style={styles.lockIconText}>🔒</Text>
            </View>
          </View>

          <Text style={[
            styles.modalTitle,
            isTablet ? styles.modalTitleTablet : styles.modalTitleMobile
          ]}>
            Acesso Admin
          </Text>
          
          <Text style={styles.modalSubtitle}>
            Digite a senha para acessar as configurações
          </Text>

          <TextInput
            style={[
              styles.textInput,
              isTablet ? styles.textInputTablet : styles.textInputMobile
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            secureTextEntry
            autoFocus
            onKeyPress={handleKeyPress}
            editable={!isLoading}
          />

          <View style={[
            styles.buttonContainer,
            isTablet ? styles.buttonContainerTablet : styles.buttonContainerMobile
          ]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button, 
                styles.enterButton,
                isLoading && styles.enterButtonDisabled
              ]}
              onPress={handleVerifyPassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.enterButtonText}>
                {isLoading ? 'Verificando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 235, 59, 0.3)',
    shadowColor: '#FFEB3B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalViewTablet: {
    width: 400,
  },
  modalViewMobile: {
    width: width * 0.85,
  },
  iconContainer: {
    marginBottom: 20,
  },
  lockIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 235, 59, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 235, 59, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIconText: {
    fontSize: 24,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFEB3B',
    textAlign: 'center',
  },
  modalTitleTablet: {
    fontSize: 24,
  },
  modalTitleMobile: {
    fontSize: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
    width: '100%',
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: '500',
  },
  textInputTablet: {
    height: 55,
  },
  textInputMobile: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  buttonContainerTablet: {
    gap: 20,
  },
  buttonContainerMobile: {
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  enterButton: {
    backgroundColor: '#FFEB3B',
    shadowColor: '#FFEB3B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  enterButtonDisabled: {
    backgroundColor: 'rgba(255, 235, 59, 0.3)',
    shadowOpacity: 0.1,
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  enterButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});