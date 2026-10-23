import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, ActivityIndicator, Chip, IconButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { getStoryById, Story } from '../../services/dataService';
import { AudioPlayer } from '../../components/audio/AudioPlayer';
import { useAppContext } from '../../store/AppProvider';
import { colors } from '../../config/colors';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, 'StoryDetail'>;
};

export const StoryDetailScreen = ({ route, navigation }: Props) => {
  const { id } = route.params as { id: string };
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite } = useAppContext();

  const handleToggleFavorite = (storyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(storyId);
  };

  useEffect(() => {
    const fetchStory = async () => {
      const data = await getStoryById(id);
      if (data) setStory(data);
      setLoading(false);
    };
    fetchStory();
  }, [id]);

  if (loading || !story) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isFavorite = favorites.includes(story.id);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: story.imageUrl }} style={styles.coverImage} />
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleWrapper}>
              <Text style={styles.meta}>{story.region} • {story.ethnicGroup}</Text>
              <Text style={styles.title}>{story.title}</Text>
            </View>
            <IconButton
              icon={isFavorite ? "heart" : "heart-outline"}
              iconColor={isFavorite ? colors.primary : colors.textMid}
              size={28}
              onPress={() => handleToggleFavorite(story.id)}
            />
          </View>
          
          <View style={styles.divider} />

          <View style={styles.tagsContainer}>
            <Chip style={styles.chip} textStyle={styles.chipText}>{story.category}</Chip>
          </View>

          <Text style={styles.storyContent}>{story.content}</Text>
          
          <View style={styles.signature}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Fin du récit</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>
      </ScrollView>

      <AudioPlayer audioUrl={story.audioUrl} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  coverImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 25,
    backgroundColor: colors.background,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrapper: {
    flex: 1,
  },
  meta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: colors.text,
    lineHeight: 34,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: colors.gold,
    marginVertical: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.border,
    height: 28,
  },
  chipText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: colors.primary,
  },
  storyContent: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 17,
    lineHeight: 30,
    color: colors.text,
    textAlign: 'justify',
  },
  signature: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    opacity: 0.3,
  },
  signatureLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textLight,
  },
  signatureText: {
    marginHorizontal: 20,
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
