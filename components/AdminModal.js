import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { ConfigStorage } from '../utils/configStorage';

const { width, height } = Dimensions.get('window');

export default function AdminModal({ visible, onClose }) {
  const [stand, setStand] = useState(1);
  const [tabletId, setTabletId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localBaseUrl, setLocalBaseUrl] = useState('');
  const [atividade, setAtividade] = useState('the one');

  useEffect(() => {
    if (visible) {
      loadConfig();
    }
  }, [visible]);

  const loadConfig = async () => {
    try {
      const config = await ConfigStorage.getAllConfig();
      setStand(config.stand);
      setTabletId(config.tabletId);
      setLocalBaseUrl(config.localBaseUrl || 'http://192.168.0.34:8000');
      setAtividade((config.atividade || 'the one').toLowerCase());
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      // Validações
      if (!tabletId.trim()) {
        Alert.alert('Erro', 'O ID do tablet é obrigatório');
        return;
      }

      if (stand < 1 || stand > 2) {
        Alert.alert('Erro', 'O stand deve ser 1 ou 2');
        return;
      }

      // Normaliza e valida URL do servidor local
      let normalizedBaseUrl = (localBaseUrl || '').trim();
      if (!normalizedBaseUrl) {
        Alert.alert('Erro', 'O endereço do servidor local é obrigatório');
        return;
      }
      if (!/^https?:\/\//i.test(normalizedBaseUrl)) {
        normalizedBaseUrl = 'http://' + normalizedBaseUrl;
      }
      normalizedBaseUrl = normalizedBaseUrl.replace(/\/$/, '');

      // Salva configurações
      await ConfigStorage.setStand(stand);
      await ConfigStorage.setTabletId(tabletId.trim());
      await ConfigStorage.setLocalBaseUrl(normalizedBaseUrl);
      await ConfigStorage.setAtividade(atividade);

      // Salva nova senha se fornecida
      if (newPassword.trim()) {
        if (newPassword !== confirmPassword) {
          Alert.alert('Erro', 'As senhas não coincidem');
          return;
        }
        if (newPassword.length < 4) {
          Alert.alert('Erro', 'A senha deve ter pelo menos 4 caracteres');
          return;
        }
        await ConfigStorage.setAdminPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Erro ao salvar configurações');
    }
  };

  const handleCancel = () => {
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const isTablet = width >= 768;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.centeredView}>
        <View style={[
          styles.modalView,
          isTablet ? styles.modalViewTablet : styles.modalViewMobile
        ]}>
          <Text style={[
            styles.modalTitle,
            isTablet ? styles.modalTitleTablet : styles.modalTitleMobile
          ]}>
            Configurações Admin
          </Text>

          <ScrollView 
            contentContainerStyle={styles.scrollContainer} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Configuração de Atividade (Estande) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Estande/Atividade:</Text>
              <View style={styles.standContainer}>
                <TouchableOpacity
                  style={[
                    styles.standButton,
                    atividade === 'the one' && styles.standButtonActive
                  ]}
                  onPress={() => setAtividade('the one')}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.standButtonText,
                    atividade === 'the one' && styles.standButtonTextActive
                  ]}>
                    The One
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.standButton,
                    atividade === 'skyline' && styles.standButtonActive
                  ]}
                  onPress={() => setAtividade('skyline')}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.standButtonText,
                    atividade === 'skyline' && styles.standButtonTextActive
                  ]}>
                    Skyline
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Configuração do ID do Tablet */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>ID do Tablet:</Text>
              <TextInput
                style={[
                  styles.textInput,
                  isTablet ? styles.textInputTablet : styles.textInputMobile
                ]}
                value={tabletId}
                onChangeText={setTabletId}
                placeholder="Ex: TABLET_001"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            {/* Configuração do Servidor Local */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Servidor Local (IP:porta):</Text>
              <TextInput
                style={[
                  styles.textInput,
                  isTablet ? styles.textInputTablet : styles.textInputMobile
                ]}
                value={localBaseUrl}
                onChangeText={setLocalBaseUrl}
                placeholder="http://192.168.0.34:8000"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Alteração de Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nova Senha (opcional):</Text>
              <TextInput
                style={[
                  styles.textInput,
                  isTablet ? styles.textInputTablet : styles.textInputMobile
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nova senha"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
              />
              <TextInput
                style={[
                  styles.textInput,
                  isTablet ? styles.textInputTablet : styles.textInputMobile,
                  styles.confirmPasswordInput
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar nova senha"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
              />
            </View>
          </ScrollView>

          {/* Botões */}
          <View style={[
            styles.buttonContainer,
            isTablet ? styles.buttonContainerTablet : styles.buttonContainerMobile
          ]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveConfig}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
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
    padding: 20,
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
    width: 500,
    maxHeight: height * 0.8,
  },
  modalViewMobile: {
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  scrollContainer: {
    paddingBottom: 10,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFEB3B',
    textAlign: 'center',
  },
  modalTitleTablet: {
    fontSize: 24,
  },
  modalTitleMobile: {
    fontSize: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  standContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  standButton: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  standButtonActive: {
    borderColor: '#FFEB3B',
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
  standButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  standButtonTextActive: {
    color: '#000000',
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
    width: '100%',
  },
  textInputTablet: {
    height: 50,
    fontSize: 16,
  },
  textInputMobile: {
    height: 45,
    fontSize: 16,
  },
  confirmPasswordInput: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
    width: '100%',
    justifyContent: 'center',
  },
  buttonContainerTablet: {
    gap: 20,
  },
  buttonContainerMobile: {
    gap: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  saveButton: {
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
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});