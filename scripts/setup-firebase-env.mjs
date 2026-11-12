#!/usr/bin/env node
/**
 * Génère le fichier `.env` à partir de la configuration Firebase Web.
 *
 * Utilisation :
 *   1. Console Firebase > Paramètres du projet > Vos applications > Web
 *   2. Copier l'objet `firebaseConfig` dans un fichier `firebase-config.json`
 *      à la racine du dépôt (ignoré par Git), par exemple :
 *
 *        {
 *          "apiKey": "AIza...",
 *          "authDomain": "mon-projet.firebaseapp.com",
 *          "projectId": "mon-projet",
 *          "storageBucket": "mon-projet.firebasestorage.app",
 *          "messagingSenderId": "1234567890",
 *          "appId": "1:1234567890:web:abc123"
 *        }
 *
 *   3. Lancer :
 *
 *        npm run setup:firebase
 *
 * Le script conserve les variables OAuth déjà présentes dans `.env` et affiche
 * la liste des variables à recopier dans Vercel.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG_FILE = process.env.FIREBASE_CONFIG_FILE || 'firebase-config.json';
const ENV_FILE = '.env';
const ENV_EXAMPLE = '.env.example';

const MAP = [
  ['apiKey', 'EXPO_PUBLIC_FIREBASE_API_KEY'],
  ['authDomain', 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'],
  ['projectId', 'EXPO_PUBLIC_FIREBASE_PROJECT_ID'],
  ['storageBucket', 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'],
  ['messagingSenderId', 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
  ['appId', 'EXPO_PUBLIC_FIREBASE_APP_ID'],
];

const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

const configPath = resolve(CONFIG_FILE);
if (!existsSync(configPath)) {
  fail(
    `Fichier « ${CONFIG_FILE} » introuvable.\n\n` +
      'Crée-le à la racine du dépôt en collant le bloc firebaseConfig de la console Firebase.\n' +
      'Il est ignoré par Git, tu peux le supprimer après usage.'
  );
}

let raw;
try {
  raw = readFileSync(configPath, 'utf8');
} catch (error) {
  fail(`Impossible de lire « ${CONFIG_FILE} » : ${error.message}`);
}

// Tolère le snippet JS de la console (`const firebaseConfig = { ... };`).
const jsonStart = raw.indexOf('{');
const jsonEnd = raw.lastIndexOf('}');
if (jsonStart === -1 || jsonEnd <= jsonStart) {
  fail('Aucun objet JSON détecté dans le fichier.');
}

let config;
try {
  // Tolère le snippet JS de la console : clés non quotées, virgules finales,
  // commentaires en début de ligne.
  const jsonish = raw
    .slice(jsonStart, jsonEnd + 1)
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
    .replace(/,\s*}/g, '}');
  config = JSON.parse(jsonish);
} catch (error) {
  fail(`JSON invalide : ${error.message}`);
}

const values = new Map();
const missing = [];
for (const [sourceKey, envKey] of MAP) {
  const value = typeof config[sourceKey] === 'string' ? config[sourceKey].trim() : '';
  if (!value) {
    missing.push(sourceKey);
    continue;
  }
  values.set(envKey, value);
}

if (missing.length > 0) {
  fail(`Champs manquants dans firebaseConfig : ${missing.join(', ')}`);
}

// Conserve les variables existantes (OAuth, etc.), remplace les Firebase.
const base = existsSync(ENV_FILE)
  ? readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)
  : existsSync(ENV_EXAMPLE)
    ? readFileSync(ENV_EXAMPLE, 'utf8').split(/\r?\n/)
    : [];

const firebaseKeys = new Set(values.keys());
const kept = base.filter((line) => {
  const key = line.split('=')[0].trim();
  return key && !firebaseKeys.has(key);
});

const generated = [
  ...kept,
  '',
  '# Firebase — généré par npm run setup:firebase',
  ...Array.from(values.entries()).map(([key, value]) => `${key}=${value}`),
  '',
];

writeFileSync(resolve(ENV_FILE), generated.join('\n'), 'utf8');

console.log(`\n✔ ${ENV_FILE} mis à jour pour le projet « ${config.projectId} ».`);
console.log('\nVariables à recopier dans Vercel (Production + Preview) :\n');
for (const [key, value] of values) {
  console.log(`  ${key}=${value}`);
}
console.log(
  '\nPuis redéployer : Expo intègre ces variables au bundle au moment du build.\n' +
    `Ne pas committer ${CONFIG_FILE} ni ${ENV_FILE}.\n`
);
