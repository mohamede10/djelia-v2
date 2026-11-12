/**
 * Fonction serverless Vercel : /api/chat
 *
 * Reçoit l'historique de conversation de DjeliBot, retrouve les récits
 * pertinents dans le catalogue puis interroge Google Gemini. La clé API reste
 * exclusivement côté serveur (`GEMINI_API_KEY`), jamais dans le bundle web.
 */

import { INITIAL_STORIES, type Story } from '../src/data/stories';
import {
  buildSystemPrompt,
  retrieveStories,
  type StoryMatch,
} from '../src/services/djeliBotKnowledge';

type ChatRole = 'user' | 'assistant';
type ChatMessage = { role: ChatRole; content: string };

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  end: () => void;
};

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;
const MAX_USER_NAME_CHARS = 80;
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const GEMINI_TIMEOUT_MS = 20_000;
const SOURCES_LIMIT = 4;
const FIRESTORE_CACHE_MS = 5 * 60 * 1000;

class UpstreamError extends Error {}

// --- Limitation de débit en mémoire (par instance de fonction) ---------------

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
};

const getClientIp = (req: ApiRequest): string => {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (raw) return raw.split(',')[0].trim();
  return req.socket?.remoteAddress || 'inconnu';
};

// --- Catalogue : Firestore en priorité, catalogue embarqué en secours --------

type StoryCache = { stories: Story[]; expiresAt: number };
let storyCache: StoryCache | null = null;

const readFirestoreField = (value: any): string => {
  if (!value) return '';
  return (
    value.stringValue ??
    value.integerValue ??
    value.doubleValue ??
    value.booleanValue?.toString() ??
    ''
  );
};

const parseFirestoreStory = (document: any): Story | null => {
  const fields = document?.fields;
  if (!fields?.title?.stringValue) return null;

  const id = String(document?.name || '').split('/').pop() || '';
  if (!id) return null;

  return {
    id,
    title: fields.title.stringValue,
    category: readFirestoreField(fields.category),
    region: readFirestoreField(fields.region),
    ethnicGroup: readFirestoreField(fields.ethnicGroup),
    content: readFirestoreField(fields.content),
    imageUrl: readFirestoreField(fields.imageUrl),
  };
};

/**
 * Charge le catalogue publié dans Firestore (lecture publique) avec un cache
 * mémoire. En cas d'échec, retombe sur le catalogue de référence embarqué :
 * le bot doit pouvoir répondre même si Firestore est momentanément indisponible.
 */
const loadStories = async (): Promise<Story[]> => {
  const now = Date.now();
  if (storyCache && storyCache.expiresAt > now) return storyCache.stories;

  const apiKey =
    process.env.FIREBASE_WEB_API_KEY ||
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    'djelia-991aa';

  if (!apiKey) return INITIAL_STORIES;

  try {
    const url =
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}` +
      `/databases/(default)/documents/stories?pageSize=100&key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return INITIAL_STORIES;

    const payload: any = await response.json();
    const stories = (payload?.documents || [])
      .map(parseFirestoreStory)
      .filter((story: Story | null): story is Story => Boolean(story?.content));

    if (stories.length === 0) return INITIAL_STORIES;

    storyCache = { stories, expiresAt: now + FIRESTORE_CACHE_MS };
    return stories;
  } catch {
    return INITIAL_STORIES;
  }
};

// --- Validation de la requête ------------------------------------------------

type ParsedBody =
  | { messages: ChatMessage[]; userName?: string }
  | { error: string };

const parseBody = (body: unknown): ParsedBody => {
  if (!body || typeof body !== 'object') {
    return { error: 'Corps de requête invalide.' };
  }

  const { messages, userName } = body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: 'Aucun message fourni.' };
  }
  if (messages.length > MAX_MESSAGES) {
    return { error: `Trop de messages (maximum ${MAX_MESSAGES}).` };
  }

  const cleaned: ChatMessage[] = [];
  for (const entry of messages) {
    if (!entry || typeof entry !== 'object') {
      return { error: 'Message invalide.' };
    }

    const { role, content } = entry as Record<string, unknown>;
    if (typeof content !== 'string') {
      return { error: 'Message invalide.' };
    }

    const text = content.trim();
    if (!text) return { error: 'Message vide.' };
    if (text.length > MAX_MESSAGE_CHARS) {
      return { error: `Message trop long (maximum ${MAX_MESSAGE_CHARS} caractères).` };
    }

    cleaned.push({ role: role === 'assistant' ? 'assistant' : 'user', content: text });
  }

  if (cleaned[cleaned.length - 1].role !== 'user') {
    return { error: 'Le dernier message doit venir de l’utilisateur.' };
  }

  const safeName =
    typeof userName === 'string' ? userName.trim().slice(0, MAX_USER_NAME_CHARS) : undefined;

  return { messages: cleaned, userName: safeName || undefined };
};

// --- Appel Gemini ------------------------------------------------------------

const callGemini = async (
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}` +
      `:generateContent?key=${encodeURIComponent(apiKey)}`;

    const generationConfig: Record<string, unknown> = {
      temperature: 0.75,
      topP: 0.95,
      maxOutputTokens: 900,
    };

    // Gemini 2.5 Flash « pense » par défaut : on coupe la réflexion pour une
    // réponse de chat rapide (non supporté par les modèles Pro).
    if (model.startsWith('gemini-2.5') && !model.includes('pro')) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: messages.map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })),
        generationConfig,
      }),
      signal: controller.signal,
    });

    const payload: any = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload?.error?.message || `Erreur du fournisseur IA (${response.status}).`;
      throw new UpstreamError(message);
    }

    const candidate = payload?.candidates?.[0];
    const text = (candidate?.content?.parts || [])
      .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();

    if (!text) {
      const blocked =
        payload?.promptFeedback?.blockReason ||
        candidate?.finishReason ||
        'réponse vide';
      throw new UpstreamError(`Le modèle n’a pas pu répondre (${blocked}).`);
    }

    return text;
  } finally {
    clearTimeout(timer);
  }
};

// --- Handler -----------------------------------------------------------------

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed', message: 'Méthode non autorisée.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: 'missing_api_key',
      message: 'DjeliBot n’est pas encore configuré : la clé GEMINI_API_KEY est absente.',
    });
    return;
  }

  if (isRateLimited(getClientIp(req))) {
    res.status(429).json({
      error: 'rate_limited',
      message: 'Trop de questions d’affilée. Laisse le griot reprendre son souffle un instant.',
    });
    return;
  }

  const parsed = parseBody(req.body);
  if ('error' in parsed) {
    res.status(400).json({ error: 'invalid_request', message: parsed.error });
    return;
  }

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

  try {
    const stories = await loadStories();
    const lastUserMessage =
      [...parsed.messages].reverse().find((message) => message.role === 'user')?.content || '';
    const matches: StoryMatch[] = retrieveStories(lastUserMessage, {
      limit: SOURCES_LIMIT,
      stories,
    });

    const reply = await callGemini(
      apiKey,
      model,
      buildSystemPrompt(parsed.userName, matches),
      parsed.messages
    );

    res.status(200).json({
      reply,
      model,
      sources: matches.map((match) => ({
        id: match.id,
        title: match.title,
        category: match.category,
      })),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    const message = timedOut
      ? 'Le griot a été trop long à répondre. Réessaie dans un instant.'
      : error instanceof Error
        ? error.message
        : 'Erreur inconnue du service IA.';

    res.status(timedOut ? 504 : 502).json({ error: 'upstream_error', message });
  }
}
