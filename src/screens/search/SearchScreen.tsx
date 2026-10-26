import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Searchbar, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { StoryCard } from '../../components/common/StoryCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { searchStories, Story, STORY_REGIONS, STORY_ETHNIC_GROUPS, STORY_CATEGORY_FILTERS } from '../../services/dataService';
import { colors } from '../../config/colors';
import { BogolanPattern } from '../../components/common/AfricanPattern';

const { height } = Dimensions.get('window');

/** Pagination demandée par le cahier des charges : 20 contenus par page. */
const PAGE_SIZE = 20;

/**
 * Les totems de l'accueil envoient « Contes », mais un appel direct peut fournir
 * « Conte » : on retombe toujours sur une facette connue du catalogue.
 */
const resolveCategoryFilter = (value?: string): string => {
  if (!value) return 'Toutes';
  const normalized = value.toLowerCase();
  return (
    STORY_CATEGORY_FILTERS.find(
      (category) => category.toLowerCase() === normalized || category.toLowerCase() === `${normalized}s`
    ) || 'Toutes'
  );
};

export const SearchScreen = ({ navigation, route }: any) => {
  const initialCategory = resolveCategoryFilter(route.params?.category);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Toutes');
  const [selectedEthnie, setSelectedEthnie] = useState('Toutes');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  const [results, setResults] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Synchronise le filtre si l'on arrive depuis un totem de l'accueil.
  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(resolveCategoryFilter(route.params.category));
    }
  }, [route.params?.category]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const regionFilter = selectedRegion === 'Toutes' ? undefined : selectedRegion;
      const ethnieFilter = selectedEthnie === 'Toutes' ? undefined : selectedEthnie;
      const categoryFilter = selectedCategory === 'Toutes' ? undefined : selectedCategory;
      
      const data = await searchStories(searchQuery, regionFilter, ethnieFilter, categoryFilter);
      setResults(data);
      setVisibleCount(PAGE_SIZE);
      setLoading(false);
    };

    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedRegion, selectedEthnie, selectedCategory]);

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

  const loadMore = () => {
    if (hasMore) {
      setVisibleCount((count) => Math.min(count + PAGE_SIZE, results.length));
    }
  };

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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={visibleResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StoryCard 
              story={item} 
              onPress={() => navigation.navigate('StoryDetail', { id: item.id })} 
            />
          )}
          contentContainerStyle={styles.listContainer}
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
            <View style={styles.center}>
              <Text style={styles.emptyText}>Le savoir que vous cherchez n’a pas encore été récolté.</Text>
            </View>
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
  emptyText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
