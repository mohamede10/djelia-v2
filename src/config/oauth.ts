/**
 * Identifiants OAuth publics.
 *
 * Les client IDs ne sont pas des secrets : ils identifient l'application auprès
 * de Google / Facebook. Les renseigner dans `.env` puis redémarrer Expo.
 * Voir README §4.2 pour la procédure complète.
 */
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
export const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '';

export const isGoogleOAuthConfigured = Boolean(GOOGLE_WEB_CLIENT_ID);
export const isFacebookOAuthConfigured = Boolean(FACEBOOK_APP_ID);
