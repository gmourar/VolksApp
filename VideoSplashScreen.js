import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const VideoSplashScreen = ({ onFinish }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    StatusBar.setHidden(true, 'none');
    
    // Timeout de segurança - se o vídeo não carregar em 7 segundos (5s + 2s buffer)
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Timeout do vídeo splash - forçando finalização');
        setHasError(true);
        onFinish();
      }
    }, 7000);

    return () => clearTimeout(timeout);
  }, [isLoading, onFinish]);

  const handleVideoLoad = (data) => {
    console.log('Vídeo carregado:', data);
    setIsLoading(false);
  };

  const handleVideoEnd = () => {
    console.log('Vídeo de 5 segundos terminou');
    // Transição mais rápida já que o vídeo tem duração certa
    setTimeout(() => {
      onFinish();
    }, 200); // Delay mínimo para transição suave
  };

  const handleVideoError = (error) => {
    console.log('Erro no vídeo splash:', error);
    setHasError(true);
    onFinish();
  };

  if (hasError) {
    // Fallback se o vídeo não carregar
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>PromoApp</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Vídeo de splash */}
      <Video
        ref={videoRef}
        // Para arquivo local na pasta assets:
        source={require('./assets/voudevolks.mp4')}
        
        // Para arquivo em recursos Android
        // source={{ uri: 'android.resource://com.promoapp.app/raw/splash_video' }}
        
        // Para URL remota 
        // source={{ uri: 'https://seu-servidor.com/splash_video.mp4' }}
        
        style={styles.video}
        resizeMode="cover"
        repeat={false}
        muted={true}
        onLoad={handleVideoLoad}
        onEnd={handleVideoEnd}
        onError={handleVideoError}
        playInBackground={false}
        playWhenInactive={false}
      />

      {/* Loader enquanto o vídeo carrega */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: width,
    height: height,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
});

export default VideoSplashScreen;