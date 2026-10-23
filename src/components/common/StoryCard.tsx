import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../config/colors';
import { Story } from '../../services/dataService';
import { useAppContext } from '../../store/AppProvider';

type Props = {
  story: Story;
  onPress: () => void;
};

export const StoryCard = ({ story, onPress }: Props) => {
  const { favorites, toggleFavorite } = useAppContext();
  const isFavorite = favorites.includes(story.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Bordure artisanale à gauche */}
      <View style={styles.accentBorder} />
      
      <View style={[styles.imageContainer, { backgroundColor: colors.surfaceWarm }]}>
        <Image 
          source={{ uri: story.imageUrl }} 
          style={styles.image} 
        />
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={() => toggleFavorite(story.id)}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{story.category.toUpperCase()}</Text>
          <View style={styles.dot} />
          <Text style={styles.region}>{story.region}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{story.title}</Text>
        <View style={styles.footer}>
          <Text style={styles.audioHint}>{story.audioUrl ? '🎵 Audio' : '📖 Lecture'}</Text>
          <Text style={styles.readMore}>Explorer ›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: 25,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.border,
    height: 140,
    overflow: 'hidden',
  },
  accentBorder: {
    width: 4,
    height: '100%',
    backgroundColor: colors.gold,
  },
  imageContainer: {
    width: 110,
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 16,
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: colors.primary,
    letterSpacing: 1,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.borderDark,
    marginHorizontal: 8,
  },
  region: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    height: 44,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  audioHint: {
    fontFamily: 'Poppins_300Light',
    fontSize: 10,
    color: colors.primary,
    fontStyle: 'italic',
  },
  readMore: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 1,
  },
});
