import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

const VideoSplashScreen = ({ onFinish }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    StatusBar.setHidden(true, 'none');

    // Timeout de segurança (7s)
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Timeout do vídeo splash - forçando finalização');
        setHasError(true);
        onFinish();
      }
    }, 7000);

    return () => clearTimeout(timeout);
  }, [isLoading, onFinish]);

  const handleVideoLoad = (status) => {
    console.log('Vídeo carregado:', status);
    setIsLoading(false);
  };

  const handleVideoEnd = () => {
    console.log('Vídeo de splash terminou');
    setTimeout(() => {
      onFinish();
    }, 200);
  };

  const handleVideoError = (error) => {
    console.log('Erro no vídeo splash:', error);
    setHasError(true);
    onFinish();
  };

  if (hasError) {
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

      <Video
        ref={videoRef}
        source={require('./assets/voudevolksplash.mp4')}
        style={styles.video}
        resizeMode="cover"
        shouldPlay
        isLooping={false}
        isMuted
        onLoad={handleVideoLoad}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            handleVideoEnd();
          }
          if (status.error) {
            handleVideoError(status.error);
          }
        }}
      />

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
