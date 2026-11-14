import { getCatalogue, invalidateCatalogue } from '../dataService';

/**
 * Ces tests simulent un appareil hors connexion alors que Firebase est
 * configuré : le catalogue doit provenir du cache local, et l'application
 * doit le signaler (`degraded: true`).
 */

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  getDocs: jest.fn(async () => {
    throw new Error('offline');
  }),
  getDoc: jest.fn(async () => {
    throw new Error('offline');
  }),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  db: {},
  isFirebaseConfigured: true,
}));

jest.mock('../storageService', () => ({
  readLocalFavorites: jest.fn(async () => []),
  writeLocalFavorites: jest.fn(async () => undefined),
  readCachedCatalogue: jest.fn(async () => ({
    savedAt: 1_700_000_000_000,
    stories: [
      {
        id: '1',
        title: 'Récit en cache',
        category: 'Conte',
        region: 'Kankan',
        ethnicGroup: 'Mandingue',
        content: 'Contenu enregistré lors de la dernière connexion.',
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
      },
    ],
  })),
  writeCachedCatalogue: jest.fn(async () => undefined),
}));

describe('catalogue hors connexion', () => {
  beforeEach(() => {
    invalidateCatalogue();
  });

  it('sert le dernier catalogue enregistré quand Firestore échoue', async () => {
    const catalogue = await getCatalogue({ force: true });
    expect(catalogue.source).toBe('cache');
    expect(catalogue.degraded).toBe(true);
    expect(catalogue.savedAt).toBe(1_700_000_000_000);
    expect(catalogue.stories).toHaveLength(1);
    expect(catalogue.stories[0].title).toBe('Récit en cache');
  });

  it('réassocie la narration audio embarquée au récit mis en cache', async () => {
    const catalogue = await getCatalogue({ force: true });
    // Le récit « 1 » possède une piste audio livrée avec l'application.
    expect(catalogue.stories[0].audioUrl).toBeDefined();
  });

  it('ne relit pas le cache tant que le résultat est en mémoire', async () => {
    const first = await getCatalogue({ force: true });
    const second = await getCatalogue();
    expect(second).toBe(first);
  });
});
