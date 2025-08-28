const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações adicionais para permitir conexões locais
config.resolver.platforms = ['android', 'ios', 'native', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Permite conexões com IPs locais
config.server = {
  ...config.server,
  port: 8081,
};

module.exports = config;

// Permitir carregar imagens .jfif
try {
  const assetExts = config.resolver.assetExts || [];
  if (!assetExts.includes('jfif')) {
    config.resolver.assetExts = [...assetExts, 'jfif'];
  }
} catch (e) {
  // noop
}
