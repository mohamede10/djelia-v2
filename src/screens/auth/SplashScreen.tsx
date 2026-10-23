import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors } from '../../config/colors';

const { width, height } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const SplashScreen = ({ navigation }: any) => {
  // Sphères de lumière
  const redPos = useRef(new Animated.ValueXY({ x: -100, y: -100 })).current;
  const yellowPos = useRef(new Animated.ValueXY({ x: width + 100, y: -100 })).current;
  const greenPos = useRef(new Animated.ValueXY({ x: width / 2, y: height + 100 })).current;
  
  // États de l'explosion
  const flashAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textReveal = useRef(new Animated.Value(0)).current;
  
  // Courbes du logo
  const c1 = useRef(new Animated.Value(0)).current;
  const c2 = useRef(new Animated.Value(0)).current;
  const c3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Les sphères convergent vers le centre
    Animated.parallel([
      Animated.timing(redPos, {
        toValue: { x: width / 2 - 20, y: height / 2 - 20 },
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(yellowPos, {
        toValue: { x: width / 2 + 20, y: height / 2 - 20 },
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(greenPos, {
        toValue: { x: width / 2, y: height / 2 + 20 },
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. L'EXPLOSION
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(flashAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
          Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        // 3. Dessin des courbes
        Animated.stagger(200, [
          Animated.timing(c1, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(c2, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(c3, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
        // 4. Révélation du texte
        Animated.timing(textReveal, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]).start();
    });

    const timer = setTimeout(() => navigation.replace('Onboarding'), 6500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Les Sphères Énergétiques */}
      <Animated.View style={[styles.ball, { backgroundColor: colors.accentRed, transform: redPos.getTranslateTransform() }]} />
      <Animated.View style={[styles.ball, { backgroundColor: colors.gold, transform: yellowPos.getTranslateTransform() }]} />
      <Animated.View style={[styles.ball, { backgroundColor: colors.primary, transform: greenPos.getTranslateTransform() }]} />

      {/* Le Flash d'Explosion */}
      <Animated.View style={[styles.flash, { opacity: flashAnim }]} />

      {/* Le Logo Né de l'Explosion */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Svg width={150} height={150} viewBox="0 0 100 100">
          <AnimatedPath
            d="M20 50 Q50 10 80 50"
            fill="none"
            stroke={colors.accentRed}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset={c1.interpolate({ inputRange: [0, 1], outputRange: [100, 0] })}
          />
          <AnimatedPath
            d="M30 60 Q50 30 70 60"
            fill="none"
            stroke={colors.gold}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="80"
            strokeDashoffset={c2.interpolate({ inputRange: [0, 1], outputRange: [80, 0] })}
          />
          <AnimatedPath
            d="M40 70 Q50 50 60 70"
            fill="none"
            stroke={colors.primary}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="60"
            strokeDashoffset={c3.interpolate({ inputRange: [0, 1], outputRange: [60, 0] })}
          />
        </Svg>
      </Animated.View>

      {/* Le Titre qui "Brûle" l'écran */}
      <Animated.View style={[styles.textContainer, { opacity: textReveal, transform: [{ translateY: textReveal.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <Text style={styles.title}>DJELIA</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>L'ESPRIT DE LA MÉMOIRE</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505', // Noir profond pour le théâtre
    justifyContent: 'center',
    alignItems: 'center',
  },
  ball: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowBlur: 20,
    shadowOpacity: 0.8,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    zIndex: 10,
  },
  logoContainer: {
    zIndex: 5,
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 42,
    color: colors.white,
    letterSpacing: 12,
  },
  divider: {
    width: 50,
    height: 3,
    backgroundColor: colors.gold,
    marginVertical: 10,
  },
  subtitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: colors.gold,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
});
