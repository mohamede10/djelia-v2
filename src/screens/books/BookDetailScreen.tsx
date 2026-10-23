import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../config/colors';
import { Book } from './BooksScreen';

const { width } = Dimensions.get('window');
type ReadingMode = null | 'pdf' | 'audio';

const AudioPlayer = ({ audioUrl, title }: { audioUrl: string; title: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <View style={audioStyles.container}>
      <View style={audioStyles.header}>
        <MaterialCommunityIcons name="headphones" size={20} color={colors.primary} />
        <Text style={audioStyles.label}>Livre audio</Text>
      </View>
      <View style={audioStyles.progressBar}>
        <View style={[audioStyles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={audioStyles.timeRow}>
        <Text style={audioStyles.time}>0:00</Text>
        <Text style={audioStyles.time}>--:--</Text>
      </View>
      <View style={audioStyles.controls}>
        <TouchableOpacity style={audioStyles.controlBtn}>
          <MaterialCommunityIcons name="rewind-30" size={28} color={colors.textMid} />
        </TouchableOpacity>
        <TouchableOpacity style={audioStyles.playBtn} onPress={() => setIsPlaying(!isPlaying)}>
          <MaterialCommunityIcons
            name={isPlaying ? 'pause' : 'play'}
            size={32}
            color={colors.white}
          />
        </TouchableOpacity>
        <TouchableOpacity style={audioStyles.controlBtn}>
          <MaterialCommunityIcons name="fast-forward-30" size={28} color={colors.textMid} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const audioStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: colors.text,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  time: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textLight,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  controlBtn: { padding: 8 },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

const PdfViewer = ({ pdfUrl }: { pdfUrl: string }) => (
  <View style={pdfStyles.container}>
    <MaterialCommunityIcons name="file-pdf-box" size={48} color={colors.accentRed} />
    <Text style={pdfStyles.title}>Lecteur PDF</Text>
    <Text style={pdfStyles.subtitle}>
      Installe <Text style={{ fontFamily: 'Poppins_700Bold' }}>react-native-pdf</Text> pour activer la lecture
    </Text>
  </View>
);

const pdfStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.surfaceWarm,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.textMid,
    textAlign: 'center',
  },
});

export const BookDetailScreen = ({ route }: any) => {
  const { book }: { book: Book } = route.params;
  const [mode, setMode] = useState<ReadingMode>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={{ uri: book.coverUrl }} style={styles.cover} />
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadges}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{book.category}</Text>
              </View>
              {book.isPremium && (
                <View style={styles.premiumBadge}>
                  <MaterialCommunityIcons name="crown" size={12} color={colors.gold} />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{book.title}</Text>
              <Text style={styles.author}>{book.author}</Text>
              <Text style={styles.publisher}>{book.publisher}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.favBtn}>
              <MaterialCommunityIcons
                name={isFavorite ? 'bookmark' : 'bookmark-outline'}
                size={28}
                color={isFavorite ? colors.gold : colors.textLight}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            {book.pages && (
              <View style={styles.metaChip}>
                <MaterialCommunityIcons name="file-document-outline" size={14} color={colors.textMid} />
                <Text style={styles.metaText}>{book.pages} pages</Text>
              </View>
            )}
            {book.duration && (
              <View style={styles.metaChip}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textMid} />
                <Text style={styles.metaText}>{book.duration}</Text>
              </View>
            )}
            <View style={styles.metaChip}>
              <MaterialCommunityIcons name="translate" size={14} color={colors.textMid} />
              <Text style={styles.metaText}>{book.language}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{book.description}</Text>

          <Text style={styles.sectionTitle}>Lire ou écouter</Text>
          <View style={styles.formatButtons}>
            {book.pdfUrl && (
              <TouchableOpacity
                style={[styles.formatBtn, mode === 'pdf' && styles.formatBtnActive]}
                onPress={() => setMode(mode === 'pdf' ? null : 'pdf')}
              >
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={22}
                  color={mode === 'pdf' ? colors.white : colors.accentRed}
                />
                <Text style={[styles.formatBtnText, mode === 'pdf' && styles.formatBtnTextActive]}>
                  Lire le PDF
                </Text>
              </TouchableOpacity>
            )}
            {book.audioUrl && (
              <TouchableOpacity
                style={[styles.formatBtn, mode === 'audio' && styles.formatBtnActive]}
                onPress={() => setMode(mode === 'audio' ? null : 'audio')}
              >
                <MaterialCommunityIcons
                  name="headphones"
                  size={22}
                  color={mode === 'audio' ? colors.white : colors.primary}
                />
                <Text style={[styles.formatBtnText, mode === 'audio' && styles.formatBtnTextActive]}>
                  Livre audio
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {mode === 'pdf' && book.pdfUrl && <PdfViewer pdfUrl={book.pdfUrl} />}
          {mode === 'audio' && book.audioUrl && (
            <AudioPlayer audioUrl={book.audioUrl} title={book.title} />
          )}

          <View style={styles.partnerBox}>
            <MaterialCommunityIcons name="handshake-outline" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.partnerTitle}>Partenaire éditeur</Text>
              <Text style={styles.partnerName}>{book.publisher}</Text>
              <Text style={styles.partnerNote}>
                Ce livre est disponible grâce au partenariat de numérisation Djelia × Éditeurs Guinéens.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: { height: 280, backgroundColor: colors.indigo, position: 'relative' },
  cover: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.6 },
  heroOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  heroBadges: { flexDirection: 'row', gap: 8 },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  categoryText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.white,
    textTransform: 'capitalize',
  },
  premiumBadge: {
    backgroundColor: 'rgba(249,214,22,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  premiumText: { fontFamily: 'Poppins_700Bold', fontSize: 12, color: colors.gold },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: colors.text, lineHeight: 30 },
  author: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.primary, marginTop: 4 },
  publisher: { fontFamily: 'Poppins_300Light', fontSize: 12, color: colors.textLight, marginTop: 2 },
  favBtn: { padding: 4, marginLeft: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.textMid },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: colors.text, marginBottom: 8 },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textMid,
    lineHeight: 22,
    marginBottom: 24,
  },
  formatButtons: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  formatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  formatBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  formatBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: colors.textMid },
  formatBtnTextActive: { color: colors.white },
  partnerBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceWarm,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  partnerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  partnerName: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: colors.primary, marginTop: 2 },
  partnerNote: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: colors.textMid,
    marginTop: 4,
    lineHeight: 18,
  },
});