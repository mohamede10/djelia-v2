/**
 * Connaissance externe de DjeliBot.
 *
 * Quand le catalogue Djelia ne suffit pas, le bot interroge le web : recherche
 * DuckDuckGo (snippets + URL) puis, en secours, l'API publique de Wikipédia.
 * Les extraits sont transmis au modèle avec leur URL : toute information
 * externe reste ainsi citable.
 *
 * Aucune clé d'API n'est nécessaire. Le module n'a aucune dépendance React
 * Native ni Firebase : il tourne dans la fonction serverless Vercel et dans les
 * tests Jest.
 */

import { normalize, tokenize, type ExternalSource } from './djeliBotKnowledge';

const DEFAULT_LIMIT = 3;
const DEFAULT_TIMEOUT_MS = 4_000;
const DEFAULT_LANG = 'fr';
const MAX_EXCERPT_CHARS = 700;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

export type WebSearchOptions = {
  /** Nombre maximum de sources retournées (défaut : 3). */
  limit?: number;
  /** Délai maximal de chaque requête (défaut : 4 s). */
  timeoutMs?: number;
  /** Langue de Wikipédia (défaut : fr). */
  lang?: string;
};

const compact = (value: string): string => value.replace(/\s+/g, ' ').trim();

/** Décode les entités HTML les plus courantes et supprime les balises. */
export const decodeHtml = (value: string): string =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

/**
 * Les liens DuckDuckGo sont des redirections `/l/?uddg=<url>`. On récupère
 * l'URL réelle et on écarte les liens publicitaires.
 */
export const decodeDuckDuckGoUrl = (href: string): string => {
  if (!href) return '';

  const absolute = href.startsWith('//')
    ? `https:${href}`
    : href.startsWith('/')
      ? `https://duckduckgo.com${href}`
      : href;

  try {
    const url = new URL(absolute);
    const target = url.searchParams.get('uddg');
    if (target) return target;
    if (url.hostname.endsWith('duckduckgo.com') && url.pathname.startsWith('/y.js')) {
      return '';
    }
    return absolute;
  } catch {
    return '';
  }
};

export const buildDuckDuckGoUrl = (query: string): string =>
  `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=fr-fr`;

/**
 * Extrait les résultats de la page HTML de DuckDuckGo. Le parsing reste
 * tolérant : si la structure change, on renvoie simplement moins de sources.
 */
export const parseDuckDuckGoHtml = (html: string): ExternalSource[] => {
  if (typeof html !== 'string' || html.length === 0) return [];

  const results: ExternalSource[] = [];
  let current: ExternalSource | null = null;
  const anchors = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchors.exec(html)) !== null) {
    const attrs = match[1];
    const inner = match[2];
    const className = /class="([^"]*)"/i.exec(attrs)?.[1] || '';

    if (className.includes('result__a')) {
      const href = /href="([^"]+)"/i.exec(attrs)?.[1];
      const url = href ? decodeDuckDuckGoUrl(href) : '';
      const title = decodeHtml(inner).trim();

      if (!url || !title) {
        current = null;
        continue;
      }

      current = { title, url, excerpt: '' };
      results.push(current);
    } else if (className.includes('result__snippet') && current) {
      current.excerpt = compact(decodeHtml(inner)).slice(0, MAX_EXCERPT_CHARS);
      current = null;
    }
  }

  return results.filter((result) => result.title && result.url && result.excerpt);
};

/** Construit l'URL de recherche Wikipédia (une seule requête pour les extraits). */
export const buildWikipediaSearchUrl = (
  query: string,
  options: WebSearchOptions = {}
): string => {
  const { limit = DEFAULT_LIMIT, lang = DEFAULT_LANG } = options;
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: query,
    gsrlimit: String(limit),
    gsrnamespace: '0',
    prop: 'extracts',
    exintro: '1',
    explaintext: '1',
    exlimit: String(limit),
    redirects: '1',
    origin: '*',
  });

  return `https://${lang}.wikipedia.org/w/api.php?${params.toString()}`;
};

/**
 * Transforme la réponse de l'API Wikipédia en sources propres et ordonnées.
 * Les pages sans introduction exploitable sont ignorées. Quand `order` est
 * fourni (résultats d'opensearch), il fixe l'ordre des sources.
 */
export const parseWikipediaResponse = (
  payload: unknown,
  lang = DEFAULT_LANG,
  order: string[] = []
): ExternalSource[] => {
  const pages = (payload as { query?: { pages?: Record<string, unknown> } })?.query
    ?.pages;
  if (!pages || typeof pages !== 'object') return [];

  const rank = (title: string): number => {
    const index = order.findIndex(
      (candidate) => normalize(candidate) === normalize(title)
    );
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  return Object.values(pages)
    .filter((page): page is Record<string, any> => {
      if (!page || typeof page !== 'object') return false;
      const candidate = page as Record<string, unknown>;
      return (
        typeof candidate.title === 'string' &&
        typeof candidate.extract === 'string' &&
        candidate.extract.trim().length > 0
      );
    })
    .sort((a, b) => {
      if (order.length > 0) {
        const delta = rank(a.title) - rank(b.title);
        if (delta !== 0) return delta;
      }
      return Number(a.index ?? 0) - Number(b.index ?? 0);
    })
    .map((page) => ({
      title: page.title.trim(),
      url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
        page.title.trim().replace(/ /g, '_')
      )}`,
      excerpt: compact(page.extract).slice(0, MAX_EXCERPT_CHARS),
    }));
};

/** URL d'opensearch : renvoie les titres d'articles les plus proches. */
export const buildWikipediaOpenSearchUrl = (
  query: string,
  options: WebSearchOptions = {}
): string => {
  const { limit = DEFAULT_LIMIT, lang = DEFAULT_LANG } = options;
  const params = new URLSearchParams({
    action: 'opensearch',
    format: 'json',
    search: query,
    limit: String(limit),
    namespace: '0',
  });

  return `https://${lang}.wikipedia.org/w/api.php?${params.toString()}`;
};

/**
 * La réponse d'opensearch est un tableau : [requête, titres, descriptions, URL].
 * On ne garde que les titres exploitables.
 */
export const parseWikipediaOpenSearchResponse = (payload: unknown): string[] => {
  if (!Array.isArray(payload)) return [];
  const titles = payload[1];
  if (!Array.isArray(titles)) return [];

  return titles
    .filter((title): title is string => typeof title === 'string')
    .map((title) => title.trim())
    .filter((title) => title.length > 0);
};

/** URL de récupération des introductions pour une liste de titres. */
export const buildWikipediaExtractsUrl = (
  titles: string[],
  options: WebSearchOptions = {}
): string => {
  const { lang = DEFAULT_LANG } = options;
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: titles.join('|'),
    prop: 'extracts',
    exintro: '1',
    explaintext: '1',
    exlimit: 'max',
    redirects: '1',
    origin: '*',
  });

  return `https://${lang}.wikipedia.org/w/api.php?${params.toString()}`;
};

const searchDuckDuckGo = async (
  query: string,
  options: WebSearchOptions
): Promise<ExternalSource[]> => {
  const { limit = DEFAULT_LIMIT, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  try {
    const response = await fetch(buildDuckDuckGoUrl(query), {
      headers: { Accept: 'text/html', 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) return [];

    const html = await response.text();
    return parseDuckDuckGoHtml(html).slice(0, limit);
  } catch {
    return [];
  }
};

const fetchWikipediaJson = async (
  url: string,
  timeoutMs: number
): Promise<unknown> => {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) return null;
  return response.json();
};

const searchWikipedia = async (
  query: string,
  options: WebSearchOptions
): Promise<ExternalSource[]> => {
  const {
    limit = DEFAULT_LIMIT,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    lang = DEFAULT_LANG,
  } = options;
  const tokens = tokenize(query);

  try {
    // 1. opensearch retrouve l'article dont le titre correspond à la question
    //    (« Capitale de la Guinée », « Alpha Condé ») : bien plus précis que la
    //    recherche plein texte, qui renvoie des homonymes voisins.
    const openPayload = await fetchWikipediaJson(
      buildWikipediaOpenSearchUrl(query, { limit, lang }),
      timeoutMs
    );
    const titles = parseWikipediaOpenSearchResponse(openPayload);

    if (titles.length > 0) {
      const relevant = titles.filter((title) => {
        const normalized = normalize(title);
        return tokens.every((token) => normalized.includes(token));
      });
      const wanted = relevant.length > 0 ? relevant.slice(0, 2) : titles.slice(0, 1);

      const extractPayload = await fetchWikipediaJson(
        buildWikipediaExtractsUrl(wanted, { lang }),
        timeoutMs
      );
      const sources = parseWikipediaResponse(extractPayload, lang, wanted);
      if (sources.length > 0) return sources.slice(0, limit);
    }
  } catch {
    // On tente la recherche plein texte ci-dessous.
  }

  try {
    const payload = await fetchWikipediaJson(
      buildWikipediaSearchUrl(query, { limit, lang }),
      timeoutMs
    );
    return parseWikipediaResponse(payload, lang).slice(0, limit);
  } catch {
    return [];
  }
};

/**
 * Recherche externe : DuckDuckGo en priorité, Wikipédia en secours. Les deux
 * requêtes partent en parallèle pour ne pas allonger la réponse. Toute erreur
 * (réseau, quota, blocage) renvoie une liste vide : le bot continue avec le
 * catalogue Djelia seul.
 */
export const searchWeb = async (
  query: string,
  options: WebSearchOptions = {}
): Promise<ExternalSource[]> => {
  const { limit = DEFAULT_LIMIT } = options;
  const tokens = tokenize(query);

  if (limit <= 0 || tokens.length === 0) return [];

  // Mots-clés plutôt que la phrase entière : les moteurs de recherche
  // renvoient des résultats bien plus pertinents.
  const searchQuery = tokens.join(' ');
  const [ddg, wiki] = await Promise.allSettled([
    searchDuckDuckGo(searchQuery, options),
    searchWikipedia(searchQuery, options),
  ]);

  const primary = ddg.status === 'fulfilled' ? ddg.value : [];
  if (primary.length > 0) return primary.slice(0, limit);

  return wiki.status === 'fulfilled' ? wiki.value.slice(0, limit) : [];
};
