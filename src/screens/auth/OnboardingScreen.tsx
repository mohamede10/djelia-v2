  import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Animated, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../config/colors';
import { BogolanPattern, KoraIcon, TamTamIcon, HutIcon } from '../../components/common/AfricanPattern';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'ÉCOUTER',
    subtitle: 'Gardiens de la Parole',
    description: 'Plongez dans les récits qui ont forgé notre identité. La voix des anciens n’est jamais perdue, elle attend d’être entendue.',
    Icon: KoraIcon,
    accent: colors.gold,
    watermark: 'SAGESSE',
    bg: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1000', // Hands on instrument
  },
  { 
    id: '2',
    title: 'INTERROGER',
    subtitle: 'Mémoire Augmentée',
    description: 'Le DjeliBot fusionne des siècles de tradition avec la puissance du numérique pour répondre à vos quêtes de savoir.',
    Icon: TamTamIcon,
    accent: colors.gold,
    watermark: 'ESPRIT',
    bg: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000', // Confirmed Portrait
  },
  {
    id: '3',
    title: 'TRANSMETTRE',
    subtitle: 'Héritage Éternel',
    description: 'Maîtrisez nos langues et nos arts. Devenez, à votre tour, le maillon qui unit hier à demain.',
    Icon: HutIcon,
    accent: colors.gold,
    watermark: 'RACINES',
    bg: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1000', // Confirmed Sunset
  },
];

const BackgroundManager = ({ scrollX }: { scrollX: Animated.Value }) => {
  return (
    <View style={StyleSheet.absoluteFill}>
      {slides.map((slide, i) => {
        const opacity = scrollX.interpolate({
          inputRange: [(i - 1) * width, i * width, (i + 1) * width],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });
        return (
          <Animated.Image
            key={slide.id}  
            source={{ uri: slide.bg }}
            style={[StyleSheet.absoluteFill, { opacity }]}
            resizeMode="cover"
          />
        );
      })}
      <View style={styles.overlay} />
    </View>
  );
};

export const OnboardingScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <BackgroundManager scrollX={scrollX} />
      <BogolanPattern opacity={0.1} color={colors.white} />
      
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index }) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
          });

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [50, 0, -50],
          });

          return (
            <View style={styles.slide}>
              <Animated.View style={[styles.iconWrapper, { opacity }]}>
                <item.Icon size={100} color={colors.gold} />
                <View style={[styles.accentLine, { backgroundColor: colors.gold }]} />
              </Animated.View>
              
              <Animated.View style={[styles.contentWrapper, { opacity, transform: [{ translateY }] }]}>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </Animated.View>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, i) => {
            const scale = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.8, 1.4, 0.8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View 
                key={i} 
                style={[styles.dot, { transform: [{ scale }], opacity, backgroundColor: colors.gold }]} 
              />
            );
          })}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'REJOINDRE LA COUR' : 'SUIVANT'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  accentLine: {
    width: 30,
    height: 2,
    marginTop: 15,
  },
  contentWrapper: {
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 42,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.white,
    letterSpacing: 2,
  },
  description: {
    fontFamily: 'Poppins_300Light',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  nextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: colors.gold,
    borderRadius: 30,
  },
  buttonText: {
    color: colors.indigo,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1.5,
    fontSize: 11,
  },
});
