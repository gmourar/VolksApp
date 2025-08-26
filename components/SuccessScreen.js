import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SuccessScreen({ visible, onComplete, message = 'Sucesso!' }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      console.log('SUCCESS SCREEN SENDO EXIBIDA');
      console.log('Mensagem:', message);
      
      // Sequência de animações
      Animated.sequence([
        // Entrada do container
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Animação do check
        Animated.timing(checkAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Glow effect
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Rotação sutil contínua
      const rotationAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      );
      rotationAnimation.start();

      const timer = setTimeout(() => {
        rotationAnimation.stop();
        onComplete();
      }, 3500);

      return () => {
        clearTimeout(timer);
        rotationAnimation.stop();
      };
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      checkAnim.setValue(0);
      glowAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const isTablet = width >= 768;

  return (
    <View style={styles.container}>
      {/* Fundo gradiente escuro */}
      <View style={styles.background} />
      
      {/* Efeito de partículas douradas */}
      <View style={styles.particlesContainer}>
        {Array.from({ length: 25 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.random() * 0.9 + 0.1],
                }),
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }],
              },
            ]}
          />
        ))}
      </View>

      {/* Círculos de fundo animados */}
      <Animated.View
        style={[
          styles.backgroundCircle,
          styles.backgroundCircle1,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.1],
            }),
            transform: [{
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })
            }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundCircle,
          styles.backgroundCircle2,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.08],
            }),
            transform: [{
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['360deg', '0deg'],
              })
            }],
          },
        ]}
      />

      <View style={styles.content}>
        {/* Ícone principal com check animado */}
        <Animated.View 
          style={[
            styles.checkContainer,
            isTablet ? styles.checkContainerTablet : styles.checkContainerMobile,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowCircle,
              isTablet ? styles.glowCircleTablet : styles.glowCircleMobile,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.7],
                }),
              },
            ]}
          />
          
          {/* Círculo principal */}
          <View style={[
            styles.checkIcon,
            isTablet ? styles.checkIconTablet : styles.checkIconMobile
          ]}>
            <Animated.Text 
              style={[
                styles.checkText,
                isTablet ? styles.checkTextTablet : styles.checkTextMobile,
                {
                  opacity: checkAnim,
                  transform: [{
                    scale: checkAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.2, 1],
                    })
                  }],
                }
              ]}
            >
              ✓
            </Animated.Text>
          </View>
        </Animated.View>

        {/* Mensagem principal */}
        <Animated.Text 
          style={[
            styles.successMessage,
            isTablet ? styles.successMessageTablet : styles.successMessageMobile,
            {
              opacity: opacityAnim,
              transform: [{
                translateY: opacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }],
            }
          ]}
        >
          {message}
        </Animated.Text>

        {/* Mensagem secundária */}
        <Animated.Text 
          style={[
            styles.subMessage,
            isTablet ? styles.subMessageTablet : styles.subMessageMobile,
            {
              opacity: opacityAnim,
              transform: [{
                translateY: opacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }],
            }
          ]}
        >
          Acesso liberado!
        </Animated.Text>

        {/* Barra de progresso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  transform: [{
                    scaleX: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    })
                  }],
                  opacity: glowAnim,
                },
              ]}
            />
          </View>
        </View>
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
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFEB3B',
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 500,
    borderWidth: 1,
    borderColor: '#FFEB3B',
  },
  backgroundCircle1: {
    width: 400,
    height: 400,
    top: height / 2 - 200,
    left: width / 2 - 200,
  },
  backgroundCircle2: {
    width: 600,
    height: 600,
    top: height / 2 - 300,
    left: width / 2 - 300,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  checkContainer: {
    marginBottom: 30,
    position: 'relative',
  },
  checkContainerTablet: {
    marginBottom: 40,
  },
  checkContainerMobile: {
    marginBottom: 30,
  },
  glowCircle: {
    position: 'absolute',
    backgroundColor: '#FFEB3B',
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
  checkIcon: {
    backgroundColor: '#1A1A1A',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFEB3B',
    shadowColor: '#FFEB3B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  checkIconTablet: {
    width: 120,
    height: 120,
  },
  checkIconMobile: {
    width: 100,
    height: 100,
  },
  checkText: {
    color: '#FFEB3B',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkTextTablet: {
    fontSize: 50,
  },
  checkTextMobile: {
    fontSize: 40,
  },
  successMessage: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(255, 235, 59, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  successMessageTablet: {
    fontSize: 36,
  },
  successMessageMobile: {
    fontSize: 28,
  },
  subMessage: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(255, 235, 59, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  subMessageTablet: {
    fontSize: 20,
  },
  subMessageMobile: {
    fontSize: 18,
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
    backgroundColor: '#FFEB3B',
    borderRadius: 2,
    shadowColor: '#FFEB3B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
});