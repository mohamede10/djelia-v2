import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StoryCard } from '../../components/common/StoryCard';
import { getStories, Story } from '../../services/dataService';
import { colors } from '../../config/colors';
import { BogolanPattern, KoraIcon, TamTamIcon, HutIcon, AIOrganicIcon } from '../../components/common/AfricanPattern';
import { SkeletonHero, SkeletonCard } from '../../components/common/Skeleton';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const CATEGORIES = [
  { id: '1', name: 'Contes', icon: KoraIcon, color: colors.primary },
  { id: '2', name: 'Fables', icon: TamTamIcon, color: colors.accentRed },
  { id: '3', name: 'Proverbes', icon: HutIcon, color: colors.gold },
  { id: '4', name: 'Coutumes', icon: AIOrganicIcon, color: colors.indigo },
];

export const HomeScreen = ({ navigation }: Props) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchStories = async () => {
    try {
      const data = await getStories();
      setStories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStories();
  };

  if (loading) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DJELIA</Text>
        </View>
        <SkeletonHero />
        <View style={{ marginTop: 40 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </ScrollView>
    );
  }

  const featuredStory = stories[0];
  const otherStories = stories.slice(1);

  return (
    <View style={styles.container}>
      <BogolanPattern opacity={0.03} />
      
      {/* WATERMARK VERTICAL DISCRET */}
      <View style={styles.verticalTitleWrapper} pointerEvents="none">
        <Text style={styles.verticalLetter}>B</Text>
        <Text style={styles.verticalLetter}>I</Text>
        <Text style={styles.verticalLetter}>B</Text>
        <Text style={styles.verticalLetter}>L</Text>
        <Text style={styles.verticalLetter}>I</Text>
        <Text style={styles.verticalLetter}>O</Text>
      </View>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>DJELIA</Text>
          <View style={styles.headerLine} />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Search')}>
            <MaterialCommunityIcons name="magnify" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* SECTION : LE RÉCIT DU JOUR (GALLERY STYLE) */}
        {featuredStory && (
          <View style={styles.heroSection}>
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('StoryDetail', { id: featuredStory.id })}
              style={styles.heroCard}
            >
              <Image source={{ uri: featuredStory.imageUrl }} style={styles.heroImage} />
              <View style={styles.heroOverlay} />
              <View style={styles.goldBorder} />
              <View style={styles.heroContent}>
                <Text style={styles.heroMeta}>{featuredStory.region.toUpperCase()}</Text>
                <Text style={styles.heroTitle}>{featuredStory.title}</Text>
                <View style={styles.heroAction}>
                  <Text style={styles.heroActionText}>DÉCOUVRIR LE RÉCIT</Text>
                  <MaterialCommunityIcons name="arrow-right" size={14} color={colors.gold} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* SECTION : SAGESSE ANCESTRALE (STÈLE STYLE) */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteDecor} />
          <Text style={styles.quoteText}>"La parole est le vêtement de la pensée."</Text>
          <Text style={styles.quoteAuthor}>SAGESSE MANDINGUE</Text>
        </View>

        {/* SECTION : TOTEMS THÉMATIQUES */}
        <View style={styles.themesSection}>
          <Text style={styles.sectionTitle}>LES CHEMINS DU SAVOIR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themesScroll}>
            {CATEGORIES.map((cat, index) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[
                  styles.themeTotem, 
                  { height: index % 2 === 0 ? 180 : 140, marginTop: index % 2 === 0 ? 0 : 20 }
                ]}
                onPress={() => navigation.navigate('Search', { category: cat.name })}
              >
                <View style={[styles.shieldCard, { backgroundColor: cat.color }]}>
                  <View style={styles.shieldGlow} />
                  <BogolanPattern color={colors.white} opacity={0.15} />
                  <View style={styles.shieldContent}>
                    <cat.icon size={38} color={colors.white} />
                    <Text style={styles.shieldName}>{cat.name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SECTION : DERNIÈRES ACQUISITIONS */}
        <View style={styles.librarySection}>
          <Text style={styles.sectionTitle}>ARCHIVES RÉCENTES</Text>
          {otherStories.map(item => (
            <StoryCard 
              key={item.id}
              story={item} 
              onPress={() => navigation.navigate('StoryDetail', { id: item.id })} 
            />
          ))}
        </View>

        <View style={styles.footerSpacer} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 15,
  },
  headerLeft: { flexDirection: 'column' },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: colors.text,
    letterSpacing: 4,
  },
  headerLine: {
    width: 20,
    height: 3,
    backgroundColor: colors.gold,
    marginTop: -2,
  },
  headerRight: { flexDirection: 'row' },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 22,
    marginLeft: 10,
  },
  verticalTitleWrapper: {
    position: 'absolute',
    right: 15,
    top: 0,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  verticalLetter: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 50,
    color: colors.text,
    opacity: 0.04,
    lineHeight: 60,
  },
  heroSection: {
    paddingHorizontal: 25,
    marginTop: 15,
  },
  heroCard: {
    height: 480,
    backgroundColor: colors.primaryDark,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  goldBorder: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 0.5,
    borderColor: colors.gold + '40',
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  heroMeta: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 4,
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 38,
    color: colors.white,
    lineHeight: 46,
    marginBottom: 20,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroActionText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: colors.gold,
    letterSpacing: 2,
    marginRight: 10,
  },
  quoteCard: {
    margin: 25,
    padding: 35,
    backgroundColor: colors.surfaceWarm,
    alignItems: 'center',
    position: 'relative',
  },
  quoteDecor: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 20,
    height: 20,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: colors.gold,
  },
  quoteText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 30,
  },
  quoteAuthor: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: colors.gold,
    marginTop: 20,
    letterSpacing: 3,
  },
  themesSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 12,
    color: colors.textLight,
    letterSpacing: 2,
    paddingHorizontal: 25,
    marginBottom: 25,
    textTransform: 'uppercase',
  },
  themesScroll: {
    paddingLeft: 25,
    paddingRight: 10,
  },
  themeTotem: {
    marginRight: 20,
    width: 110,
  },
  shieldCard: {
    flex: 1,
    width: 110,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  shieldGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    opacity: 0.1,
  },
  shieldContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  shieldName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: colors.white,
    marginTop: 15,
    letterSpacing: 1,
  },
  totemIndicator: {
    width: 15,
    height: 2,
    marginTop: 8,
  },
  librarySection: {
    marginTop: 10,
  },
  footerSpacer: {
    height: 60,
  },
});
