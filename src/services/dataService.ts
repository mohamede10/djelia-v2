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

export type Story = {
  id: string;
  title: string;
  category: string;
  region: string;
  ethnicGroup: string;
  content: string;
  imageUrl: string;
  audioUrl?: any;
  likes?: number;
  views?: number;
};

// Bibliothèque culturelle initiale de référence (Contes, Fables, Proverbes et Coutumes de Guinée)
export const INITIAL_STORIES: Story[] = [
  {
    id: '1',
    title: 'Soundiata Keïta : L\'Éveil du Lion',
    category: 'Conte',
    region: 'Kankan',
    ethnicGroup: 'Mandingue',
    content: `Il était une fois, dans le royaume du Manden, un enfant nommé Soundiata qui naquit infirme. Les moqueries pleuvaient sur lui et sur sa mère, Sogolon Kondé, la femme-buffle. Mais le destin ne se lit pas dans les jambes, il se forge dans le cœur.

Pendant sept ans, Soundiata resta assis, ignorant les rires. Mais un jour, poussé par l'humiliation infligée à sa mère, il demanda une barre de fer. Dans un effort surhumain qui fit trembler la terre, il se redressa, tordit le fer en un arc majestueux et se tint debout. Le lion venait de s'éveiller.

Sa route fut longue, semée d'exils et de batailles. Contre le redoutable roi-sorcier Soumaoro Kanté, Soundiata utilisa non seulement la force, mais aussi la ruse et la sagesse. À la bataille de Kirina en 1235, il brisa les chaînes de l'oppression et fonda l'Empire du Mali, instaurant la Charte du Manden, l'une des premières déclarations des droits de l'homme au monde.

Aujourd'hui encore, sous les baobabs millénaires, les griots chantent le nom du fils de Maghan Kon Fatta, rappelant que la patience est le chemin de la royauté.`,
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    audioUrl: require('../../assets/audio/soundiatastory.mp3'),
    likes: 142,
    views: 1250,
  },
  {
    id: '2',
    title: 'La Trahison de l\'Hyène',
    category: 'Fable',
    region: 'Labé',
    ethnicGroup: 'Peul',
    content: `Au temps où les animaux parlaient encore aux hommes, l'Hyène et le Lièvre avaient conclu un pacte de fraternité. En cette période de grande sécheresse, la faim tordait les entrailles de tous les habitants de la brousse.

Le Lièvre, toujours astucieux, proposa à l'Hyène de creuser un puits ensemble. "Maître Lièvre, tes pattes sont trop fines, laisse-moi faire le gros travail," ricana l'Hyène, pensant déjà à garder l'eau pour elle seule. Mais dès que la première source jaillit, l'Hyène poussa le Lièvre au fond et referma l'entrée avec une lourde pierre.

"Désormais, cette eau est le privilège des forts !" s'écria-t-elle. Mais le Lièvre n'avait pas dit son dernier mot. Par un tunnel secret qu'il avait commencé à creuser par précaution, il ressortit derrière l'Hyène. Il imita alors la voix rugissante du Lion, le roi de la forêt.

Prise de panique, l'Hyène s'enfuit si vite qu'elle en perdit son souffle, laissant le puits à la disposition de tous les animaux assoiffés. Cette fable nous enseigne que la ruse du sage triomphera toujours de la cupidité du tyran.`,
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
    likes: 89,
    views: 890,
  },
  {
    id: '3',
    title: 'Le Souffle du Nimba',
    category: 'Coutume',
    region: 'Nzérékoré',
    ethnicGroup: 'Baga',
    content: `Chez les Baga, sur les côtes brumeuses de la Guinée, réside une divinité protectrice : la Nimba (D'mba). Plus qu'un masque, elle est l'incarnation de la générosité de la terre et de la force de la maternité.

Taillée dans le bois noble, la Nimba porte sur ses épaules le poids des récoltes à venir. Ses grands seins tombants symbolisent une mère qui a nourri de nombreuses générations. Lors des grandes cérémonies de riziculture, le porteur du masque s'agite sous une parure de raphia, guidé par les chants des femmes et le rythme saccadé des tambours.

On raconte que lorsque la Nimba danse, la pluie tombe là où le sol était aride, et les ventres stériles s'ouvrent à la vie. Respecter la Nimba, c'est respecter le cycle éternel de la nature. Ne jamais la regarder avec défi, car elle est le miroir de notre propre humilité devant les ancêtres.

Celui qui possède une statuette Nimba dans sa demeure ne connaîtra jamais la famine, car le souffle de la déesse remplit les greniers de ceux qui partagent leur pain.`,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    likes: 215,
    views: 1840,
  },
  {
    id: '4',
    title: 'La Prophétie du Fouta',
    category: 'Conte',
    region: 'Labé',
    ethnicGroup: 'Peul',
    content: `Sur les hauteurs du Fouta Djallon, là où les sources des grands fleuves prennent naissance, vivait un berger nommé Alfa. Il possédait un troupeau dont les cornes touchaient presque les nuages. 

Un soir de pleine lune, une vieille femme lui demande l'hospitalité. Alfa lui offrit le meilleur lait de ses vaches. En remerciement, elle lui confia un secret : "Alfa, les nuages que tes bêtes frôlent vont bientôt se transformer en larmes de feu. Conduis ton troupeau vers la vallée du silence avant le lever du soleil."

Alfa écouta son intuition. Le lendemain, un orage de foudre s'abattit sur la montagne, mais Alfa et ses bêtes étaient à l'abri. Il comprit alors que la véritable richesse n'est pas dans le nombre de têtes de bétail, mais dans l'écoute des anciens et des signes que la nature nous envoie.

Depuis ce jour, au Fouta, on dit que celui qui respecte l'étranger respecte son propre avenir.`,
    imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
    likes: 110,
    views: 920,
  },
  {
    id: '5',
    title: 'Les Proverbes du Baobab',
    category: 'Proverbe',
    region: 'Kankan',
    ethnicGroup: 'Mandingue',
    content: `Sous l'ombre immense du baobab, les anciens du Manden se réunissent encore pour transmettre la parole qui éclaire. Voici quelques proverbes que le griot confie à celui qui sait écouter.

« Le petit oiseau qui s'agite dans le nid ne fait pas tomber l'arbre. » — Les bruits du monde ne doivent pas troubler celui qui connaît sa route.

« C'est au bout de l'ancienne corde que l'on tisse la nouvelle. » — Nous avançons grâce à l'expérience de ceux qui nous ont précédés.

« La main qui donne est toujours au-dessus de la main qui reçoit. » — Donner est une noblesse, recevoir est une leçon d'humilité.

« Si tu veux aller vite, marche seul ; si tu veux aller loin, marchons ensemble. » — L'union fait la force des peuples.

« La patience est l'arbre dont la racine est amère et le fruit très doux. » — Rien de grand ne se construit dans la précipitation.

Médite ces paroles, mon enfant : elles sont légères à porter et lourdes de sens.`,
    imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
    likes: 64,
    views: 540,
  }
];

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
          const localStory = INITIAL_STORIES.find((story) => story.id === docSnap.id);
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
  return INITIAL_STORIES;
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
        const localStory = INITIAL_STORIES.find((story) => story.id === id);
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
  return INITIAL_STORIES.find(s => s.id === id);
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
 * Alimentation initiale (Seed) de Firestore avec les récits culturels authentiques de Guinée
 */
export const seedInitialStoriesToFirestore = async (): Promise<void> => {
  if (!isFirebaseConfigured) return;
  try {
    const storiesCol = collection(db, 'stories');
    const existing = await getDocs(storiesCol);
    // On ne réécrit jamais une bibliothèque déjà alimentée.
    if (!existing.empty) return;

    for (const story of INITIAL_STORIES) {
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
