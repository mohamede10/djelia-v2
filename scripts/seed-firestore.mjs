#!/usr/bin/env node
/**
 * Alimente Firestore avec le catalogue culturel Djelia (50 récits).
 *
 * Pourquoi ce script ?
 * `firestore.rules` réserve l'écriture de la collection `stories` aux
 * administrateurs. Le seed embarqué dans l'application est donc bloqué tant
 * qu'aucun admin n'existe. Ce script utilise le SDK Admin (service account),
 * qui contourne les règles de sécurité, pour insérer les récits une fois.
 *
 * Utilisation :
 *   1. Console Firebase > Paramètres du projet > Comptes de service
 *      > Générer une nouvelle clé privée  -> serviceAccount.json
 *   2. Placer le fichier hors du dépôt (il est ignoré par Git), par exemple
 *      dans le dossier parent, puis :
 *
 *        $env:GOOGLE_APPLICATION_CREDENTIALS="..\serviceAccount.json"
 *        npm run seed
 *
 *   Variantes acceptées :
 *     FIREBASE_SERVICE_ACCOUNT=<chemin du json>
 *     FIREBASE_SERVICE_ACCOUNT_JSON=<json complet en une ligne>
 *
 * Options :
 *   --dry-run   affiche ce qui serait ajouté, sans écrire
 *
 * Le script est incrémental : un document déjà présent n'est jamais écrasé.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { INITIAL_STORIES } from '../src/data/stories.ts';

const COLLECTION = 'stories';
const BATCH_LIMIT = 400;
const dryRun = process.argv.includes('--dry-run');

const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

const loadCredential = () => {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inline) {
    try {
      return cert(JSON.parse(inline));
    } catch {
      fail('FIREBASE_SERVICE_ACCOUNT_JSON n’est pas un JSON valide.');
    }
  }

  const file =
    process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (file) {
    const absolute = resolve(file);
    try {
      return cert(JSON.parse(readFileSync(absolute, 'utf8')));
    } catch {
      fail(
        `Impossible de lire la clé de service « ${absolute} ».\n` +
          'Vérifie le chemin et que le fichier est bien un JSON de compte de service Firebase.'
      );
    }
  }

  try {
    return applicationDefault();
  } catch {
    fail(
      'Aucune clé de service trouvée.\n\n' +
        'Télécharge-la depuis : Console Firebase > Paramètres du projet > Comptes de service\n' +
        '> Générer une nouvelle clé privée, puis lance :\n\n' +
        '  $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\chemin\\serviceAccount.json"\n' +
        '  npm run seed\n'
    );
  }
};

const main = async () => {
  const credential = loadCredential();
  const app = initializeApp({ credential });
  const db = getFirestore(app);

  console.log(`\nDjelia — seed Firestore (${INITIAL_STORIES.length} récits du catalogue)`);
  if (dryRun) console.log('Mode --dry-run : aucune écriture ne sera effectuée.');

  const snapshot = await db.collection(COLLECTION).get();
  const existingIds = new Set(snapshot.docs.map((doc) => doc.id));
  const missing = INITIAL_STORIES.filter((story) => !existingIds.has(story.id));

  console.log(`Déjà présents : ${existingIds.size}`);
  console.log(`À ajouter     : ${missing.length}`);

  if (missing.length === 0) {
    console.log('\n✔ Firestore est déjà à jour, rien à faire.\n');
    return;
  }

  if (dryRun) {
    console.log(`\nIdentifiants concernés : ${missing.map((story) => story.id).join(', ')}\n`);
    return;
  }

  let batch = db.batch();
  let pending = 0;
  let written = 0;

  for (const story of missing) {
    const { id, ...data } = story;
    batch.set(
      db.collection(COLLECTION).doc(id),
      {
        ...data,
        // Les assets audio locaux (require Metro) ne sont pas sérialisables :
        // seules les URLs http(s) sont enregistrées.
        audioUrl: typeof data.audioUrl === 'string' ? data.audioUrl : null,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    pending += 1;
    written += 1;

    if (pending === BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
      console.log(`  … ${written}/${missing.length} écrits`);
    }
  }

  if (pending > 0) {
    await batch.commit();
  }

  console.log(`\n✔ ${written} récit(s) ajouté(s) dans la collection « ${COLLECTION} ».\n`);
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('\n✖ Échec du seed Firestore :');
  console.error(message);

  if (/project id/i.test(message)) {
    console.error(
      '\nAucune clé de service Firebase n’a été trouvée.\n\n' +
        '1. Console Firebase > Paramètres du projet > Comptes de service\n' +
        '2. « Générer une nouvelle clé privée » -> serviceAccount.json\n' +
        '3. Puis :\n\n' +
        '   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\chemin\\serviceAccount.json"\n' +
        '   npm run seed\n'
    );
  } else {
    console.error(
      '\nVérifie que Firestore est créé, que la clé de service correspond au bon projet, ' +
        'et que les règles ont été déployées.\n'
    );
  }

  process.exit(1);
});
