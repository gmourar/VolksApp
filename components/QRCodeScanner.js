import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { ConfigStorage } from '../utils/ConfigStorage';
import { API_BASE_URL } from '../utils/apiConfig';

const { width, height } = Dimensions.get('window');
const isLandscape = width > height;

export default function QRCodeScanner({ visible, onClose, onSuccess, onAlreadyDone, isProductionMode }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [scannedData, setScannedData] = useState(null); // Para armazenar dados do QR lido
  const cameraRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      requestCameraPermission();
      resetStates();
    } else {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    }
  }, [visible]);

  const resetStates = () => {
    setScanned(false);
    setIsProcessing(false);
    setCameraReady(false);
    setScannedData(null);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
  };

  const requestCameraPermission = async () => {
    try {
      console.log('Solicitando permissão da câmera...');
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('Status da permissão:', status);
      
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          'Permissão Negada', 
          'É necessário permitir o acesso à câmera para usar o leitor de QR code.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setHasPermission(false);
    }
  };

  const onCameraReady = () => {
    console.log('Câmera está pronta');
    setCameraReady(true);
  };

  // Gera timestamp ISO 8601 com timezone
  const generateClientAttemptAt = () => {
    // Ajuste para fuso horário de Brasília (UTC-3)
    const nowBrasilia = new Date(Date.now() - (3 * 60 * 60 * 1000));
    // Força o offset de Brasília
    const iso = nowBrasilia.toISOString().replace('Z', '-03:00');
    return iso;
  };

  // Função dedicada para processar resposta do servidor
  const processServerResponse = (responseData) => {
    console.log('=== PROCESSANDO RESPOSTA DO SERVIDOR ===');
    console.log(JSON.stringify(responseData, null, 2));
    
    if (!responseData) {
      console.log('Resposta vazia - tratando como erro');
      return 'error';
    }

    // Extrai informações da resposta
    const sucesso = responseData.sucesso;
    const status = responseData.status ? responseData.status.toString().toLowerCase() : '';
    const errorMessage = responseData?.erros?.erro || responseData?.erro || responseData?.message || '';
    
    console.log('ANÁLISE:');
    console.log('- sucesso:', sucesso);
    console.log('- status:', status);
    console.log('- errorMessage:', errorMessage);

    // PRIORIDADE 1: Verificar se atividade já foi realizada
    if (sucesso === false) {
      console.log('SUCESSO = FALSE detectado');
      
      // Verifica se é especificamente "já realizada"
      if (errorMessage && errorMessage.toLowerCase().includes('já realizada')) {
        console.log('DECISÃO: ALREADY_DONE (atividade já realizada)');
        return 'already_done';
      }
      
      // Outros erros com sucesso = false
      console.log('DECISÃO: ERROR (erro genérico)');
      return 'error';
    }

    // PRIORIDADE 2: Verificar sucesso verdadeiro
    if (sucesso === true || status === 'success') {
      console.log('DECISÃO: SUCCESS');
      return 'success';
    }

    console.log('DECISÃO: ERROR (resposta inesperada)');
    return 'error';
  };

  // Função para executar ação baseada no resultado
  const executeAction = (result) => {
    console.log('EXECUTANDO AÇÃO:', result);
    
    switch (result) {
      case 'success':
        console.log('Chamando onSuccess()');
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
        break;
        
      case 'already_done':
        console.log('Chamando onAlreadyDone()');
        if (onAlreadyDone && typeof onAlreadyDone === 'function') {
          onAlreadyDone();
        }
        break;
        
      case 'error':
      default:
        console.log('Chamando onAlreadyDone() (erro)');
        if (onAlreadyDone && typeof onAlreadyDone === 'function') {
          onAlreadyDone();
        }
        break;
    }
  };

  // Função para realizar o registro da atividade
  const registerActivity = async (data) => {
    try {
      const standName = (await ConfigStorage.getAtividade()) || 'the one';
      const tabletName = (await ConfigStorage.getTabletId()) || 'TABLET_001';
      
      let response, responseData;

      if (isProductionMode) {
        // MODO PRODUÇÃO
        console.log('MODO PRODUÇÃO - enviando para /activity/validate');
        
        const prodBody = JSON.stringify({
          cpf: data.trim(),
          method: 'qrcode',
          stand_name: standName.toLowerCase(),
          tablet_name: tabletName,
          client_created_at: generateClientAttemptAt(),
        });

        response = await fetch(`${API_BASE_URL}/activity/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Token': 'f8331af6befa173f8cec0bc46df542',
          },
          body: prodBody,
        });
        
        responseData = await response.json().catch(() => null);
        console.log('Resposta PRODUÇÃO:', responseData);
        
      } else {
        // MODO LOCAL
        console.log('MODO LOCAL - enviando para /activity-qr');
        
        const localBody = JSON.stringify({
          cpf: data.trim(),
          method: 'qrcode',
          stand_name: standName.toLowerCase(),
          tablet_name: tabletName,
          client_validated_at: generateClientAttemptAt(),
        });

        const localBaseUrl = await ConfigStorage.getLocalBaseUrl();
        const normalizedBaseUrl = localBaseUrl ? localBaseUrl.replace(/\/$/, '') : '';
        const localUrl = `${normalizedBaseUrl}/activity-qr`;
        
        response = await fetch(localUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: localBody,
        });
        
        responseData = await response.json().catch(() => null);
        console.log('Resposta LOCAL:', responseData);
      }

      // Processa resposta e executa ação
      const result = processServerResponse(responseData);
      executeAction(result);

    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      resetStates();
      Alert.alert(
        'Erro de Conexão',
        'Não foi possível conectar ao servidor. Tente novamente.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Função chamada quando QR é lido - agora só mostra confirmação
  const handleBarCodeScanned = async ({ data, type }) => {
    // Previne múltiplas leituras
    if (scanned || isProcessing || !cameraReady) {
      console.log('Ignorando leitura:', { scanned, isProcessing, cameraReady });
      return;
    }

    // Valida se o data não está vazio
    if (!data || data.trim() === '') {
      console.log('QR Code vazio ignorado');
      return;
    }

    console.log('QR Code lido:', { data, type });
    setScanned(true);
    setScannedData(data.trim());

    // Mostra confirmação antes de registrar
    Alert.alert(
      'QR Code Lido com Sucesso!',
      'Deseja registrar a entrada no estande?',
      [
        {
          text: 'Não',
          style: 'cancel',
          onPress: () => {
            console.log('Usuário optou por não registrar atividade');
            Alert.alert(
              'QR Code Verificado', 
              'QR Code lido com sucesso, mas a atividade não foi registrada.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    resetStates();
                    // Não fecha o modal, permite continuar lendo
                  }
                }
              ]
            );
          }
        },
        {
          text: 'Sim',
          onPress: async () => {
            setIsProcessing(true);
            console.log('Usuário confirmou - registrando atividade');
            
            // Timeout para permitir nova leitura caso falhe
            scanTimeoutRef.current = setTimeout(() => {
              console.log('Timeout na leitura do QR, resetando estados');
              resetStates();
            }, 10000);

            await registerActivity(scannedData);
          }
        }
      ]
    );
  };

  const handleClose = () => {
    resetStates();
    onClose();
  };

  if (hasPermission === null) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.loadingText}>Solicitando permissão da câmera...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.errorText}>Sem acesso à câmera</Text>
            <Text style={styles.errorSubtext}>
              É necessário permitir o acesso à câmera para usar o leitor de QR code.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Calcula dimensões para manter aspect ratio correto
  const cameraHeight = isLandscape ? height - 120 : width * (4/3);
  const scanAreaSize = Math.min(width * 0.5, height * 0.4);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Leitor de QR Code</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Camera View */}
        <View style={[styles.cameraContainer, { height: cameraHeight }]}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            onCameraReady={onCameraReady}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            autofocus="on"
          >
            {/* Overlay com área de foco */}
            <View style={styles.overlay}>
              <View style={[styles.scanArea, { width: scanAreaSize, height: scanAreaSize }]}>
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                
                {/* Linha de scan animada */}
                {!scanned && cameraReady && (
                  <View style={styles.scanLine} />
                )}
              </View>
              
              {scanned && !isProcessing && (
                <View style={styles.successOverlay}>
                  <Text style={styles.successText}>✓ QR Code Lido!</Text>
                  <Text style={styles.processingText}>Aguardando confirmação...</Text>
                </View>
              )}

              {isProcessing && (
                <View style={styles.successOverlay}>
                  <Text style={styles.successText}>✓ QR Code Lido!</Text>
                  <Text style={styles.processingText}>Registrando atividade...</Text>
                </View>
              )}
            </View>
          </CameraView>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            {isProcessing 
              ? 'Registrando atividade...' 
              : scanned 
                ? 'QR Code lido! Aguardando confirmação...' 
                : cameraReady 
                  ? 'Posicione o QR code dentro da área verde' 
                  : 'Inicializando câmera...'}
          </Text>
          
          {!scanned && cameraReady && (
            <Text style={styles.subInstructionsText}>
              Mantenha o QR code bem visível e aguarde a leitura automática
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scanArea: {
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4CAF50',
    borderWidth: 4,
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    top: 'auto',
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    top: 'auto',
    left: 'auto',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#4CAF50',
    opacity: 0.8,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  successText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  instructions: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    minHeight: 80,
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  subInstructionsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});