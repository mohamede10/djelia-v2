import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Searchbar, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StoryCard } from '../../components/common/StoryCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { searchStories, Story } from '../../services/dataService';
import { colors } from '../../config/colors';
import { BogolanPattern } from '../../components/common/AfricanPattern';

const { width, height } = Dimensions.get('window');

const REGIONS = ['Toutes', 'Kankan', 'Labé', 'Nzérékoré', 'Conakry'];
const ETHNIES = ['Toutes', 'Mandingue', 'Peul', 'Soussou', 'Baga'];

export const SearchScreen = ({ navigation, route }: any) => {
  const initialCategory = route.params?.category || 'Toutes';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Toutes');
  const [selectedEthnie, setSelectedEthnie] = useState('Toutes');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  const [results, setResults] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const regionFilter = selectedRegion === 'Toutes' ? undefined : selectedRegion;
      const ethnieFilter = selectedEthnie === 'Toutes' ? undefined : selectedEthnie;
      const categoryFilter = selectedCategory === 'Toutes' ? undefined : selectedCategory;
      
      const data = await searchStories(searchQuery, regionFilter, ethnieFilter, categoryFilter);
      setResults(data);
      setLoading(false);
    };

    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedRegion, selectedEthnie, selectedCategory]);

  return (
    <View style={styles.container}>
      <BogolanPattern opacity={0.03} />
      <ScreenHeader 
        title="Quête"
        subtitle="Explorez les secrets de l'histoire"
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
        />

        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>PAR RÉGION</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={REGIONS}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <Chip
                selected={selectedRegion === item}
                onPress={() => setSelectedRegion(item)}
                style={[styles.chip, selectedRegion === item && styles.chipSelected]}
                textStyle={[styles.chipText, selectedRegion === item && styles.chipTextSelected]}
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
            data={ETHNIES}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <Chip
                selected={selectedEthnie === item}
                onPress={() => setSelectedEthnie(item)}
                style={[styles.chip, selectedEthnie === item && styles.chipSelected]}
                textStyle={[styles.chipText, selectedEthnie === item && styles.chipTextSelected]}
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
          data={results}
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
              <Text style={styles.emptyText}>Le savoir que vous cherchez n'a pas encore été récolté.</Text>
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
