import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function PromoterModal({ visible, onClose, isProductionMode, onToggleMode }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const PROMOTER_PASSWORD = '1234';

  const handleLogin = () => {
    if (password === PROMOTER_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  const handleClose = () => {
    setPassword('');
    setIsAuthenticated(false);
    setError('');
    onClose();
  };

  const isTablet = width >= 768;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={[
          styles.modalView,
          isTablet ? styles.modalViewTablet : styles.modalViewMobile
        ]}>
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>👤</Text>
            </View>
            <Text style={[
              styles.modalTitle,
              isTablet ? styles.modalTitleTablet : styles.modalTitleMobile
            ]}>
              Área do Promotor
            </Text>
          </View>

          {!isAuthenticated ? (
            <View style={styles.loginContainer}>
              <Text style={styles.label}>Senha do Promotor:</Text>
              <TextInput
                style={[
                  styles.textInput,
                  error && styles.textInputError
                ]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError('');
                }}
                placeholder="Digite a senha"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
                autoFocus
              />
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.enterButton,
                    (!password || password.length === 0) && styles.disabledButton
                  ]}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  disabled={!password || password.length === 0}
                >
                  <Text style={[
                    styles.enterButtonText,
                    (!password || password.length === 0) && styles.enterButtonTextDisabled
                  ]}>Entrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.dashboardContainer}>
              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Modo atual:</Text>
                <View style={[
                  styles.modeBadge,
                  isProductionMode ? styles.modeBadgeProduction : styles.modeBadgeLocal
                ]}>
                  <Text style={[
                    styles.modeText,
                    isProductionMode ? styles.modeTextProduction : styles.modeTextLocal
                  ]}>
                    {isProductionMode ? 'PRODUÇÃO' : 'LOCAL'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.toggleButton,
                  isProductionMode ? styles.toggleButtonToLocal : styles.toggleButtonToProduction
                ]} 
                onPress={onToggleMode}
                activeOpacity={0.8}
              >
                <Text style={styles.toggleButtonText}>
                  Alternar para {isProductionMode ? 'LOCAL' : 'PRODUÇÃO'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.logoutButton]} 
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          )}
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
    padding: 25,
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
    width: 450,
  },
  modalViewMobile: {
    width: width * 0.85,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 235, 59, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 235, 59, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconText: {
    fontSize: 24,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#FFEB3B',
    textAlign: 'center',
  },
  modalTitleTablet: {
    fontSize: 24,
  },
  modalTitleMobile: {
    fontSize: 20,
  },
  loginContainer: {
    width: '100%',
    alignItems: 'center',
  },
  dashboardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    alignSelf: 'flex-start',
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
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  textInputError: {
    borderColor: '#FF5252',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 15,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  modeBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  modeBadgeProduction: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderColor: '#2196F3',
  },
  modeBadgeLocal: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  modeText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modeTextProduction: {
    color: '#2196F3',
  },
  modeTextLocal: {
    color: '#4CAF50',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
    width: '100%',
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
  enterButtonTextDisabled: {
    color: '#888',
    opacity: 0.7,
  },
  toggleButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toggleButtonToLocal: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  toggleButtonToProduction: {
    backgroundColor: '#2196F3',
    shadowColor: '#2196F3',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '60%',
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
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoutButtonText: {
    color: '#FFEB3B',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});