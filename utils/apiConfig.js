import { ConfigStorage } from './ConfigStorage';

export const API_BASE_URL = 'http://ec2-54-233-101-11.sa-east-1.compute.amazonaws.com:3333';

export const ApiConfig = {
  // Obtém as configurações para uso em APIs
  async getApiConfig() {
    try {
      const [stand, tabletId] = await Promise.all([
        ConfigStorage.getStand(),
        ConfigStorage.getTabletId()
      ]);
      
      return {
        stand: stand || 1,
        tabletId: tabletId || 'TABLET_001'
      };
    } catch (error) {
      console.error('Erro ao obter configurações da API:', error);
      return {
        stand: 1,
        tabletId: 'TABLET_001'
      };
    }
  },

  // Exemplo de como usar as configurações em uma chamada de API
  async makeApiCall(endpoint, data = {}) {
    try {
      const config = await this.getApiConfig();
      
      const requestData = {
        ...data,
        stand: config.stand,
        tabletId: config.tabletId,
        timestamp: new Date().toISOString()
      };

      // Aqui você faria a chamada real para sua API
      console.log('Dados da API:', requestData);
      
      // Exemplo de retorno (substitua pela sua implementação real)
      return {
        success: true,
        data: requestData,
        message: 'Chamada de API simulada'
      };
    } catch (error) {
      console.error('Erro na chamada da API:', error);
      throw error;
    }
  },

  // Função para obter as configurações de forma síncrona (útil para componentes que precisam dos valores imediatamente)
  getCachedConfig() {
    // Retorna as configurações em cache ou valores padrão
    // Note: Esta função retorna valores em cache, não os valores mais recentes do storage
    return {
      stand: 1,
      tabletId: 'TABLET_001'
    };
  }
};
