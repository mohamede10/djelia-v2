import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../config/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export type Book = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  audioUrl?: string;
  pdfUrl?: string;
  category: 'roman' | 'conte' | 'poésie' | 'histoire' | 'jeunesse';
  language: string;
  duration?: string;
  pages?: number;
  isPremium: boolean;
  description: string;
  coverColor: string;
  coverAccent: string;
  coverIcon: string;
};

const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Les Soleils des Indépendances',
    author: 'Ahmadou Kourouma',
    publisher: 'Éditions Ganndal',
    audioUrl: 'https://example.com/audio1.mp3',
    pdfUrl: 'https://example.com/livre1.pdf',
    category: 'roman',
    language: 'Français',
    duration: '4h 10min',
    pages: 195,
    isPremium: false,
    description: "Un chef-d'œuvre de la littérature africaine francophone qui raconte la désillusion post-coloniale.",
    coverColor: '#1B263B',
    coverAccent: '#F9D616',
    coverIcon: 'weather-sunny',
  },
  {
    id: '2',
    title: 'Le Maître de la Parole',
    author: 'Camara Laye',
    publisher: 'Éditions Guinée Livres',
    audioUrl: 'https://example.com/audio2.mp3',
    category: 'conte',
    language: 'Français / Mandingue',
    duration: '2h 45min',
    pages: 320,
    isPremium: false,
    description: "L'épopée de Soundiata Keïta racontée par un griot, entre mythe et histoire.",
    coverColor: '#006838',
    coverAccent: '#FFFFFF',
    coverIcon: 'microphone-variant',
  },
  {
    id: '3',
    title: 'Contes de la Savane',
    author: 'Collectif Griots Guinée',
    publisher: 'Éditions Ganndal',
    audioUrl: 'https://example.com/audio3.mp3',
    pdfUrl: 'https://example.com/livre3.pdf',
    category: 'jeunesse',
    language: 'Français / Pular',
    duration: '1h 30min',
    pages: 88,
    isPremium: true,
    description: 'Une collection de contes traditionnels pour les enfants, narrés en français et en Pular.',
    coverColor: '#CE2029',
    coverAccent: '#F9D616',
    coverIcon: 'tree',
  },
  {
    id: '4',
    title: 'Poèmes du Fouta',
    author: 'Ibrahima Diallo',
    publisher: 'Éditions Sahel',
    audioUrl: 'https://example.com/audio4.mp3',
    category: 'poésie',
    language: 'Pular / Français',
    duration: '55min',
    pages: 112,
    isPremium: false,
    description: 'Des poèmes qui célèbrent la beauté du Fouta Djallon, ses montagnes, ses femmes et ses traditions.',
    coverColor: '#4A1942',
    coverAccent: '#F9D616',
    coverIcon: 'feather',
  },
  {
    id: '5',
    title: 'Histoire de la Guinée',
    author: 'Lanciné Sylla',
    publisher: 'Éditions Ganndal',
    pdfUrl: 'https://example.com/livre5.pdf',
    category: 'histoire',
    language: 'Français',
    pages: 280,
    isPremium: true,
    description: "Une histoire complète de la Guinée depuis ses origines jusqu'à l'indépendance.",
    coverColor: '#8B4513',
    coverAccent: '#F9D616',
    coverIcon: 'map-marker-radius',
  },
  {
    id: '6',
    title: 'Sagesses Peules',
    author: 'Amadou Hampâté Bâ',
    publisher: 'Éditions Sahel',
    audioUrl: 'https://example.com/audio6.mp3',
    category: 'conte',
    language: 'Pular / Français',
    duration: '3h 20min',
    pages: 200,
    isPremium: false,
    description: 'Les grandes sagesses et proverbes du peuple Peul transmis de génération en génération.',
    coverColor: '#2C4A2E',
    coverAccent: '#F9D616',
    coverIcon: 'star-crescent',
  },
];

const CATEGORIES = ['Tous', 'Roman', 'Conte', 'Poésie', 'Histoire', 'Jeunesse'];

const BookCover = ({ book }: { book: Book }) => (
  <View style={[coverStyles.container, { backgroundColor: book.coverColor }]}>
    <View style={[coverStyles.circle1, { borderColor: book.coverAccent + '30' }]} />
    <View style={[coverStyles.circle2, { borderColor: book.coverAccent + '20' }]} />
    <View style={[coverStyles.stripe, { backgroundColor: book.coverAccent }]} />
    <MaterialCommunityIcons name={book.coverIcon as any} size={40} color={book.coverAccent} style={coverStyles.icon} />
    {book.isPremium && (
      <View style={coverStyles.premiumDot}>
        <MaterialCommunityIcons name="crown" size={10} color={book.coverColor} />
      </View>
    )}
  </View>
);

const coverStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
    top: -30,
    right: -30,
  },
  circle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 15,
    bottom: -20,
    left: -20,
  },
  stripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  icon: { opacity: 0.9 },
  premiumDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F9D616',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const BookCard = ({ book, onPress }: { book: Book; onPress: () => void }) => (
  <TouchableOpacity style={cardStyles.container} onPress={onPress} activeOpacity={0.85}>
    <BookCover book={book} />
    <View style={cardStyles.info}>
      <Text style={cardStyles.category}>{book.category}</Text>
      <Text style={cardStyles.title} numberOfLines={2}>{book.title}</Text>
      <Text style={cardStyles.author} numberOfLines={1}>{book.author}</Text>
      <View style={cardStyles.footer}>
        {book.audioUrl && <MaterialCommunityIcons name="headphones" size={13} color={colors.primary} />}
        {book.pdfUrl && <MaterialCommunityIcons name="file-pdf-box" size={13} color={colors.accentRed} />}
        {book.isPremium && (
          <View style={cardStyles.premiumTag}>
            <Text style={cardStyles.premiumText}>Premium</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const cardStyles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  info: { padding: 10 },
  category: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 3,
  },
  author: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.primary,
    marginBottom: 8,
  },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  premiumTag: {
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F9D616',
    marginLeft: 'auto',
  },
  premiumText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#C9A900',
  },
});

const FeaturedCard = ({ book, onPress }: { book: Book; onPress: () => void }) => (
  <TouchableOpacity style={featuredStyles.container} onPress={onPress} activeOpacity={0.85}>
    <View style={[featuredStyles.bg, { backgroundColor: book.coverColor }]}>
      <View style={featuredStyles.bgCircle} />
      <View style={featuredStyles.bgCircle2} />
      <View style={{ flex: 1, padding: 20, justifyContent: 'flex-end' }}>
        <View style={featuredStyles.badge}>
          <MaterialCommunityIcons name="star" size={10} color={book.coverColor} />
          <Text style={[featuredStyles.badgeText, { color: book.coverColor }]}>À la une</Text>
        </View>
        <Text style={[featuredStyles.title, { color: book.coverAccent }]}>{book.title}</Text>
        <Text style={featuredStyles.author}>{book.author}</Text>
        <View style={featuredStyles.chips}>
          {book.audioUrl && (
            <View style={featuredStyles.chip}>
              <MaterialCommunityIcons name="headphones" size={12} color="#fff" />
              <Text style={featuredStyles.chipText}>{book.duration}</Text>
            </View>
          )}
          {book.pages && (
            <View style={featuredStyles.chip}>
              <MaterialCommunityIcons name="book-open-variant" size={12} color="#fff" />
              <Text style={featuredStyles.chipText}>{book.pages} pages</Text>
            </View>
          )}
        </View>
      </View>
      <View style={featuredStyles.iconSide}>
        <MaterialCommunityIcons name={book.coverIcon as any} size={80} color={book.coverAccent + '40'} />
      </View>
    </View>
  </TouchableOpacity>
);

const featuredStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bg: {
    height: 160,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60,
    right: -40,
  },
  bgCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -40,
    left: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9D616',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  author: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#fff',
  },
  iconSide: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const BooksScreen = ({ navigation }: any) => {
  const [activeCategory, setActiveCategory] = useState('Tous');

  const featured = MOCK_BOOKS[0];

  const filtered = MOCK_BOOKS.filter((b) => {
    const matchCategory =
      activeCategory === 'Tous' ||
      b.category.toLowerCase() === activeCategory.toLowerCase();
    return matchCategory;
  });

  const showFeatured = activeCategory === 'Tous';
  const gridData = showFeatured ? filtered.filter(b => b.id !== featured.id) : filtered;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Djelia</Text>
          <Text style={styles.headerTitle}>Bibliothèque</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <MaterialCommunityIcons name="tune-variant" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={gridData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {showFeatured && (
              <FeaturedCard
                book={featured}
                onPress={() => navigation.navigate('BookDetail', { book: featured })}
              />
            )}
            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cats}
              style={{ marginHorizontal: -16, marginBottom: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.catChip, activeCategory === item && styles.catChipActive]}
                  onPress={() => setActiveCategory(item)}
                >
                  <Text style={[styles.catText, activeCategory === item && styles.catTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeCategory === 'Tous' ? 'Tous les livres' : activeCategory}
              </Text>
              <Text style={styles.sectionCount}>{filtered.length} titres</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="book-off-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Aucun livre trouvé</Text>
          </View>
        }
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
          />
        )}
      />

      <View style={styles.partnerBar}>
        <MaterialCommunityIcons name="handshake-outline" size={14} color={colors.gold} />
        <Text style={styles.partnerText}>En partenariat avec les maisons d'édition guinéennes</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: colors.text,
    lineHeight: 32,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cats: { paddingHorizontal: 16, gap: 8 },
  catChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.textMid,
  },
  catTextActive: {
    color: colors.white,
    fontFamily: 'Poppins_700Bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: colors.text,
  },
  sectionCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textLight,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: colors.textMid,
  },
  partnerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  partnerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.white,
  },
});