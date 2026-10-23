import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../../config/colors';

const { width } = Dimensions.get('window');

export const Skeleton = ({ width: w, height: h, style }: { width: any, height: any, style?: any }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.skeleton, 
        { width: w, height: h, opacity }, 
        style
      ]} 
    />
  );
};

export const SkeletonHero = () => (
  <View style={styles.heroWrapper}>
    <Skeleton width="100%" height={450} />
    <View style={styles.heroContent}>
      <Skeleton width={100} height={10} style={{ marginBottom: 10 }} />
      <Skeleton width="80%" height={30} style={{ marginBottom: 10 }} />
      <Skeleton width="60%" height={15} />
    </View>
  </View>
);

export const SkeletonCard = () => (
  <View style={styles.cardWrapper}>
    <Skeleton width={110} height="100%" />
    <View style={styles.cardContent}>
      <Skeleton width={60} height={8} style={{ marginBottom: 10 }} />
      <Skeleton width="90%" height={20} style={{ marginBottom: 10 }} />
      <Skeleton width="40%" height={10} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
  heroWrapper: {
    marginHorizontal: 25,
    marginTop: 15,
    height: 450,
    backgroundColor: colors.surfaceWarm,
    position: 'relative',
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: 25,
    right: 25,
  },
  cardWrapper: {
    flexDirection: 'row',
    height: 140,
    marginHorizontal: 25,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
});
