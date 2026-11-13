import {
  buildWikipediaSearchUrl,
  parseWikipediaResponse,
  searchWeb,
} from '../webKnowledge';

describe('webKnowledge', () => {
  it('construit une URL de recherche Wikipédia française', () => {
    const url = buildWikipediaSearchUrl('masque Nimba', { limit: 2 });

    expect(url.startsWith('https://fr.wikipedia.org/w/api.php?')).toBe(true);
    expect(url).toContain('generator=search');
    expect(url).toContain('masque+Nimba');
    expect(url).toContain('gsrlimit=2');
  });

  it('trie les pages par pertinence et construit leurs URL', () => {
    const sources = parseWikipediaResponse({
      query: {
        pages: {
          '2': {
            title: 'Soundiata Keïta',
            index: 2,
            extract: '  Empereur du Mali.  ',
          },
          '1': {
            title: 'Empire du Mali',
            index: 1,
            extract: 'Empire ouest-africain fondé au XIIIe siècle.',
          },
          '3': { title: 'Page vide', index: 3, extract: '   ' },
        },
      },
    });

    expect(sources).toHaveLength(2);
    expect(sources[0].title).toBe('Empire du Mali');
    expect(sources[0].url).toBe(
      'https://fr.wikipedia.org/wiki/Empire_du_Mali'
    );
    expect(sources[1].title).toBe('Soundiata Keïta');
    expect(sources[1].excerpt).toBe('Empereur du Mali.');
  });

  it('ignore les réponses inattendues', () => {
    expect(parseWikipediaResponse(null)).toEqual([]);
    expect(parseWikipediaResponse({})).toEqual([]);
    expect(parseWikipediaResponse({ query: { pages: {} } })).toEqual([]);
  });

  it('ne lance aucune recherche pour une question sans terme utile', async () => {
    await expect(searchWeb('qui es-tu ?')).resolves.toEqual([]);
    await expect(searchWeb('')).resolves.toEqual([]);
  });
});
