import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from './authService';
import type { Story } from '../data/stories';

/**
 * Petit service de stockage local, utilisé pour :
 *  - mémoriser que l'onboarding a déjà été vu ;
 *  - conserver les favoris en mode hors-ligne / démo ;
 *  - restaurer la session de démonstration (sans Firebase) entre deux lancements.
 *
 * Sur mobile on utilise Expo SecureStore (chiffré), sur le web le localStorage.
 */

const ONBOARDING_KEY = 'djelia_onboarding_seen';
const LOCAL_USER_KEY = 'djelia_local_user';

const readValue = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

const writeValue = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Stockage indisponible : on ignore silencieusement.
  }
};

const deleteValue = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Stockage indisponible : on ignore silencieusement.
  }
};

// --- Onboarding ---

export const hasSeenOnboarding = async (): Promise<boolean> => {
  const value = await readValue(ONBOARDING_KEY);
  return value === '1';
};

export const markOnboardingAsSeen = async (): Promise<void> => {
  await writeValue(ONBOARDING_KEY, '1');
};

// --- Session locale (mode démo sans Firebase) ---

export const readLocalUser = async (): Promise<UserProfile | null> => {
  const raw = await readValue(LOCAL_USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.id !== 'string') {
      return null;
    }
    return parsed as UserProfile;
  } catch {
    return null;
  }
};

export const writeLocalUser = async (profile: UserProfile): Promise<void> => {
  await writeValue(
    LOCAL_USER_KEY,
    JSON.stringify({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      photoUrl: profile.photoUrl,
      preferredLanguages: profile.preferredLanguages,
      role: profile.role,
    })
  );
};

export const clearLocalUser = async (): Promise<void> => {
  await deleteValue(LOCAL_USER_KEY);
};

// --- Favoris locaux (mode démo / hors-ligne) ---

const favoritesKey = (userId: string) => `djelia_favorites_${userId}`;

export const readLocalFavorites = async (userId: string): Promise<string[]> => {
  const raw = await readValue(favoritesKey(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

export const writeLocalFavorites = async (userId: string, storyIds: string[]): Promise<void> => {
  await writeValue(favoritesKey(userId), JSON.stringify(storyIds));
};

export const clearLocalFavorites = async (userId: string): Promise<void> => {
  await deleteValue(favoritesKey(userId));
};

// --- Favoris de livres (séparés des récits pour éviter les collisions d'identifiants) ---

const bookFavoritesKey = (userId: string) => `djelia_book_favorites_${userId}`;

const parseStringArray = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

export const readLocalBookFavorites = async (userId: string): Promise<string[]> => {
  return parseStringArray(await readValue(bookFavoritesKey(userId)));
};

export const writeLocalBookFavorites = async (userId: string, bookIds: string[]): Promise<void> => {
  await writeValue(bookFavoritesKey(userId), JSON.stringify(bookIds));
};

// --- Catalogue hors-ligne (cahier des charges § 5.5 « Offline-first ») ---

/**
 * Le catalogue complet (50 récits et leur texte) dépasse largement la limite
 * d'environ 2 Ko par entrée d'Expo SecureStore : on utilise donc AsyncStorage,
 * qui accepte des valeurs volumineuses et fonctionne aussi sur le web.
 */
const CATALOGUE_CACHE_KEY = 'djelia_catalogue_cache_v1';

export type CachedCatalogue = {
  /** Horodatage de l'enregistrement, en millisecondes. */
  savedAt: number;
  stories: Story[];
};

/**
 * Les fichiers audio embarqués sont des assets Metro (`require`) : leur valeur
 * n'est pas sérialisable. On ne met donc en cache que les champs texte, puis
 * `dataService` réassocie l'audio local à la lecture.
 */
export const toCacheableStories = (stories: Story[]): Story[] =>
  stories.map(({ audioUrl, ...story }) => story as Story);

export const readCachedCatalogue = async (): Promise<CachedCatalogue | null> => {
  try {
    const raw = await AsyncStorage.getItem(CATALOGUE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.savedAt !== 'number' ||
      !Array.isArray(parsed.stories)
    ) {
      return null;
    }
    const stories = parsed.stories.filter(
      (story: unknown): story is Story =>
        !!story &&
        typeof story === 'object' &&
        typeof (story as Story).id === 'string' &&
        typeof (story as Story).title === 'string'
    );
    return stories.length > 0 ? { savedAt: parsed.savedAt, stories } : null;
  } catch {
    return null;
  }
};

export const writeCachedCatalogue = async (stories: Story[]): Promise<void> => {
  if (stories.length === 0) return;
  try {
    const payload: CachedCatalogue = {
      savedAt: Date.now(),
      stories: toCacheableStories(stories),
    };
    await AsyncStorage.setItem(CATALOGUE_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Cache indisponible (quota, navigation privée) : l'application continue
    // avec le catalogue embarqué.
  }
};

export const clearCachedCatalogue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CATALOGUE_CACHE_KEY);
  } catch {
    // Rien à faire.
  }
};
