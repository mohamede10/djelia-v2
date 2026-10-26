import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '../../config/colors';
import { Book, BookCover } from './BooksScreen';
import { useAppContext } from '../../store/AppProvider';
import { readLocalBookFavorites, writeLocalBookFavorites } from '../../services/storageService';

type ReadingMode = null | 'pdf' | 'audio';

const formatTime = (millis: number): string => {
  if (!Number.isFinite(millis) || millis <= 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const BookAudioPlayer = ({ audioUrl, title }: { audioUrl: any; title: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync().catch(() => {});
        }
      : undefined;
  }, [sound]);

  const onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setError('Lecture impossible : le fichier audio est introuvable.');
      }
      return;
    }
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      setPosition(0);
    }
  };

  const handlePlayPause = async () => {
    setError('');
    try {
      if (!sound) {
        setIsLoading(true);
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const source = typeof audioUrl === 'string' ? { uri: audioUrl } : audioUrl;
        const { sound: created } = await Audio.Sound.createAsync(
          source,
          { shouldPlay: true },
          onStatus
        );
        setSound(created);
        setIsLoading(false);
        return;
      }
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (e) {
      console.warn('Book audio playback error:', e);
      setError('Impossible de lire cet audio pour le moment.');
      setIsLoading(false);
    }
  };

  const skip = async (seconds: number) => {
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      const target = Math.max(
        0,
        Math.min(status.durationMillis || 0, (status.positionMillis || 0) + seconds * 1000)
      );
      await sound.setPositionAsync(target);
      setPosition(target);
    } catch {
      // On ignore une erreur de déplacement ponctuelle.
    }
  };

  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <View style={audioStyles.container}>
      <View style={audioStyles.header}>
        <MaterialCommunityIcons name="headphones" size={20} color={colors.primary} />
        <Text style={audioStyles.label} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={audioStyles.progressBar}>
        <View style={[audioStyles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={audioStyles.timeRow}>
        <Text style={audioStyles.time}>{formatTime(position)}</Text>
        <Text style={audioStyles.time}>{duration > 0 ? formatTime(duration) : '--:--'}</Text>
      </View>
      <View style={audioStyles.controls}>
        <TouchableOpacity
          style={audioStyles.controlBtn}
          onPress={() => skip(-30)}
          disabled={!sound}
          accessibilityLabel="Reculer de 30 secondes"
        >
          <MaterialCommunityIcons
            name="rewind-30"
            size={28}
            color={sound ? colors.textMid : colors.borderDark}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={audioStyles.playBtn}
          onPress={handlePlayPause}
          disabled={isLoading}
          accessibilityLabel={isPlaying ? 'Mettre en pause' : 'Écouter'}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <MaterialCommunityIcons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color={colors.white}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={audioStyles.controlBtn}
          onPress={() => skip(30)}
          disabled={!sound}
          accessibilityLabel="Avancer de 30 secondes"
        >
          <MaterialCommunityIcons
            name="fast-forward-30"
            size={28}
            color={sound ? colors.textMid : colors.borderDark}
          />
        </TouchableOpacity>
      </View>
      {error ? <Text style={audioStyles.error}>{error}</Text> : null}
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
    flex: 1,
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
  error: {
    marginTop: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
  },
});

const PdfViewer = ({ pdfUrl, title }: { pdfUrl: string; title: string }) => {
  const [error, setError] = useState('');

  const openDocument = async () => {
    setError('');
    try {
      if (/^https?:\/\//i.test(pdfUrl)) {
        await WebBrowser.openBrowserAsync(pdfUrl);
        return;
      }
      const supported = await Linking.canOpenURL(pdfUrl);
      if (!supported) {
        throw new Error('unsupported');
      }
      await Linking.openURL(pdfUrl);
    } catch {
      setError("Impossible d'ouvrir ce document. Vérifie ta connexion ou réessaie plus tard.");
    }
  };

  return (
    <View style={pdfStyles.container}>
      <MaterialCommunityIcons name="file-pdf-box" size={48} color={colors.accentRed} />
      <Text style={pdfStyles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={pdfStyles.subtitle}>
        Le document s’ouvrira dans le lecteur PDF de ton appareil.
      </Text>
      <TouchableOpacity style={pdfStyles.openBtn} onPress={openDocument}>
        <MaterialCommunityIcons name="open-in-new" size={18} color={colors.white} />
        <Text style={pdfStyles.openBtnText}>Ouvrir le PDF</Text>
      </TouchableOpacity>
      {error ? <Text style={pdfStyles.error}>{error}</Text> : null}
    </View>
  );
};

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
  openBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentRed,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  openBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: colors.white,
  },
  error: {
    marginTop: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
  },
});

export const BookDetailScreen = ({ route }: any) => {
  const { book }: { book: Book } = route.params;
  const { user } = useAppContext();
  const userId = user?.id || 'local_user';
  const [mode, setMode] = useState<ReadingMode>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let active = true;
    readLocalBookFavorites(userId).then((ids) => {
      if (active) setIsFavorite(ids.includes(book.id));
    });
    return () => {
      active = false;
    };
  }, [book.id, userId]);

  const toggleBookmark = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    const current = await readLocalBookFavorites(userId);
    const updated = next
      ? Array.from(new Set([...current, book.id]))
      : current.filter((id) => id !== book.id);
    await writeLocalBookFavorites(userId, updated);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <BookCover book={book} height={280} iconSize={90} />
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
            <TouchableOpacity
              onPress={toggleBookmark}
              style={styles.favBtn}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
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

          {!book.pdfUrl && !book.audioUrl && (
            <View style={styles.unavailableBox}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textLight} />
              <Text style={styles.unavailableText}>
                La version numérique de ce livre est en cours de préparation. Reviens bientôt !
              </Text>
            </View>
          )}

          {mode === 'pdf' && book.pdfUrl && <PdfViewer pdfUrl={book.pdfUrl} title={book.title} />}
          {mode === 'audio' && book.audioUrl && (
            <BookAudioPlayer audioUrl={book.audioUrl} title={book.title} />
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
  unavailableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceWarm,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unavailableText: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMid,
  },
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