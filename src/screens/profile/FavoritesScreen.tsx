import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StoryCard } from '../../components/common/StoryCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { getStories, Story } from '../../services/dataService';
import { useAppContext } from '../../store/AppProvider';
import { colors } from '../../config/colors';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const FavoritesScreen = ({ navigation }: Props) => {
  const { favorites } = useAppContext();
  const [favoriteStories, setFavoriteStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const allStories = await getStories();
      setFavoriteStories(allStories.filter((story) => favorites.includes(story.id)));
    } catch (error) {
      console.warn('Favoris Djelia indisponibles :', error);
      setFavoriteStories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [favorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavorites();
  }, [fetchFavorites]);

  const renderStory = useCallback(
    ({ item }: { item: Story }) => (
      <StoryCard
        story={item}
        onPress={() =>
          navigation.navigate('Accueil', { screen: 'StoryDetail', params: { id: item.id } })
        }
      />
    ),
    [navigation]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Mes Favoris"
        subtitle="Vos histoires et coutumes sauvegardées"
        onBack={() => navigation.goBack()}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Ouverture de votre mémoire…</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteStories}
          keyExtractor={(item) => item.id}
          renderItem={renderStory}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="Votre mémoire est encore vierge"
              message="Explorez la bibliothèque et touchez le cœur d’un récit pour le retrouver ici, même hors connexion."
              actionLabel="EXPLORER LES RÉCITS"
              onAction={() => navigation.navigate('Accueil')}
            />
          }
        />
      )}
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
    padding: 32,
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 14,
    letterSpacing: 0.5,
  },
  listContainer: {
    paddingBottom: 24,
    paddingTop: 16,
    flexGrow: 1,
  },
});
