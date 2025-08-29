import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';

import AdminModal from '../components/AdminModal';
import PasswordModal from '../components/PasswordModal';
import QRCodeScanner from '../components/QRCodeScanner';
import SuccessScreen from '../components/SuccessScreen.js';
import PromoterModal from '../components/PromoterModal';
import { ConfigStorage } from '../utils/ConfigStorage.js';
import AlreadyDoneScreen from '../components/AlreadyDoneScreen';
import { testAsyncStorage } from '../utils/testAsyncStorage';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  // Detecta se é tablet ou celular baseado na largura da tela
  const isTablet = width >= 768;
  
  // Estados para os modais
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showPromoterModal, setShowPromoterModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAlreadyDoneScreen, setShowAlreadyDoneScreen] = useState(false);
  const [alreadyDoneMessage, setAlreadyDoneMessage] = useState('Atividade já realizada.');
  const [isProductionMode, setIsProductionMode] = useState(true); // padrão: produção

  const handleToggleMode = () => {
    setIsProductionMode((prev) => {
      const novo = !prev;
      console.log('Modo alterado para', novo ? 'PRODUÇÃO' : 'LOCAL');
      return novo;
    });
  };
  
  // Estados para as configurações
  const [currentStand, setCurrentStand] = useState(1);
  const [currentAtividade, setCurrentAtividade] = useState('the one');
  const [currentTabletId, setCurrentTabletId] = useState('TABLET_001');

  useEffect(() => {
    // Inicializa as configurações e carrega os valores atuais
    initializeConfig();
  }, []);

  const initializeConfig = async () => {
    try {
      // Verifica se o ConfigStorage está disponível
      if (!ConfigStorage || typeof ConfigStorage.initializeConfig !== 'function') {
        console.error('ConfigStorage não está disponível');
        return;
      }

      await ConfigStorage.initializeConfig();
      await loadCurrentConfig();
    } catch (error) {
      console.error('Erro ao inicializar configurações:', error);
      // Define valores padrão em caso de erro
      setCurrentStand(1);
      setCurrentAtividade('the one');
      setCurrentTabletId('TABLET_001');
    }
  };

  const loadCurrentConfig = async () => {
    try {
      if (!ConfigStorage || typeof ConfigStorage.getAllConfig !== 'function') {
        console.error('ConfigStorage não está disponível');
        return;
      }

      const config = await ConfigStorage.getAllConfig();
      setCurrentStand(config.stand || 1);
      setCurrentAtividade((config.atividade || 'the one'));
      setCurrentTabletId(config.tabletId || 'TABLET_001');
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Define valores padrão em caso de erro
      setCurrentStand(1);
      setCurrentAtividade('the one');
      setCurrentTabletId('TABLET_001');
    }
  };

  const handleAdminAccess = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = () => {
    setShowAdminModal(true);
  };

  const handleAdminModalClose = () => {
    setShowAdminModal(false);
    // Recarrega as configurações após fechar o modal
    loadCurrentConfig();
  };

  const handleQRCode = () => {
    setShowQRScanner(true);
  };

  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessScreen(true);
  };

  const handleSuccessComplete = () => {
    setShowSuccessScreen(false);
    setShowQRScanner(false);
  };

  const handleNewUser = () => {
    navigation.navigate('Registration', { isProductionMode });
  };

  const handleVerifyCPF = () => {
    // TODO: Implementar funcionalidade de verificação de CPF
    alert('IMPLEMENTAR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[
        styles.adminArea,
        isTablet ? styles.adminAreaTablet : styles.adminAreaMobile
      ]}>
        <View style={styles.adminInfo}>
          <Text style={[
            styles.adminLabel,
            isTablet ? styles.adminLabelTablet : styles.adminLabelMobile
          ]}>
            Stand: {currentAtividade} | Tablet: {currentTabletId}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.adminButton,
            isTablet ? styles.adminButtonTablet : styles.adminButtonMobile
          ]}
          onPress={() => setShowPromoterModal(true)}
        >
          <Text style={[
            styles.adminButtonText,
            isTablet ? styles.adminButtonTextTablet : styles.adminButtonTextMobile
          ]}>
            Promotor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.adminButton,
            isTablet ? styles.adminButtonTablet : styles.adminButtonMobile
          ]}
          onPress={handleAdminAccess}
        >
          <Text style={[
            styles.adminButtonText,
            isTablet ? styles.adminButtonTextTablet : styles.adminButtonTextMobile
          ]}>
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.serverInfoContainer}>
        <View style={[
          styles.serverBadge,
          isProductionMode ? styles.serverProdBadge : styles.serverLocalBadge
        ]}>
          <Text style={[
            styles.serverInfoText, 
            isProductionMode ? styles.serverProd : styles.serverLocal
          ]}>
            Servidor: {isProductionMode ? 'Produção' : 'Local'}
          </Text>
        </View>
      </View>

      {/* Conteúdo Principal */}
      <View style={[
        styles.content,
        isTablet ? styles.contentTablet : styles.contentMobile
      ]}>
        <View style={[
          styles.buttonContainer,
          isTablet ? styles.buttonContainerTablet : styles.buttonContainerMobile
        ]}>
          <TouchableOpacity 
            style={[
              styles.button,
              styles.primaryButton,
              isTablet ? styles.buttonTablet : styles.buttonMobile
            ]} 
            onPress={handleNewUser}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={[
                styles.buttonText,
                styles.primaryButtonText,
                isTablet ? styles.buttonTextTablet : styles.buttonTextMobile
              ]}>Novo Usuário</Text>
              <Text style={[
                styles.buttonSubText,
                isTablet ? styles.buttonSubTextTablet : styles.buttonSubTextMobile
              ]}>Registrar participante</Text>
            </View>
            <View style={[
              styles.buttonGlow,
              isTablet ? styles.buttonGlowTablet : styles.buttonGlowMobile
            ]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.button,
              styles.secondaryButton,
              isTablet ? styles.buttonTablet : styles.buttonMobile
            ]} 
            onPress={handleQRCode}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={[
                styles.buttonText,
                styles.secondaryButtonText,
                isTablet ? styles.buttonTextTablet : styles.buttonTextMobile
              ]}>Ler QR Code</Text>
              <Text style={[
                styles.buttonSubText,
                isTablet ? styles.buttonSubTextTabletSec : styles.buttonSubTextMobile
              ]}>Escanear código</Text>
            </View>
            <View style={[
              styles.buttonGlow,
              styles.secondaryButtonGlow,
              isTablet ? styles.buttonGlowTablet : styles.buttonGlowMobile
            ]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 PicBrand
        </Text>
        <Text style={styles.footerSubText}>
          Promoção voudevolks
        </Text>
      </View>

      {/* Modais */}
      <PasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />
      
      <AdminModal
        visible={showAdminModal}
        onClose={handleAdminModalClose}
      />

      <QRCodeScanner
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        isProductionMode={isProductionMode}
        onSuccess={() => {
          setSuccessMessage('Atividade registrada com sucesso!');
          setShowSuccessScreen(true);
          setShowQRScanner(false);
        }}
        onAlreadyDone={() => {
          setAlreadyDoneMessage('Atividade já realizada.');
          setShowAlreadyDoneScreen(true);
          setShowQRScanner(false);
        }}
      />

      <PromoterModal
        visible={showPromoterModal}
        onClose={() => setShowPromoterModal(false)}
        isProductionMode={isProductionMode}
        onToggleMode={handleToggleMode}
      />

      {/* Tela de Sucesso */}
      <SuccessScreen
        visible={showSuccessScreen}
        message={successMessage}
        onComplete={handleSuccessComplete}
      />

      {/* Tela de Atividade Já Realizada */}
      <AlreadyDoneScreen
        visible={showAlreadyDoneScreen}
        message={alreadyDoneMessage}
        onComplete={() => {
          setShowAlreadyDoneScreen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Brand dark
  },
  
  // Área de Admin - Dark theme
  adminArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e4ff04',
  },
  adminAreaTablet: {
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  adminAreaMobile: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  adminInfo: {
    flex: 1,
  },
  adminLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  adminLabelTablet: {
    fontSize: 16,
  },
  adminLabelMobile: {
    fontSize: 14,
  },
  
  // Botões admin com gradiente amarelo
  adminButton: {
    backgroundColor: '#e4ff04', // Brand yellow
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 10,
    shadowColor: '#e4ff04',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  adminButtonTablet: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  adminButtonMobile: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  adminButtonText: {
    color: '#000000',
    fontWeight: '700',
  },
  adminButtonTextTablet: {
    fontSize: 16,
  },
  adminButtonMobile: {
    fontSize: 14,
  },
  
  // Server info com badge moderno
  serverInfoContainer: {
    alignItems: 'flex-end',
    padding: 12,
    paddingRight: 20,
  },
  serverBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  serverProdBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  serverLocalBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  serverInfoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serverProd: {
    color: '#2196F3',
  },
  serverLocal: {
    color: '#4CAF50',
  },
  
  // Conteúdo principal
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentTablet: {
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  contentMobile: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  
  // Container dos botões
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 20,
  },
  buttonContainerTablet: {
    flexDirection: 'row',
    gap: 30,
    maxWidth: 800,
  },
  buttonContainerMobile: {
    flexDirection: 'column',
    gap: 20,
    maxWidth: 350,
  },
  
  // Botões principais com design moderno
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonTablet: {
    padding: 40,
    width: Math.min((width - 120) / 2.2, 280),
    minHeight: 200,
  },
  buttonMobile: {
    padding: 32,
    width: Math.min(width - 40, 320),
    minHeight: 140,
  },
  
  // Botão primário (Novo Usuário)
  primaryButton: {
    backgroundColor: '#e4ff04', // Brand yellow
    shadowColor: '#e4ff04',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  
  // Botão secundário (QR Code)
  secondaryButton: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#e4ff04',
    shadowColor: '#e4ff04',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  
  // Conteúdo do botão
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  

  
  // Texto principal do botão
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  buttonTextTablet: {
    fontSize: 20,
  },
  buttonTextMobile: {
    fontSize: 18,
  },
  primaryButtonText: {
    color: '#000000',
  },
  secondaryButtonText: {
    color: '#e4ff04',
  },
  
  // Subtexto do botão
  buttonSubText: {
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonSubTextTabletSec: {
    fontSize: 14,
    color: '#e4ff04'
  },
  buttonSubTextMobile: {
    fontSize: 12,
  },
  
  // Efeito glow nos botões
  buttonGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#e4ff04',
    opacity: 0.1,
    borderRadius: 30,
    zIndex: 1,
  },
  buttonGlowTablet: {
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
  },
  buttonGlowMobile: {
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
  },
  secondaryButtonGlow: {
    backgroundColor: '#e4ff04',
    opacity: 0.05,
  },
  

  
  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e4ff04',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  footerSubText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 4,
  },
});