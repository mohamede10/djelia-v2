/**
 * Client de l'API DjeliBot.
 *
 * Sur le web, l'application et la fonction serverless sont servies par le même
 * domaine : on appelle donc `/api/chat` en relatif. Pour les builds natifs
 * (Android/iOS), il faut une URL absolue, configurée via
 * `EXPO_PUBLIC_AI_API_URL` (par défaut : le déploiement Vercel de production).
 *
 * Aucune clé d'API n'est présente ici : elle vit uniquement côté serveur.
 */

import { Platform } from 'react-native';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type DjeliBotSource = {
  id: string;
  title: string;
  category?: string;
  /** `story` : récit du catalogue Djelia ; `web` : source externe (Wikipédia). */
  kind?: 'story' | 'web';
  /** URL publique, présente pour les sources externes. */
  url?: string;
};

export type DjeliBotReply = {
  reply: string;
  sources: DjeliBotSource[];
  model: string;
};

export type AiErrorCode =
  | 'invalid'
  | 'unavailable'
  | 'timeout'
  | 'network'
  | 'server';

export class AiServiceError extends Error {
  code: AiErrorCode;

  constructor(message: string, code: AiErrorCode) {
    super(message);
    this.name = 'AiServiceError';
    this.code = code;
  }
}

const DEFAULT_API_URL = 'https://djelia-v2.vercel.app';
const REQUEST_TIMEOUT_MS = 45_000;

/** Base de l'API : même origine sur le web, URL explicite sur mobile. */
export const getAiApiBaseUrl = (): string => {
  const configured = process.env.EXPO_PUBLIC_AI_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  if (Platform.OS === 'web') return '';
  return DEFAULT_API_URL;
};

const parseSources = (value: unknown): DjeliBotSource[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (entry): entry is DjeliBotSource =>
        Boolean(entry) &&
        typeof entry === 'object' &&
        typeof (entry as DjeliBotSource).id === 'string' &&
        typeof (entry as DjeliBotSource).title === 'string'
    )
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      category: typeof entry.category === 'string' ? entry.category : undefined,
      kind: entry.kind === 'web' ? ('web' as const) : ('story' as const),
      url: typeof entry.url === 'string' ? entry.url : undefined,
    }));
};

/**
 * Envoie l'historique à `/api/chat` et renvoie la réponse du modèle.
 * Toute erreur est normalisée en `AiServiceError` pour que l'écran puisse
 * basculer proprement sur les réponses locales.
 */
export const askDjeliBot = async (
  messages: ChatMessage[],
  userName?: string
): Promise<DjeliBotReply> => {
  if (messages.length === 0) {
    throw new AiServiceError('Aucun message à envoyer.', 'invalid');
  }

  try {
    return await requestDjeliBot(messages, userName);
  } catch (error) {
    // Une coupure réseau immédiate (DNS, connexion interrompue) mérite une
    // seconde chance ; un délai dépassé, non (le serveur a déjà réessayé).
    if (error instanceof AiServiceError && error.code === 'network') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return requestDjeliBot(messages, userName);
    }
    throw error;
  }
};

const requestDjeliBot = async (
  messages: ChatMessage[],
  userName?: string
): Promise<DjeliBotReply> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getAiApiBaseUrl()}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ messages, userName }),
      signal: controller.signal,
    });

    const payload: any = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        typeof payload?.message === 'string'
          ? payload.message
          : `DjeliBot est indisponible (${response.status}).`;

      throw new AiServiceError(
        message,
        response.status === 503 ? 'unavailable' : 'server'
      );
    }

    if (!payload || typeof payload.reply !== 'string' || !payload.reply.trim()) {
      throw new AiServiceError('Réponse illisible du serveur.', 'server');
    }

    return {
      reply: payload.reply.trim(),
      sources: parseSources(payload.sources),
      model: typeof payload.model === 'string' ? payload.model : '',
    };
  } catch (error) {
    if (error instanceof AiServiceError) throw error;

    if (error instanceof Error && error.name === 'AbortError') {
      throw new AiServiceError('DjeliBot met trop de temps à répondre.', 'timeout');
    }

    throw new AiServiceError('Impossible de joindre DjeliBot.', 'network');
  } finally {
    clearTimeout(timer);
  }
};
