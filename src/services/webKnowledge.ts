/**
 * Connaissance externe de DjeliBot.
 *
 * Quand le catalogue Djelia ne suffit pas, le bot complète sa réponse avec
 * l'encyclopédie Wikipédia (API publique, sans clé). Les extraits sont transmis
 * au modèle avec leur URL : toute information externe reste ainsi citable.
 *
 * Le module est volontairement sans dépendance React Native ni Firebase : il
 * tourne dans la fonction serverless Vercel et dans les tests Jest.
 */

import { tokenize, type ExternalSource } from './djeliBotKnowledge';

const DEFAULT_LIMIT = 2;
const DEFAULT_TIMEOUT_MS = 4_000;
const DEFAULT_LANG = 'fr';
const MAX_EXCERPT_CHARS = 900;
const USER_AGENT = 'DjeliBot/1.0 (https://djelia-v2.vercel.app)';

export type WebSearchOptions = {
  /** Nombre maximum de sources retournées (défaut : 2). */
  limit?: number;
  /** Délai maximal de la requête (défaut : 4 s). */
  timeoutMs?: number;
  /** Langue de Wikipédia (défaut : fr). */
  lang?: string;
};

const compact = (value: string): string => value.replace(/\s+/g, ' ').trim();

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
 * Les pages sans introduction exploitable sont ignorées.
 */
export const parseWikipediaResponse = (
  payload: unknown,
  lang = DEFAULT_LANG
): ExternalSource[] => {
  const pages = (payload as { query?: { pages?: Record<string, unknown> } })?.query
    ?.pages;
  if (!pages || typeof pages !== 'object') return [];

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
    .sort((a, b) => Number(a.index ?? 0) - Number(b.index ?? 0))
    .map((page) => ({
      title: page.title.trim(),
      url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
        page.title.trim().replace(/ /g, '_')
      )}`,
      excerpt: compact(page.extract).slice(0, MAX_EXCERPT_CHARS),
    }));
};

/**
 * Interroge Wikipédia en français. Toute erreur (réseau, quota, délai) renvoie
 * une liste vide : le bot continue avec le catalogue Djelia seul.
 */
export const searchWeb = async (
  query: string,
  options: WebSearchOptions = {}
): Promise<ExternalSource[]> => {
  const {
    limit = DEFAULT_LIMIT,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    lang = DEFAULT_LANG,
  } = options;

  if (limit <= 0 || tokenize(query).length === 0) return [];

  try {
    const response = await fetch(buildWikipediaSearchUrl(query, { limit, lang }), {
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) return [];

    const payload: unknown = await response.json();
    return parseWikipediaResponse(payload, lang).slice(0, limit);
  } catch {
    return [];
  }
};
