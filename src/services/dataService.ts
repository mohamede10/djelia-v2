import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { readLocalFavorites, writeLocalFavorites } from './storageService';

import { INITIAL_STORIES, type Story } from '../data/stories';

export { INITIAL_STORIES };
export type { Story };

/**
 * Les fichiers audio sont des assets Metro (`require`), impossibles à charger
 * depuis Node. Ils sont donc déclarés ici et non dans `src/data/stories.ts`,
 * qui reste importable par le script de seed Firestore (`npm run seed`).
 */
const BUNDLED_STORY_AUDIO: Record<string, any> = {
  '1': require('../../assets/audio/soundiatastory.mp3'),
};

const withBundledAudio = (story: Story): Story =>
  story.audioUrl ? story : { ...story, audioUrl: BUNDLED_STORY_AUDIO[story.id] };

/** Catalogue local enrichi des assets audio embarqués (fallback hors-ligne). */
export const LOCAL_STORIES: Story[] = INITIAL_STORIES.map(withBundledAudio);


/**
 * Facettes dérivées du catalogue : elles alimentent les filtres de recherche
 * sans liste codée en dur, pour supporter l'ajout de nouveaux récits.
 */
const uniqueSorted = (values: string[]): string[] =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'fr'));

export const STORY_REGIONS: string[] = [
  'Toutes',
  ...uniqueSorted(INITIAL_STORIES.map((story) => story.region)),
];

export const STORY_ETHNIC_GROUPS: string[] = [
  'Toutes',
  ...uniqueSorted(INITIAL_STORIES.map((story) => story.ethnicGroup)),
];

export const STORY_CATEGORY_FILTERS: string[] = [
  'Toutes',
  ...uniqueSorted(INITIAL_STORIES.map((story) => `${story.category}s`)),
];

/**
 * Normalise une facette de catégorie reçue depuis une navigation.
 * Les totems d'accueil envoient le pluriel (« Contes »), mais un appel direct
 * peut fournir le singulier (« Conte ») : les deux formes sont acceptées, et
 * une valeur inconnue retombe sur « Toutes ».
 */
export const resolveCategoryFilter = (value?: string): string => {
  if (!value) return 'Toutes';
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'Toutes';
  return (
    STORY_CATEGORY_FILTERS.find(
      (category) =>
        category.toLowerCase() === normalized ||
        category.toLowerCase() === `${normalized}s`
    ) || 'Toutes'
  );
};

/**
 * Récupère la liste des histoires (Firestore avec fallback local instantané)
 */
export const getStories = async (): Promise<Story[]> => {
  if (isFirebaseConfigured) {
    try {
      const storiesCol = collection(db, 'stories');
      const snapshot = await getDocs(storiesCol);
      if (!snapshot.empty) {
        const stories: Story[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<Story, 'id'>;
          // Les fichiers audio locaux ne sont pas stockés dans Firestore :
          // on récupère celui du catalogue local pour conserver la narration.
          const localStory = LOCAL_STORIES.find((story) => story.id === docSnap.id);
          stories.push({
            id: docSnap.id,
            ...data,
            audioUrl: data.audioUrl || localStory?.audioUrl,
          });
        });
        return stories;
      }
    } catch (e) {
      console.warn("Firestore stories fetch error, using local fallback:", e);
    }
  }
  return LOCAL_STORIES;
};

/**
 * Normalise une chaîne pour une recherche insensible à la casse et aux accents
 * (« Nzerekore » doit retrouver « Nzérékoré »).
 */
export const normalizeForSearch = (value: string): string => {
  const lower = (value || '').toLowerCase();
  if (typeof lower.normalize !== 'function') return lower;
  return lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Recherche avec multi-filtres (Région, Ethnie, Catégorie, Recherche texte)
 */
export const searchStories = async (
  queryText: string, 
  regionFilter?: string, 
  ethnicFilter?: string, 
  categoryFilter?: string
): Promise<Story[]> => {
  const all = await getStories();
  let results = all;

  if (queryText && queryText.trim()) {
    const q = normalizeForSearch(queryText.trim());
    const matches = (field?: string) => {
      const normalized = normalizeForSearch(field || '');
      if (normalized.includes(q)) return true;
      // Tolérance sur le pluriel : « contes » retrouve aussi « conte ».
      return q.endsWith('s') && normalized.includes(q.slice(0, -1));
    };

    results = results.filter(s => 
      matches(s.title) || 
      matches(s.content) ||
      matches(s.region) ||
      matches(s.ethnicGroup) ||
      matches(s.category)
    );
  }

  if (regionFilter && regionFilter !== 'Toutes') {
    results = results.filter(s => s.region === regionFilter);
  }

  if (ethnicFilter && ethnicFilter !== 'Toutes') {
    results = results.filter(s => s.ethnicGroup === ethnicFilter);
  }

  if (categoryFilter && categoryFilter !== 'Toutes') {
    results = results.filter(s => 
      s.category.toLowerCase() === categoryFilter.toLowerCase() || 
      s.category.toLowerCase() + 's' === categoryFilter.toLowerCase()
    );
  }

  return results;
};

/**
 * Récupérer une histoire spécifique par ID
 */
export const getStoryById = async (id: string): Promise<Story | undefined> => {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'stories', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Omit<Story, 'id'>;
        const localStory = LOCAL_STORIES.find((story) => story.id === id);
        return {
          id: snap.id,
          ...data,
          audioUrl: data.audioUrl || localStory?.audioUrl,
        };
      }
    } catch (e) {
      console.warn("Firestore getStoryById error:", e);
    }
  }
  return LOCAL_STORIES.find(s => s.id === id);
};

/**
 * Gestion des favoris utilisateur dans Firestore
 */
export const fetchUserFavorites = async (userId: string): Promise<string[]> => {
  if (!userId) return [];

  if (isFirebaseConfigured && !userId.startsWith('local_')) {
    try {
      const favsCol = collection(db, 'favorites');
      const q = query(favsCol, where('userId', '==', userId));
      const snap = await getDocs(q);
      const ids: string[] = [];
      snap.forEach((favoriteDoc) => {
        ids.push(favoriteDoc.data().storyId);
      });
      await writeLocalFavorites(userId, ids);
      return ids;
    } catch (e) {
      console.warn("Fetch favorites error, using local cache:", e);
    }
  }
  return readLocalFavorites(userId);
};

export const toggleFavoriteRecord = async (userId: string, storyId: string, currentFavs: string[]): Promise<string[]> => {
  const isFav = currentFavs.includes(storyId);
  const updatedFavs = isFav ? currentFavs.filter(id => id !== storyId) : [...currentFavs, storyId];

  if (isFirebaseConfigured && userId && !userId.startsWith('local_')) {
    try {
      const favDocRef = doc(db, 'favorites', `${userId}_${storyId}`);
      if (isFav) {
        await deleteDoc(favDocRef);
      } else {
        await setDoc(favDocRef, {
          userId,
          storyId,
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.error("Error updating favorite in Firestore:", e);
    }
  }

  // Cache local systématique : les favoris restent visibles hors connexion.
  await writeLocalFavorites(userId, updatedFavs);

  return updatedFavs;
};

/**
 * Alimentation initiale (Seed) de Firestore avec les récits culturels authentiques de Guinée.
 * Seuls les récits absents sont ajoutés : un contenu existant (même modifié par un
 * administrateur) n'est jamais écrasé.
 */
export const seedInitialStoriesToFirestore = async (): Promise<void> => {
  if (!isFirebaseConfigured) return;
  try {
    const storiesCol = collection(db, 'stories');
    const existing = await getDocs(storiesCol);
    const existingIds = new Set<string>();
    existing.forEach((docSnap) => existingIds.add(docSnap.id));

    const missingStories = INITIAL_STORIES.filter((story) => !existingIds.has(story.id));
    if (missingStories.length === 0) return;

    for (const story of missingStories) {
      const { id, ...data } = story;
      const cleanData = {
        ...data,
        audioUrl: typeof data.audioUrl === 'string' ? data.audioUrl : null,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'stories', id), cleanData, { merge: true });
    }
  } catch (e) {
    console.error("Error seeding stories to Firestore:", e);
  }
};
