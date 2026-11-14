import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../config/colors';
import { Story } from '../../services/dataService';
import { useAppContext } from '../../store/AppProvider';

type Props = {
  story: Story;
  onPress: () => void;
};

export const StoryCard = React.memo(function StoryCard({ story, onPress }: Props) {
  const { favorites, toggleFavorite } = useAppContext();
  const isFavorite = favorites.includes(story.id);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [story.id]);

  const audioLabel = story.audioUrl ? 'Audio' : 'Lecture';

  return (
    // Le bouton favori est un frère du bouton carte (et non un enfant) : un
    // bouton ne doit pas en contenir un autre. Il reste superposé au visuel.
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        // Le nom accessible reprend, dans l'ordre, le texte visible de la carte
        // (règle Lighthouse `label-content-name-mismatch`).
        accessibilityLabel={`${story.category.toUpperCase()}, ${story.region}, ${story.title}, ${audioLabel}, Explorer`}
        accessibilityHint="Ouvre la fiche complète du récit"
      >
        {/* Bordure artisanale à gauche */}
        <View style={styles.accentBorder} />

        <View style={[styles.imageContainer, { backgroundColor: colors.surfaceWarm }]}>
          {imageFailed ? (
            <View style={styles.imageFallback}>
              <MaterialCommunityIcons
                name="book-open-page-variant-outline"
                size={34}
                color={colors.gold}
              />
            </View>
          ) : (
            <Image
              source={{ uri: story.imageUrl }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              onError={() => setImageFailed(true)}
              accessibilityIgnoresInvertColors
              // Image décorative : `alt=""`. expo-image ne transmet que
              // `accessibilityLabel` au <img> sur le web.
              accessibilityLabel=""
            />
          )}
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

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(story.id)}
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? `Retirer ${story.title} des favoris` : `Ajouter ${story.title} aux favoris`}
        accessibilityState={{ selected: isFavorite }}
      >
        <Text style={styles.favoriteIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {isFavorite ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: 20,
    marginHorizontal: 25,
  },
  card: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
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
  imageFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
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
    fontSize: 10,
    color: colors.textMid,
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
    color: colors.primary,
    letterSpacing: 1,
  },
});
