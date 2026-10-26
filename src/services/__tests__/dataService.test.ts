import {
  INITIAL_STORIES,
  STORY_CATEGORY_FILTERS,
  STORY_ETHNIC_GROUPS,
  STORY_REGIONS,
  getStoryById,
  normalizeForSearch,
  searchStories,
} from '../dataService';

// Les tests unitaires ne doivent dépendre ni du réseau ni d'un projet Firebase.
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  db: {},
  isFirebaseConfigured: false,
}));

jest.mock('../storageService', () => ({
  readLocalFavorites: jest.fn(async () => []),
  writeLocalFavorites: jest.fn(async () => undefined),
}));

const CATEGORIES = ['Conte', 'Fable', 'Proverbe', 'Coutume'];

describe('catalogue culturel Djelia', () => {
  it('contient au moins 50 récits, comme exigé par le cahier des charges', () => {
    expect(INITIAL_STORIES.length).toBeGreaterThanOrEqual(50);
  });

  it('utilise des identifiants uniques', () => {
    const ids = INITIAL_STORIES.map((story) => story.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('couvre les quatre catégories éditoriales', () => {
    CATEGORIES.forEach((category) => {
      const count = INITIAL_STORIES.filter((story) => story.category === category).length;
      expect(count).toBeGreaterThan(0);
    });
  });

  it('fournit tous les champs obligatoires pour chaque récit', () => {
    INITIAL_STORIES.forEach((story) => {
      expect(story.title.trim().length).toBeGreaterThan(0);
      expect(story.content.trim().length).toBeGreaterThan(80);
      expect(story.region.trim().length).toBeGreaterThan(0);
      expect(story.ethnicGroup.trim().length).toBeGreaterThan(0);
      expect(story.imageUrl).toMatch(/^https:\/\//);
      expect(CATEGORIES).toContain(story.category);
    });
  });

  it('dérive les facettes de filtre depuis le catalogue', () => {
    expect(STORY_REGIONS[0]).toBe('Toutes');
    expect(STORY_ETHNIC_GROUPS[0]).toBe('Toutes');
    expect(STORY_CATEGORY_FILTERS).toEqual(
      expect.arrayContaining(['Toutes', 'Contes', 'Fables', 'Proverbes', 'Coutumes'])
    );
    expect(STORY_REGIONS).toEqual(expect.arrayContaining(['Kankan', 'Labé', 'Nzérékoré']));
  });
});

describe('normalizeForSearch', () => {
  it('ignore la casse et les accents', () => {
    expect(normalizeForSearch('Nzérékoré')).toBe('nzerekore');
    expect(normalizeForSearch('  BOFFA ')).toBe('  boffa ');
  });
});

describe('searchStories', () => {
  it('filtre par catégorie au pluriel', async () => {
    const contes = await searchStories('', undefined, undefined, 'Contes');
    expect(contes.length).toBeGreaterThan(0);
    contes.forEach((story) => expect(story.category).toBe('Conte'));
  });

  it('filtre par région', async () => {
    const results = await searchStories('', 'Labé');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((story) => expect(story.region).toBe('Labé'));
  });

  it('filtre par ethnie', async () => {
    const results = await searchStories('', undefined, 'Peul');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((story) => expect(story.ethnicGroup).toBe('Peul'));
  });

  it('combine région et catégorie', async () => {
    const results = await searchStories('', 'Kankan', undefined, 'Contes');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((story) => {
      expect(story.region).toBe('Kankan');
      expect(story.category).toBe('Conte');
    });
  });

  it('retrouve un récit sans accent depuis une requête accentuée', async () => {
    const results = await searchStories('Nzérékoré');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((story) => {
      const haystack = normalizeForSearch(
        `${story.title} ${story.content} ${story.region} ${story.ethnicGroup} ${story.category}`
      );
      expect(haystack).toContain('nzerekore');
    });
  });

  it('tolère le pluriel dans la requête libre', async () => {
    const results = await searchStories('contes');
    expect(results.length).toBeGreaterThan(0);
  });

  it('renvoie un tableau vide pour une recherche sans résultat', async () => {
    const results = await searchStories('xyz-introuvable-123');
    expect(results).toEqual([]);
  });
});

describe('getStoryById', () => {
  it('retourne le récit correspondant', async () => {
    const story = await getStoryById('31');
    expect(story?.title).toBe('Le Griot et le Roi Silencieux');
  });

  it('retourne undefined pour un identifiant inconnu', async () => {
    expect(await getStoryById('9999')).toBeUndefined();
  });
});
