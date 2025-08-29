import AsyncStorage from '@react-native-async-storage/async-storage';

const CONFIG_KEYS = {
  STAND: 'stand',
  TABLET_ID: 'tablet_id',
  ADMIN_PASSWORD: 'admin_password',
  LOCAL_BASE_URL: 'local_base_url',
  ATIVIDADE: 'atividade'
};

// Senha padrão do admin (pode ser alterada)
const DEFAULT_ADMIN_PASSWORD = 'pic@brand';
const DEFAULT_LOCAL_BASE_URL = 'http://192.168.0.34:8000';
const DEFAULT_ATIVIDADE = 'the one'; // ou 'skyline'

// Verifica se o AsyncStorage está disponível
const isAsyncStorageAvailable = () => {
  try {
    return AsyncStorage && typeof AsyncStorage.getItem === 'function';
  } catch (error) {
    console.error('AsyncStorage não está disponível:', error);
    return false;
  }
};

export const ConfigStorage = {
  // Inicializa as configurações padrão
  async initializeConfig() {
    try {
      // Verifica se o AsyncStorage está disponível
      if (!isAsyncStorageAvailable()) {
        console.warn('AsyncStorage não disponível, usando configurações padrão');
        return;
      }

      const existingStand = await this.getStand();
      const existingTabletId = await this.getTabletId();
      const existingPassword = await this.getAdminPassword();
      const existingLocalBaseUrl = await this.getLocalBaseUrl();
      const existingAtividade = await this.getAtividade();

      if (existingStand === null) {
        await this.setStand(1);
      }
      if (existingTabletId === null) {
        await this.setTabletId('TABLET_001');
      }
      if (existingPassword === null) {
        await this.setAdminPassword(DEFAULT_ADMIN_PASSWORD);
      }
      if (existingLocalBaseUrl === null) {
        await this.setLocalBaseUrl(DEFAULT_LOCAL_BASE_URL);
      }
      if (existingAtividade === null) {
        await this.setAtividade(DEFAULT_ATIVIDADE);
      }
    } catch (error) {
      console.error('Erro ao inicializar configurações:', error);
      // Não propaga o erro para evitar crashes
    }
  },

  // Getters
  async getStand() {
    try {
      if (!isAsyncStorageAvailable()) {
        return 1; // Valor padrão se AsyncStorage não estiver disponível
      }
      const value = await AsyncStorage.getItem(CONFIG_KEYS.STAND);
      return value ? parseInt(value) : null;
    } catch (error) {
      console.error('Erro ao obter stand:', error);
      return 1; // Valor padrão em caso de erro
    }
  },

  async getTabletId() {
    try {
      if (!isAsyncStorageAvailable()) {
        return 'TABLET_001'; // Valor padrão se AsyncStorage não estiver disponível
      }
      return await AsyncStorage.getItem(CONFIG_KEYS.TABLET_ID);
    } catch (error) {
      console.error('Erro ao obter ID do tablet:', error);
      return 'TABLET_001'; // Valor padrão em caso de erro
    }
  },

  async getAdminPassword() {
    try {
      if (!isAsyncStorageAvailable()) {
        return DEFAULT_ADMIN_PASSWORD; // Valor padrão se AsyncStorage não estiver disponível
      }
      return await AsyncStorage.getItem(CONFIG_KEYS.ADMIN_PASSWORD);
    } catch (error) {
      console.error('Erro ao obter senha do admin:', error);
      return DEFAULT_ADMIN_PASSWORD; // Valor padrão em caso de erro
    }
  },

  async getLocalBaseUrl() {
    try {
      if (!isAsyncStorageAvailable()) {
        return DEFAULT_LOCAL_BASE_URL;
      }
      const value = await AsyncStorage.getItem(CONFIG_KEYS.LOCAL_BASE_URL);
      return value || null;
    } catch (error) {
      console.error('Erro ao obter URL base local:', error);
      return DEFAULT_LOCAL_BASE_URL;
    }
  },

  async getAtividade() {
    try {
      if (!isAsyncStorageAvailable()) {
        return DEFAULT_ATIVIDADE;
      }
      const value = await AsyncStorage.getItem(CONFIG_KEYS.ATIVIDADE);
      return value || null;
    } catch (error) {
      console.error('Erro ao obter atividade:', error);
      return DEFAULT_ATIVIDADE;
    }
  },

  // Setters
  async setStand(stand) {
    try {
      if (!isAsyncStorageAvailable()) {
        console.warn('AsyncStorage não disponível, não foi possível salvar stand');
        return;
      }
      await AsyncStorage.setItem(CONFIG_KEYS.STAND, stand.toString());
    } catch (error) {
      console.error('Erro ao definir stand:', error);
    }
  },

  async setTabletId(tabletId) {
    try {
      if (!isAsyncStorageAvailable()) {
        console.warn('AsyncStorage não disponível, não foi possível salvar tablet ID');
        return;
      }
      await AsyncStorage.setItem(CONFIG_KEYS.TABLET_ID, tabletId);
    } catch (error) {
      console.error('Erro ao definir ID do tablet:', error);
    }
  },

  async setAdminPassword(password) {
    try {
      if (!isAsyncStorageAvailable()) {
        console.warn('AsyncStorage não disponível, não foi possível salvar senha');
        return;
      }
      await AsyncStorage.setItem(CONFIG_KEYS.ADMIN_PASSWORD, password);
    } catch (error) {
      console.error('Erro ao definir senha do admin:', error);
    }
  },

  async setLocalBaseUrl(baseUrl) {
    try {
      if (!isAsyncStorageAvailable()) {
        console.warn('AsyncStorage não disponível, não foi possível salvar URL base local');
        return;
      }
      await AsyncStorage.setItem(CONFIG_KEYS.LOCAL_BASE_URL, baseUrl);
    } catch (error) {
      console.error('Erro ao definir URL base local:', error);
    }
  },

  async setAtividade(atividade) {
    try {
      if (!isAsyncStorageAvailable()) {
        console.warn('AsyncStorage não disponível, não foi possível salvar atividade');
        return;
      }
      await AsyncStorage.setItem(CONFIG_KEYS.ATIVIDADE, atividade);
    } catch (error) {
      console.error('Erro ao definir atividade:', error);
    }
  },

  // Verifica se a senha está correta
  async verifyPassword(inputPassword) {
    try {
      if (!inputPassword || typeof inputPassword !== 'string') {
        console.warn('Senha inválida fornecida');
        return false;
      }

      const storedPassword = await this.getAdminPassword();
      
      if (!storedPassword) {
        console.warn('Nenhuma senha armazenada encontrada');
        return false;
      }

      return storedPassword === inputPassword;
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }
  },

  // Obtém todas as configurações
  async getAllConfig() {
    try {
      const [stand, tabletId, localBaseUrl, atividade] = await Promise.all([
        this.getStand(),
        this.getTabletId(),
        this.getLocalBaseUrl(),
        this.getAtividade(),
      ]);
      
      return {
        stand: stand || 1,
        tabletId: tabletId || 'TABLET_001',
        localBaseUrl: localBaseUrl || DEFAULT_LOCAL_BASE_URL,
        atividade: atividade || DEFAULT_ATIVIDADE,
      };
    } catch (error) {
      console.error('Erro ao obter todas as configurações:', error);
      return { stand: 1, tabletId: 'TABLET_001', localBaseUrl: DEFAULT_LOCAL_BASE_URL, atividade: DEFAULT_ATIVIDADE };
    }
  },

  // Verifica se o sistema está funcionando
  async isSystemReady() {
    try {
      const config = await this.getAllConfig();
      return config.stand && config.tabletId;
    } catch (error) {
      console.error('Erro ao verificar se o sistema está pronto:', error);
      return false;
    }
  }
};
