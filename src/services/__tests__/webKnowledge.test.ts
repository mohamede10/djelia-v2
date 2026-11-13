import {
  buildDuckDuckGoUrl,
  buildWikipediaSearchUrl,
  decodeDuckDuckGoUrl,
  decodeHtml,
  parseDuckDuckGoHtml,
  parseWikipediaResponse,
  searchWeb,
} from '../webKnowledge';

describe('webKnowledge', () => {
  it('construit une URL de recherche DuckDuckGo en français', () => {
    const url = buildDuckDuckGoUrl('capitale guinee');

    expect(url.startsWith('https://html.duckduckgo.com/html/?')).toBe(true);
    expect(url).toContain('q=capitale%20guinee');
    expect(url).toContain('kl=fr-fr');
  });

  it('décode les redirections DuckDuckGo et écarte les publicités', () => {
    expect(
      decodeDuckDuckGoUrl(
        '//duckduckgo.com/l/?uddg=https%3A%2F%2Ffr.wikipedia.org%2Fwiki%2FConakry&rut=abc'
      )
    ).toBe('https://fr.wikipedia.org/wiki/Conakry');
    expect(decodeDuckDuckGoUrl('//duckduckgo.com/y.js?ad=1')).toBe('');
    expect(decodeDuckDuckGoUrl('')).toBe('');
  });

  it('décode les entités HTML des snippets', () => {
    expect(decodeHtml('Conakry &#x27;capitale&#x27; &amp; plus grande ville')).toBe(
      "Conakry 'capitale' & plus grande ville"
    );
  });

  it('extrait les résultats pertinents de la page DuckDuckGo', () => {
    const html = `
      <div class="result">
        <a rel="nofollow" class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Ffr.wikipedia.org%2Fwiki%2FConakry&amp;rut=abc">Conakry - Wikipédia</a>
        <a class="result__snippet" href="#">Conakry est la capitale de la Guinée.</a>
      </div>
      <div class="result">
        <a class="result__a" href="//duckduckgo.com/y.js?ad=1">Publicité</a>
        <a class="result__snippet" href="#">Achetez maintenant.</a>
      </div>
    `;

    const sources = parseDuckDuckGoHtml(html);

    expect(sources).toHaveLength(1);
    expect(sources[0].title).toBe('Conakry - Wikipédia');
    expect(sources[0].url).toBe('https://fr.wikipedia.org/wiki/Conakry');
    expect(sources[0].excerpt).toBe('Conakry est la capitale de la Guinée.');
  });

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
    expect(parseDuckDuckGoHtml('')).toEqual([]);
  });

  it('ne lance aucune recherche pour une question sans terme utile', async () => {
    await expect(searchWeb('qui es-tu ?')).resolves.toEqual([]);
    await expect(searchWeb('')).resolves.toEqual([]);
  });
});
