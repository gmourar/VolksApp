import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AlreadyDoneScreen({ visible, onComplete, message = 'Atividade já realizada.' }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      console.log('ALREADY DONE SCREEN SENDO EXIBIDA');
      console.log('Mensagem:', message);
      
      // Animação de entrada
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Animação de pulso contínua
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      const timer = setTimeout(() => {
        pulseAnimation.stop();
        onComplete();
      }, 3500);

      return () => {
        clearTimeout(timer);
        pulseAnimation.stop();
      };
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const isTablet = width >= 768;

  return (
    <View style={styles.container}>
      {/* Fundo gradiente escuro */}
      <View style={styles.background} />
      
      {/* Efeito de partículas/pontos */}
      <View style={styles.particlesContainer}>
        {Array.from({ length: 20 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.random() * 0.8 + 0.2],
                }),
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {/* Ícone principal com glow */}
        <Animated.View 
          style={[
            styles.iconContainer,
            isTablet ? styles.iconContainerTablet : styles.iconContainerMobile,
            {
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim }
              ],
              opacity: opacityAnim,
            }
          ]}
        >
          <Animated.View
            style={[
              styles.glowCircle,
              isTablet ? styles.glowCircleTablet : styles.glowCircleMobile,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                }),
              },
            ]}
          />
          <View style={[
            styles.iconCircle,
            isTablet ? styles.iconCircleTablet : styles.iconCircleMobile
          ]}>
            <Text style={[
              styles.iconText,
              isTablet ? styles.iconTextTablet : styles.iconTextMobile
            ]}>
              ⚠
            </Text>
          </View>
        </Animated.View>

        {/* Mensagem principal */}
        <Animated.Text 
          style={[
            styles.message,
            isTablet ? styles.messageTablet : styles.messageMobile,
            { opacity: opacityAnim }
          ]}
        >
          Ops! Já foi feito
        </Animated.Text>

        {/* Mensagem secundária */}
        <Animated.Text 
          style={[
            styles.subMessage,
            isTablet ? styles.subMessageTablet : styles.subMessageMobile,
            { opacity: opacityAnim }
          ]}
        >
          {message}
        </Animated.Text>

        {/* Barra de progresso */}
        <Animated.View
          style={[
            styles.progressContainer,
            { opacity: opacityAnim }
          ]}
        >
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FF9800',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
    position: 'relative',
  },
  iconContainerTablet: {
    marginBottom: 40,
  },
  iconContainerMobile: {
    marginBottom: 30,
  },
  glowCircle: {
    position: 'absolute',
    backgroundColor: '#FF9800',
    borderRadius: 100,
  },
  glowCircleTablet: {
    width: 200,
    height: 200,
    top: -40,
    left: -40,
  },
  glowCircleMobile: {
    width: 160,
    height: 160,
    top: -30,
    left: -30,
  },
  iconCircle: {
    backgroundColor: '#1A1A1A',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 15,
  },
  iconCircleTablet: {
    width: 120,
    height: 120,
  },
  iconCircleMobile: {
    width: 100,
    height: 100,
  },
  iconText: {
    color: '#FF9800',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconTextTablet: {
    fontSize: 50,
  },
  iconTextMobile: {
    fontSize: 40,
  },
  message: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(255, 152, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  messageTablet: {
    fontSize: 32,
  },
  messageMobile: {
    fontSize: 26,
  },
  subMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  subMessageTablet: {
    fontSize: 18,
  },
  subMessageMobile: {
    fontSize: 16,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 2,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});