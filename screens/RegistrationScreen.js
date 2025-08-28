import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import SuccessScreen from '../components/SuccessScreen.js';
import AlreadyDoneScreen from '../components/AlreadyDoneScreen';
import { NetworkPermissions } from '../utils/networkPermissions';
import { ConfigStorage } from '../utils/ConfigStorage.js';
import { API_BASE_URL } from '../utils/apiConfig';

const { width } = Dimensions.get('window');

export default function RegistrationScreen({ navigation, isProductionMode }) {
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [dateBirthday, setDateBirthday] = useState('');
  const [showOtherFields, setShowOtherFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showAlreadyDoneScreen, setShowAlreadyDoneScreen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [alreadyDoneMessage, setAlreadyDoneMessage] = useState('Atividade já realizada.');
  const [networkPermissionGranted, setNetworkPermissionGranted] = useState(false);

  // Detecta se é tablet ou celular baseado na largura da tela
  const isTablet = width >= 768;

  useEffect(() => {
    // Verifica permissões de rede ao montar o componente
    checkNetworkPermissions();
  }, []);

  // Função para gerar data de criação no formato ISO 8601 com timezone
  const generateClientCreatedAt = () => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset();
    const timezoneHours = Math.abs(Math.floor(timezoneOffset / 60));
    const timezoneMinutes = Math.abs(timezoneOffset % 60);
    const timezoneSign = timezoneOffset <= 0 ? '+' : '-';
    const timezoneString = `${timezoneSign}${timezoneHours.toString().padStart(2, '0')}:${timezoneMinutes.toString().padStart(2, '0')}`;

    return now.toISOString().replace('Z', timezoneString);
  };

  // Função para formatar data de nascimento (DD/MM/AAAA)
  const formatDateBirthday = (text) => {
    // Permite apagar '/' normalmente e só adiciona quando necessário
    let cleaned = text.replace(/[^\d]/g, '');
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = cleaned.slice(0, 2);
    }
    if (cleaned.length > 2) {
      formatted += '/' + cleaned.slice(2, 4);
    }
    if (cleaned.length > 4) {
      formatted += '/' + cleaned.slice(4, 8);
    }
    setDateBirthday(formatted);
  };

  // Função para converter data de nascimento para formato ISO (YYYY-MM-DD)
  const convertDateToISO = (dateString) => {
    if (!dateString || dateString.length !== 10) return null;

    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    return `${year}-${month}-${day}`;
  };

  const checkNetworkPermissions = async () => {
    try {
      const hasPermission = await NetworkPermissions.requestNetworkPermission();
      const android13Access = await NetworkPermissions.checkAndroid13NetworkAccess();

      console.log('Permissão básica:', hasPermission);
      console.log('Acesso Android 13:', android13Access);

      setNetworkPermissionGranted(hasPermission && android13Access);
    } catch (error) {
      console.error('Erro ao verificar permissões de rede:', error);
      setNetworkPermissionGranted(true); // Permite tentar mesmo assim
    }
  };

  // Registrar atividade do CPF no estande/atividade configurado
  // Retorna 'ok' quando sucesso; 'already' quando já realizada; lança erro para demais falhas
  const registerActivity = async () => {
    try {
      const standName = (await ConfigStorage.getAtividade()) || 'the one';
      const tabletName = await ConfigStorage.getTabletId();
      // Corrigir nome do campo e formato do body para produção
      const prodBody = JSON.stringify({
        cpf: displayCPF(cpf),
        method: "cpf",
        stand_name: standName.toLowerCase(),
        tablet_name: tabletName,
        client_validated_at: generateClientCreatedAt(),
      });
      const localBody = JSON.stringify({
        cpf: displayCPF(cpf),
        method: "cpf",
        stand_name: standName.toLowerCase(),
        tablet_name: tabletName,
        client_validated_at: generateClientCreatedAt(),
      });

      let response;
      if (isProductionMode) {
        console.log('Modo PRODUÇÃO - registrando atividade na API de produção');
        console.log('[PROD] URL:', `${API_BASE_URL}/activity/validate`);
        console.log('[PROD] Body:', prodBody);
        response = await fetch(`${API_BASE_URL}/activity/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Token': 'f8331af6befa173f8cec0bc46df542',
          },
          body: prodBody,
          signal: createTimeoutSignal(15000),
        });
        console.log('[PROD] Response Status:', response.status, response.statusText);
        console.log(prodBody)
        try {
          const responseHeaders = {};
          response.headers && response.headers.forEach && response.headers.forEach((v, k) => { responseHeaders[k] = v; });
          console.log('[PROD] Response Headers:', responseHeaders);
        } catch (e) {
          console.log('[PROD] Erro ao logar headers:', e);
        }
      } else {
        // Modo LOCAL - registra atividade no servidor local
        console.log('Modo LOCAL - registrando atividade no servidor local');
        const baseUrl = (await ConfigStorage.getLocalBaseUrl()) || 'http://192.168.0.34:8000';
        const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
        const localUrl = `${normalizedBaseUrl}/registrar-atividade`;
        try {
          response = await fetch(localUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: localBody,
            signal: createTimeoutSignal(15000),
          });
        } catch (err) {
          console.log('[ERRO DE CONEXÃO LOCALHOST - registrar-atividade]', err);
          Alert.alert('Erro ao conectar no backend local', `Não foi possível acessar o endpoint /registrar-atividade.\n\nMotivo: ${err && err.message ? err.message : err}`);
          throw err;
        }
      }

      const data = await response.json().catch(() => null);
      console.log('[PROD] Response Body:', data);
      // Sucesso direto
      if (response.ok && data && data.sucesso === true) {
        console.log('Atividade registrada no estande:', standName.toLowerCase());
        return 'ok';
      }
      // Produção/local: erro aninhado ou simples indicando atividade já realizada
      if (
        data &&
        data.sucesso === false && (
          (data.erros && typeof data.erros.erro === 'string' && data.erros.erro.toLowerCase().includes('atividade já realizada')) ||
          (typeof data.erro === 'string' && data.erro.toLowerCase().includes('atividade já realizada'))
        )
      ) {
        console.log('Atividade já realizada no estande:', standName.toLowerCase());
        return 'already';
      }
      console.log('[PROD] Falha ao registrar atividade. Status:', response.status, 'Body:', data);
      throw new Error('Falha ao registrar atividade');
    } catch (error) {
      console.log('Erro ao registrar atividade:', error);
      throw error;
    }
  };

  // Função para criar um timeout compatível com versões antigas
  const createTimeoutSignal = (timeoutMs) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    // Limpa o timeout se o sinal for abortado por outro motivo
    controller.signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
    });

    return controller.signal;
  };



  // Função para verificar CPF
  const checkCPF = async () => {
    if (cpf.length !== 11) {
      Alert.alert('Erro', 'CPF deve ter 11 dígitos');
      return;
    }

    if (!networkPermissionGranted) {
      Alert.alert(
        'Permissão de Rede Necessária',
        'Este app precisa de permissão para acessar a rede local.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Verificar Novamente', onPress: checkNetworkPermissions }
        ]
      );
      return;
    }

    setLoading(true);
    console.log('Verificando CPF:', cpf);
    console.log(`Modo selecionado: ${isProductionMode ? 'PRODUÇÃO' : 'LOCAL'}`);

    try {
      let response;
      const standName = (await ConfigStorage.getAtividade()) || 'the one';
      const tabletName = await ConfigStorage.getTabletId();

      if (isProductionMode) {
        // Modo PRODUÇÃO - verifica direto na API de produção
        console.log('Modo PRODUÇÃO - verificando CPF na API de produção');
        response = await fetch(`${API_BASE_URL}/cpf/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Token': 'f8331af6befa173f8cec0bc46df542',
          },
          body: JSON.stringify({ cpf: displayCPF(cpf),
                                stand_name: standName.toLowerCase(),
                                tablet_name: tabletName,
                                client_checked_at: generateClientCreatedAt(), }),
        });

        console.log('CPF Check Response Status:', response.status);
        const data = await response.json().catch(() => null);
        console.log('CPF Check Response Body:', data);

        if (response.ok && data && data.dados) {
          if (data.dados.existe === false) {
            setShowOtherFields(true);
            setShowSuccessScreen(false);
            console.log('CPF não existe. Abrindo campos para cadastro.');
          } else if (data.dados.existe === true) {
            // Prompt perguntando se deseja registrar a entrada
            Alert.alert(
              'CPF Verificado com Sucesso!',
              'Deseja registrar a entrada no estande?',
              [
                {
                  text: 'Não',
                  style: 'cancel',
                  onPress: () => {
                    console.log('Usuário optou por não registrar atividade');
                    Alert.alert('Verificado', 'CPF verificado com sucesso.', [
                      {
                        text: 'OK',
                        onPress: () => {
                          setShowSuccessScreen(false);
                          navigation.goBack();
                        }
                      }
                    ]);
                  }
                },
                {
                  text: 'Sim',
                  onPress: async () => {
                    try {
                      const status = await registerActivity();
                      setShowOtherFields(false);
                      if (status === 'ok') {
                        setSuccessMessage('CPF verificado e atividade registrada com sucesso!');
                        setShowSuccessScreen(true);
                      } else if (
                        (typeof status === 'string' && status === 'already') ||
                        (activityError && typeof activityError.message === 'string' && activityError.message.toLowerCase().includes('já registrada'))
                      ) {
                        setAlreadyDoneMessage('Atividade já realizada.');
                        setShowAlreadyDoneScreen(true);
                      } else {
                        setSuccessMessage('CPF verificado, mas não foi possível registrar a atividade.');
                        setShowSuccessScreen(true);
                      }
                      console.log('Atividade registrada no estande:', await ConfigStorage.getAtividade());
                    } catch (activityError) {
                      console.log('Erro ao registrar atividade:', activityError);
                      Alert.alert('Erro', 'Não foi possível registrar atividade. Tente novamente.');
                    }
                  }
                }
              ]
            );
          } else {
            Alert.alert('Atenção', 'Resposta inesperada do servidor.');
          }
        } else if (response.status === 400) {
          // fallback antigo: tratar 400 como não encontrado
          setShowOtherFields(true);
          console.log('CPF não encontrado (400). Abrindo campos para cadastro.');
        } else {
          Alert.alert('Erro', 'Erro ao verificar CPF. Tente novamente.');
        }
      } else {
        // Modo LOCAL - verifica no servidor local
        console.log('Modo LOCAL - verificando CPF no servidor local');
        const baseUrl = (await ConfigStorage.getLocalBaseUrl()) || 'http://192.168.0.34:8000';
        const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
        const localUrl = `${normalizedBaseUrl}/verificar-cpf`;

        const standName = (await ConfigStorage.getAtividade()) || 'the one';
        const tabletName = (await ConfigStorage.getTabletId()) || '';
        try {
          response = await fetch(localUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              cpf: cpf,
              stand_name: standName.toLowerCase(),
              tablet_name: tabletName,
            }),
          });
        } catch (err) {
          console.log('[ERRO DE CONEXÃO LOCALHOST - verificar-cpf]', err);
          Alert.alert('Erro ao conectar no backend local', `Não foi possível acessar o endpoint /verificar-cpf.\n\nMotivo: ${err && err.message ? err.message : err}`);
          throw err;
        }

        console.log('CPF Check Response Status:', response.status);
        const data = await response.json().catch(() => null);
        console.log('CPF Check Response Body (LOCAL):', data);

        if (response.ok && data) {
          if (data.status === 'success' && data.usuario) {
            // CPF encontrado na base local
            Alert.alert(
              'CPF encontrado!',
              'Deseja registrar uma atividade para este usuário?',
              [
                {
                  text: 'Não',
                  style: 'cancel',
                  onPress: () => {
                    setSuccessMessage('CPF verificado com sucesso!');
                    setShowSuccessScreen(true);
                  }
                },
                {
                  text: 'Sim',
                  onPress: async () => {
                    try {
                      // Monta body conforme padrão
                      const standName = (await ConfigStorage.getAtividade()) || 'the one';
                      const tabletName = (await ConfigStorage.getTabletId()) || '';
                      const activityBody = JSON.stringify({
                        cpf: cpf,
                        method: 'cpf',
                        stand_name: standName.toLowerCase(),
                        tablet_name: tabletName,
                        client_attempt_at: generateClientCreatedAt(),
                      });
                      const activityUrl = `${normalizedBaseUrl}/activity`;
                      const activityResp = await fetch(activityUrl, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json',
                        },
                        body: activityBody,
                        signal: createTimeoutSignal(15000),
                      });
                      const activityData = await activityResp.json().catch(() => null);
                      console.log('Registrar atividade resposta (LOCAL):', activityData);
                      if (
                        activityResp.ok && activityData &&
                        (activityData.sucesso === true || activityData.status === 'success')
                      ) {
                        setSuccessMessage('CPF verificado e atividade registrada com sucesso!');
                        setShowSuccessScreen(true);
                      } else if (
                        activityData &&
                        (activityData.sucesso === false || activityData.status === 'error') &&
                        ((typeof activityData.erro === 'string' && activityData.erro.toLowerCase().includes('atividade já realizada')) ||
                          (typeof activityData.message === 'string' && activityData.message.toLowerCase().includes('já registrada')))
                      ) {
                        setAlreadyDoneMessage('Atividade já realizada.');
                        setShowAlreadyDoneScreen(true);
                      } else {
                        setSuccessMessage('CPF verificado, mas não foi possível registrar a atividade.');
                        setShowSuccessScreen(true);
                      }
                    } catch (activityError) {
                      console.log('Erro ao registrar atividade (local):', activityError);
                      setSuccessMessage('CPF verificado, mas não foi possível registrar a atividade.');
                      setShowSuccessScreen(true);
                    }
                  }
                }
              ]
            );
          } else if (data.status === 'error' && data.message && data.message.toLowerCase().includes('não encontrado')) {
            // CPF não encontrado na base local
            setShowOtherFields(true);
            setShowSuccessScreen(false);
            console.log('CPF não encontrado localmente. Abrindo campos para cadastro.');
          } else {
            Alert.alert('Atenção', 'Resposta inesperada do servidor local.');
          }
        } else {
          Alert.alert('Erro', 'Erro ao verificar CPF local. Tente novamente.');
        }
      }
    } catch (error) {
      console.log('Erro na verificação do CPF:', error);
      Alert.alert('Erro de Conexão', 'Verifique sua conexão de rede e tente novamente.');
    } finally {
      setLoading(false);
    }
  };



  // Função para cadastrar usuário com modo selecionado
  const registerUser = async () => {
    if (!cpf || !name || !lastName || !email || !cellphone || !dateBirthday) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }

    // Validação (18+)
    const parts = dateBirthday.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // mês começa em 0
      const year = parseInt(parts[2], 10);
      const birthDate = new Date(year, month, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        Alert.alert('Cadastro não permitido', 'Você deve ter 18 anos ou mais para se cadastrar.');
        return;
      }
    }

    if (!networkPermissionGranted) {
      Alert.alert(
        'Permissão de Rede Necessária',
        'Este app precisa de permissão para acessar a rede local.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Verificar Novamente', onPress: checkNetworkPermissions }
        ]
      );
      return;
    }

    console.log('Iniciando cadastro de usuário...');
    console.log('Dados a serem enviados:', {
      cpf,
      name: `${name} ${lastName}`.trim(),
      email,
      phone: cellphone,
      date_birthday: dateBirthday,
    });
    console.log(`Modo selecionado: ${isProductionMode ? 'PRODUÇÃO' : 'LOCAL'}`);

    setLoading(true);

    try {
      if (isProductionMode) {
        // Modo produção - faz cadastro direto na produção
        console.log('Modo PRODUÇÃO - fazendo cadastro na API de produção');
        await registerUserInProduction();
      } else {
        // Modo local - faz cadastro direto no servidor local
        console.log('Modo LOCAL - fazendo cadastro no servidor local');
        await registerUserLocally();
      }

    } catch (error) {
      console.log('Erro geral no cadastro:', error);
      Alert.alert(
        'Erro de Conexão',
        `Erro ao conectar ao servidor ${isProductionMode ? 'de produção' : 'local'}. Tente novamente.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Função para cadastrar na API de produção
  const registerUserInProduction = async () => {
    console.log('Fazendo cadastro na API de produção...');

    try {
      // Obter o nome do tablet da configuração
      const tabletName = await ConfigStorage.getTabletId();
      console.log('[DEBUG] tabletName:', tabletName);

      const requestBodyProd = JSON.stringify({
        name: `${name} ${lastName}`.trim(),
        cpf: displayCPF(cpf),
        email: email,
        phone: displayPhone(cellphone),
        date_birthday: convertDateToISO(dateBirthday),
        source: "promoter_tablet",
        tablet_name: tabletName,
        client_created_at: generateClientCreatedAt(),
      });




      console.log('Request Body (Produção):', requestBodyProd);
      console.log(`URL: ${API_BASE_URL}/register`);

      // Ajuste para fuso horário de Brasília (UTC-3)
      const nowBrasilia = new Date(Date.now());
      const startTime = nowBrasilia.getTime();

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'MyApp/1.0',
          'Token': 'f8331af6befa173f8cec0bc46df542',
        },
        body: requestBodyProd,
        signal: createTimeoutSignal(30000), // 30 segundos
      });

      const endBrasilia = new Date(Date.now());
      const endTime = endBrasilia.getTime();
      const requestDuration = endTime - startTime;

      console.log(`Request Duration: ${requestDuration}ms`);
      console.log(`Response Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const responseData = await response.json();
        console.log('SUCCESS! Response Data (Produção):', responseData);

        if (responseData && responseData.sucesso === false) {
          // Se houver erros, exibe alerta com mensagem apropriada
          let errorMsg = 'Erro ao cadastrar usuário.';
          if (responseData.erros) {
            if (typeof responseData.erros === 'string') {
              errorMsg = responseData.erros;
            } else if (typeof responseData.erros === 'object') {
              errorMsg = Object.values(responseData.erros).join('\n');
            }
          } else if (responseData.message) {
            errorMsg = responseData.message;
          }
          Alert.alert('Erro', errorMsg);
          return;
        }

        // Após cadastro em produção, perguntar se deseja registrar atividade
        Alert.alert(
          'Cadastro realizado com sucesso!',
          'Deseja registrar uma atividade para este usuário?',
          [
            {
              text: 'Não',
              style: 'cancel',
              onPress: () => {
                Alert.alert('Usuário cadastrado', 'O usuário foi cadastrado com sucesso.', [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.goBack();
                    }
                  }
                ]);
              }
            },
            {
              text: 'Sim',
              onPress: async () => {
                try {
                  const status = await registerActivity();
                  if (status === 'ok') {
                    setSuccessMessage('Usuário cadastrado e entrada registrada com sucesso!');
                    setShowSuccessScreen(true);
                  } else {
                    setAlreadyDoneMessage('Atividade já realizada.');
                    setShowAlreadyDoneScreen(true);
                  }
                  console.log("Atividade registrada no estande:", await ConfigStorage.getAtividade());
                } catch (activityError) {
                  console.log('Erro ao registrar atividade (produção):', activityError);
                  setSuccessMessage('Usuário cadastrado, mas não foi possível registrar a atividade.');
                  setShowSuccessScreen(true);
                }
              }
            }
          ]
        );
      } else {
        console.log(`Response não OK: ${response.status}`);

        try {
          const errorData = await response.json();
          console.log('Error Response Data:', errorData);
          Alert.alert('Erro', errorData.message || 'Erro ao cadastrar usuário na produção');
        } catch (jsonError) {
          console.log('Erro ao fazer parse do JSON de erro:', jsonError);
          const errorText = await response.text();
          console.log('Error Response Text:', errorText);
          Alert.alert('Erro', `Erro no servidor de produção (${response.status})`);
        }
      }

    } catch (error) {
      console.log('Erro no cadastro de produção:', error);
      throw error; // Re-lança o erro para ser tratado na função principal
    }
  };

  // Função para cadastrar localmente
  const registerUserLocally = async () => {
    console.log('Fazendo cadastro local...');

    try {
      const baseUrl = (await ConfigStorage.getLocalBaseUrl()) || 'http://192.168.0.34:8000';
      const tabletName = await ConfigStorage.getTabletId();
      const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
      const localUrl = `${normalizedBaseUrl}/register`;

      const requestBodyLocal = JSON.stringify({
        name: `${name} ${lastName}`.trim(),
        cpf: cpf,
        email: email,
        phone: displayPhone(cellphone),
        date_birthday: convertDateToISO(dateBirthday),
        source: "promoter_tablet",
        tablet_name: tabletName,
        client_created_at: generateClientCreatedAt(),
      });

      console.log('Request Body (Local):', requestBodyLocal);
      console.log('URL:', localUrl);

      // Ajuste para fuso horário de Brasília (UTC-3)
      const nowBrasilia = new Date(Date.now());
      const startTime = nowBrasilia.getTime();

      let response;
      try {
        response = await fetch(localUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'MyApp/1.0',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Origin': normalizedBaseUrl,
          },
          body: requestBodyLocal,
          signal: createTimeoutSignal(30000), // 30 segundos
        });
      } catch (err) {
        console.log('[ERRO DE CONEXÃO LOCALHOST - register]', err);
        Alert.alert('Erro ao conectar no backend local', `Não foi possível acessar o endpoint /register.\n\nMotivo: ${err && err.message ? err.message : err}`);
        throw err;
      }

      const endBrasilia = new Date(Date.now());
      const endTime = endBrasilia.getTime();
      const requestDuration = endTime - startTime;

      console.log(`Request Duration: ${requestDuration}ms`);
      console.log(`Response Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const responseData = await response.json();
        console.log('SUCCESS! Response Data (Local):', responseData);

        // Após cadastro local, perguntar se deseja registrar atividade
        Alert.alert(
          'Cadastro realizado com sucesso!',
          'Deseja registrar uma atividade para este usuário?',
          [
            {
              text: 'Não',
              style: 'cancel',
              onPress: () => {
                setSuccessMessage('Usuário cadastrado com sucesso localmente!');
                setShowSuccessScreen(true);
              }
            },
            {
              text: 'Sim',
              onPress: async () => {
                console.log('[LOG] Usuário optou por registrar atividade após cadastro local. CPF:', cpf);
                try {
                  // Monta body conforme padrão
                  const standName = (await ConfigStorage.getAtividade()) || 'the one';
                  const tabletName = (await ConfigStorage.getTabletId()) || '';
                  const activityBody = JSON.stringify({
                    cpf: cpf,
                    method: 'cpf',
                    stand_name: standName.toLowerCase(),
                    tablet_name: tabletName,
                    client_attempt_at: generateClientCreatedAt(),
                  });
                  const localBaseUrl = (await ConfigStorage.getLocalBaseUrl()) || 'http://192.168.0.34:8000';
                  const normalizedBaseUrl = localBaseUrl.replace(/\/$/, '');
                  const activityUrl = `${normalizedBaseUrl}/activity`;
                  try {
                    await fetch(activityUrl, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                      },
                      body: activityBody,
                      signal: createTimeoutSignal(15000),
                    });
                    setSuccessMessage('Usuário cadastrado e entrada registrada com sucesso localmente!');
                    setShowSuccessScreen(true);
                  } catch (err) {
                    console.log('[ERRO DE CONEXÃO LOCALHOST - activity]', err);
                    Alert.alert('Erro ao conectar no backend local', `Não foi possível acessar o endpoint /activity.\n\nMotivo: ${err && err.message ? err.message : err}`);
                    setSuccessMessage('Usuário cadastrado, mas não foi possível registrar a atividade.');
                    setShowSuccessScreen(true);
                  }
                } catch (activityError) {
                  console.log('Erro ao registrar atividade (local):', activityError);
                  setSuccessMessage('Usuário cadastrado, mas não foi possível registrar a atividade.');
                  setShowSuccessScreen(true);
                }
              }
            }
          ]
        );
      } else {
        console.log(`Response não OK: ${response.status}`);

        try {
          const errorData = await response.json();
          console.log('Error Response Data:', errorData);
          Alert.alert('Erro', errorData.message || 'Erro ao cadastrar usuário localmente');
        } catch (jsonError) {
          console.log('Erro ao fazer parse do JSON de erro:', jsonError);
          const errorText = await response.text();
          console.log('Error Response Text:', errorText);
          Alert.alert('Erro', `Erro no servidor local (${response.status})`);
        }
      }

    } catch (error) {
      console.log('Erro no cadastro local:', error);
      Alert.alert(
        'Erro de Conexão Local',
        'Não foi possível conectar ao servidor local. Verifique se o servidor está rodando.',
        [{ text: 'OK' }]
      );
    }
  };

  // Função para formatar CPF
  const formatCPF = (text) => {
    const cleaned = text.replace(/\D/g, '');
    setCpf(cleaned);
  };

  // Função para exibir CPF formatado
  const displayCPF = (cpfValue) => {
    if (cpfValue.length >= 11) {
      return cpfValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cpfValue.length >= 9) {
      return cpfValue.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (cpfValue.length >= 6) {
      return cpfValue.replace(/(\d{3})(\d{3})/, '$1.$2');
    } else if (cpfValue.length >= 3) {
      return cpfValue.replace(/(\d{3})/, '$1');
    }
    return cpfValue;
  };

  const handleSuccessComplete = () => {
    setShowSuccessScreen(false);
    navigation.goBack();
  };

  // Função para formatar telefone
  const formatPhone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    setCellphone(cleaned);
  };

  // Função para exibir telefone formatado
  const displayPhone = (phoneValue) => {
    if (phoneValue.length >= 11) {
      return phoneValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phoneValue.length >= 7) {
      return phoneValue.replace(/(\d{2})(\d{5})/, '($1) $2');
    } else if (phoneValue.length >= 2) {
      return phoneValue.replace(/(\d{2})/, '($1)');
    }
    return phoneValue;
  };




  const isFormValid = cpf.length === 11 && name.length > 0 && lastName.length > 0 && email.length > 0 && cellphone.length > 0 && dateBirthday.length === 10;

  return (
    <SafeAreaView style={styles.container}>
      {/* Indicação discreta do servidor */}
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.content,
          isTablet ? styles.contentTablet : styles.contentMobile
        ]}>
          <View style={styles.formSection}>
            <Text style={[
              styles.title,
              isTablet ? styles.titleTablet : styles.titleMobile
            ]}>Novo Usuário</Text>

            <View style={styles.inputContainer}>
              <Text style={[
                styles.label,
                isTablet ? styles.labelTablet : styles.labelMobile
              ]}>CPF *</Text>
              <TextInput
                style={[
                  styles.input,
                  isTablet ? styles.inputTablet : styles.inputMobile
                ]}
                value={displayCPF(cpf)}
                onChangeText={formatCPF}
                placeholder="000.000.000-00"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="numeric"
                maxLength={14}
              />
              {!showOtherFields && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    isTablet ? styles.buttonTablet : styles.buttonMobile,
                    loading && styles.disabledButton,
                    (cpf.length !== 11) && styles.disabledButton,
                    styles.checkButton
                  ]}
                  onPress={checkCPF}
                  disabled={loading || cpf.length !== 11}
                >
                  <View style={styles.buttonContent}>
                    {loading ? (
                      <ActivityIndicator color="#e4ff04" size="large" />
                    ) : (
                      <Text style={[
                        styles.buttonText,
                        styles.secondaryButtonText,
                        isTablet ? styles.buttonTextTablet : styles.buttonTextMobile
                      ]}>Verificar CPF</Text>
                    )}
                  </View>
                  <View style={[
                    styles.buttonGlow,
                    styles.secondaryButtonGlow,
                    isTablet ? styles.buttonGlowTablet : styles.buttonGlowMobile
                  ]} />
                </TouchableOpacity>
              )}
            </View>

            {showOtherFields && (
              <>
                <View style={[styles.rowContainer, isTablet ? styles.rowContainerTablet : styles.rowContainerMobile]}>
                  <View style={[styles.inputSubContainer, isTablet ? styles.inputSubContainerTablet : styles.inputSubContainerMobile]}>
                    <Text style={[
                      styles.label,
                      isTablet ? styles.labelTablet : styles.labelMobile
                    ]}>Nome *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputSmall,
                        isTablet ? styles.inputTablet : styles.inputMobile
                      ]}
                      value={name}
                      onChangeText={setName}
                      placeholder="Digite seu nome"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={[styles.inputSubContainer, isTablet ? styles.inputSubContainerTablet : styles.inputSubContainerMobile]}>
                    <Text style={[
                      styles.label,
                      isTablet ? styles.labelTablet : styles.labelMobile
                    ]}>Sobrenome *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputSmall,
                        isTablet ? styles.inputTablet : styles.inputMobile
                      ]}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Digite seu sobrenome"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[
                    styles.label,
                    isTablet ? styles.labelTablet : styles.labelMobile
                  ]}>Email *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      isTablet ? styles.inputTablet : styles.inputMobile
                    ]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="seu@email.com"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={[styles.rowContainer, isTablet ? styles.rowContainerTablet : styles.rowContainerMobile]}>
                  <View style={[styles.inputSubContainer, isTablet ? styles.inputSubContainerTablet : styles.inputSubContainerMobile]}>
                    <Text style={[
                      styles.label,
                      isTablet ? styles.labelTablet : styles.labelMobile
                    ]}>Telefone *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputSmall,
                        isTablet ? styles.inputTablet : styles.inputMobile
                      ]}
                      value={displayPhone(cellphone)}
                      onChangeText={formatPhone}
                      placeholder="(11) 99999-9999"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      keyboardType="numeric"
                      maxLength={15}
                    />
                  </View>
                  <View style={[styles.inputSubContainer, isTablet ? styles.inputSubContainerTablet : styles.inputSubContainerMobile]}>
                    <Text style={[
                      styles.label,
                      isTablet ? styles.labelTablet : styles.labelMobile
                    ]}>Data de Nascimento *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputSmall,
                        isTablet ? styles.inputTablet : styles.inputMobile
                      ]}
                      value={dateBirthday}
                      onChangeText={formatDateBirthday}
                      placeholder="DD/MM/AAAA"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    isTablet ? styles.buttonTablet : styles.buttonMobile,
                    loading && styles.disabledButton,
                    !isFormValid && styles.disabledButton
                  ]}
                  onPress={registerUser}
                  disabled={loading || !isFormValid}
                >
                  <View style={styles.buttonContent}>
                    {loading ? (
                      <ActivityIndicator color="#000" size="large" />
                    ) : (
                      <Text style={[
                        styles.buttonText,
                        styles.primaryButtonText,
                        isTablet ? styles.buttonTextTablet : styles.buttonTextMobile
                      ]}>Cadastrar</Text>
                    )}
                  </View>
                  <View style={[
                    styles.buttonGlow,
                    isTablet ? styles.buttonGlowTablet : styles.buttonGlowMobile
                  ]} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>

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
        onComplete={handleSuccessComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Brand dark
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
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
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

  formSection: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
  },

  // Título
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#e4ff04',
  },
  titleTablet: {
    fontSize: 32,
  },
  titleMobile: {
    fontSize: 28,
  },

  // Campos de input
  inputContainer: {
    marginBottom: 25,
    width: '100%',
  },
  label: {
    fontWeight: '600',
    marginBottom: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  labelTablet: {
    fontSize: 18,
  },
  labelMobile: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 20,
    fontSize: 18,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    color: '#fff',
    minHeight: 60,
  },
  inputTablet: {
    fontSize: 18,
  },
  inputMobile: {
    fontSize: 16,
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
    padding: 20,
    minHeight: 70,
  },
  buttonMobile: {
    padding: 16,
    minHeight: 60,
  },

  checkButton: {
    marginTop: 15,
  },

  // Botão primário (Cadastrar)
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
    width: '60%',
  },

  // Botão secundário (Verificar CPF)
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

  disabledButton: {
    opacity: 0.6,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
  },

  rowContainerTablet: {
    marginBottom: 30,
  },
  rowContainerMobile: {
    marginBottom: 25,
  },
  inputSubContainer: {
    flex: 1,
    marginRight: 15,
  },
  inputSubContainerTablet: {
    marginRight: 20,
  },
  inputSubContainerMobile: {
    marginRight: 15,
  },
  inputSmall: {
    flex: 1,
  },
});