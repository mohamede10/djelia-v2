import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Searchbar, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { StoryCard } from '../../components/common/StoryCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  searchStories,
  resolveCategoryFilter,
  Story,
  STORY_REGIONS,
  STORY_ETHNIC_GROUPS,
  STORY_CATEGORY_FILTERS,
} from '../../services/dataService';
import { colors } from '../../config/colors';
import { BogolanPattern } from '../../components/common/AfricanPattern';

const { height } = Dimensions.get('window');

/** Pagination demandée par le cahier des charges : 20 contenus par page. */
const PAGE_SIZE = 20;

export const SearchScreen = ({ navigation, route }: any) => {
  const initialCategory = resolveCategoryFilter(route.params?.category);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Toutes');
  const [selectedEthnie, setSelectedEthnie] = useState('Toutes');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  const [results, setResults] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const manualRefreshRef = useRef(false);

  // Synchronise le filtre si l'on arrive depuis un totem de l'accueil.
  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(resolveCategoryFilter(route.params.category));
    }
  }, [route.params?.category]);

  useEffect(() => {
    let cancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      const regionFilter = selectedRegion === 'Toutes' ? undefined : selectedRegion;
      const ethnieFilter = selectedEthnie === 'Toutes' ? undefined : selectedEthnie;
      const categoryFilter = selectedCategory === 'Toutes' ? undefined : selectedCategory;

      try {
        const data = await searchStories(searchQuery, regionFilter, ethnieFilter, categoryFilter);
        if (cancelled) return;
        setResults(data);
        setVisibleCount(PAGE_SIZE);
      } catch (error) {
        if (!cancelled) {
          console.warn('Recherche Djelia indisponible :', error);
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    // Un rafraîchissement manuel est immédiat ; la saisie reste temporisée.
    const delayDebounceFn = setTimeout(
      fetchResults,
      manualRefreshRef.current ? 0 : 500
    );
    manualRefreshRef.current = false;

    return () => {
      cancelled = true;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery, selectedRegion, selectedEthnie, selectedCategory, refreshToken]);

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedRegion !== 'Toutes' ||
    selectedEthnie !== 'Toutes' ||
    selectedCategory !== 'Toutes';

  const loadMore = () => {
    if (hasMore) {
      setVisibleCount((count) => Math.min(count + PAGE_SIZE, results.length));
    }
  };

  const handleRefresh = useCallback(() => {
    manualRefreshRef.current = true;
    setRefreshing(true);
    setRefreshToken((token) => token + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedRegion('Toutes');
    setSelectedEthnie('Toutes');
    setSelectedCategory('Toutes');
  }, []);

  const renderStory = useCallback(
    ({ item }: { item: Story }) => (
      <StoryCard
        story={item}
        onPress={() => navigation.navigate('StoryDetail', { id: item.id })}
      />
    ),
    [navigation]
  );

  return (
    <View style={styles.container}>
      <BogolanPattern opacity={0.03} />
      <ScreenHeader 
        title="Quête"
        subtitle="Explorez les secrets de l'histoire"
        onBack={() => navigation.goBack()}
      />

      {/* WATERMARK VERTICAL */}
      <View style={styles.verticalTitleWrapper} pointerEvents="none">
        <Text style={styles.verticalLetter}>C</Text>
        <Text style={styles.verticalLetter}>H</Text>
        <Text style={styles.verticalLetter}>E</Text>
        <Text style={styles.verticalLetter}>R</Text>
        <Text style={styles.verticalLetter}>C</Text>
        <Text style={styles.verticalLetter}>H</Text>
        <Text style={styles.verticalLetter}>E</Text>
        <Text style={styles.verticalLetter}>R</Text>
      </View>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Taper un mot-clé..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={colors.gold}
          placeholderTextColor={colors.textLight}
          inputStyle={styles.searchInput}
          accessibilityLabel="Rechercher un récit"
        />

        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>PAR CATÉGORIE</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STORY_CATEGORY_FILTERS}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <Chip
                selected={selectedCategory === item}
                onPress={() => setSelectedCategory(item)}
                style={[styles.chip, selectedCategory === item && styles.chipSelected]}
                textStyle={[styles.chipText, selectedCategory === item && styles.chipTextSelected]}
                accessibilityLabel={`Filtrer par catégorie ${item}`}
              >
                {item.toUpperCase()}
              </Chip>
            )}
            contentContainerStyle={styles.filterList}
          />

          <Text style={styles.filterLabel}>PAR RÉGION</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STORY_REGIONS}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <Chip
                selected={selectedRegion === item}
                onPress={() => setSelectedRegion(item)}
                style={[styles.chip, selectedRegion === item && styles.chipSelected]}
                textStyle={[styles.chipText, selectedRegion === item && styles.chipTextSelected]}
                accessibilityLabel={`Filtrer par région ${item}`}
              >
                {item.toUpperCase()}
              </Chip>
            )}
            contentContainerStyle={styles.filterList}
          />

          <Text style={styles.filterLabel}>PAR ETHNIE</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STORY_ETHNIC_GROUPS}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <Chip
                selected={selectedEthnie === item}
                onPress={() => setSelectedEthnie(item)}
                style={[styles.chip, selectedEthnie === item && styles.chipSelected]}
                textStyle={[styles.chipText, selectedEthnie === item && styles.chipTextSelected]}
                accessibilityLabel={`Filtrer par ethnie ${item}`}
              >
                {item.toUpperCase()}
              </Chip>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>
      </View>

      {loading && results.length === 0 && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Récolte des récits…</Text>
        </View>
      ) : (
        <FlatList
          data={visibleResults}
          keyExtractor={(item) => item.id}
          renderItem={renderStory}
          contentContainerStyle={styles.listContainer}
          keyboardShouldPersistTaps="handled"
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.resultCount} accessibilityLiveRegion="polite">
                {results.length} récit{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </Text>
            ) : null
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMore}
                accessibilityRole="button"
                accessibilityLabel="Charger les récits suivants"
              >
                <Text style={styles.loadMoreText}>CHARGER PLUS DE RÉCITS</Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              title="Aucun récit trouvé"
              message="Le savoir que vous cherchez n’a pas encore été récolté. Essayez un autre mot-clé, une autre région ou une autre ethnie."
              icon="book-search-outline"
              actionLabel={hasActiveFilters ? 'EFFACER LES FILTRES' : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
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
    lineHeight: 55,
  },
  searchSection: {
    padding: 25,
    backgroundColor: 'transparent',
  },
  searchBar: {
    backgroundColor: colors.white,
    elevation: 4,
    marginBottom: 25,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
  },
  filtersContainer: {
    gap: 15,
  },
  filterLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: 5,
  },
  filterList: {
    paddingBottom: 10,
  },
  chip: {
    backgroundColor: colors.white,
    marginRight: 12,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.indigo,
    borderColor: colors.indigo,
  },
  chipText: {
    fontFamily: 'Poppins_700Bold',
    color: colors.textMid,
    fontSize: 10,
  },
  chipTextSelected: {
    color: colors.white,
  },
  listContainer: {
    padding: 25,
    paddingTop: 10,
    flexGrow: 1,
  },
  resultCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  loadMoreButton: {
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.indigo,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loadMoreText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.indigo,
    letterSpacing: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 14,
    letterSpacing: 0.5,
  },
});
