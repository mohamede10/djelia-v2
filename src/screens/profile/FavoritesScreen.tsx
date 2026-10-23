import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StoryCard } from '../../components/common/StoryCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
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

  useEffect(() => {
    const fetchFavorites = async () => {
      const allStories = await getStories();
      const filtered = allStories.filter(s => favorites.includes(s.id));
      setFavoriteStories(filtered);
      setLoading(false);
    };
    
    fetchFavorites();
  }, [favorites]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Mes Favoris"
        subtitle="Vos histoires et coutumes sauvegardées"
      />
      <FlatList
        data={favoriteStories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StoryCard 
            story={item} 
            onPress={() => navigation.navigate('StoryDetail', { id: item.id })} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Vous n'avez pas encore de favoris.</Text>
          </View>
        }
      />
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
  listContainer: {
    paddingBottom: 24,
    paddingTop: 16,
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    color: colors.textLight,
    textAlign: 'center',
  },
});
