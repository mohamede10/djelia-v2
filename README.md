# Djelia — La mémoire africaine à l'ère du numérique

Application mobile Expo / React Native de préservation et de valorisation de la culture
guinéenne : contes, fables, proverbes, coutumes, initiation aux langues locales et
galerie d'artisanat.

Ce dépôt contient le **MVP Phase 1** décrit dans le cahier des charges (`cahiercharges.md`).

## État du déploiement

| Élément | Valeur |
| --- | --- |
| Application web | <https://djelia-v2.vercel.app> |
| Projet Firebase | `djelia-991aa` (plan Spark) |
| Firestore | base `(default)`, emplacement `nam5`, mode production |
| Récits en base | 50 (collection `stories`) |
| Auth activée | E-mail / Mot de passe |
| Domaine autorisé Auth | `djelia-v2.vercel.app` |

Les variables `EXPO_PUBLIC_*` sont configurées dans Vercel (Production, Preview et
Development). Comme Expo les intègre au bundle **au moment du build**, toute
modification nécessite un redéploiement.

> OAuth Google/Facebook, Storage (photos de profil en ligne), builds stores et
> validations culturelles ne sont **pas** encore configurés : l'application
> l'indique explicitement dans l'interface.

---

## 1. Fonctionnalités

### Authentification
- Inscription et connexion par email / mot de passe (Firebase Auth)
- Validation du mot de passe (8 caractères, majuscule, chiffre, caractère spécial)
- Réinitialisation du mot de passe par email
- **Connexion Google et Facebook** via `expo-auth-session`, branchée sur Firebase Auth
- Mode démo automatique si Firebase n'est pas configuré : les boutons sociaux
  simulent alors une connexion locale, sans créer de faux compte distant
- Session persistante (Firebase Auth ; profil et favoris conservés en mode démo)

### Bibliothèque vivante
- **50 contenus culturels** : 12 contes, 13 fables, 13 proverbes et 12 coutumes
- Classement par région et ethnie, facettes de filtres dérivées du catalogue
- Recherche plein texte insensible à la casse, aux accents et au pluriel
- **Pagination de 20 récits par page** avec défilement infini et bouton
  « Charger plus de récits »
- **Tirer pour rafraîchir** la recherche et les favoris
- États vides éditoriaux avec action de sortie (effacer les filtres, explorer les récits)
- Fiche récit avec lecteur audio intégré (play / pause, ±10 s, vitesse 1x–2x)
- **Narration de secours par synthèse vocale** (`expo-speech`) pour les récits qui
  n'ont pas encore d'enregistrement de griot
- Favoris synchronisés avec Firestore et mis en cache localement
- Images mises en cache mémoire/disque (`expo-image`) avec visuel de secours

### Profil
- Consultation et modification du nom et de la photo de profil
- Choix des langues de prédilection (Mandingue, Pular, Soussou, Français)
- Liste des récits favoris
- Déconnexion

### Modules complémentaires
- **DjeliBot** : griot conversationnel (moteur de réponses scénarisé, prêt à être branché sur une IA)
- **Langues** : initiation au Mandingue, au Pular et au Soussou avec prononciation vocale
- **Livres** : catalogue éditorial avec lecture audio intégrée et ouverture des PDF
  (maquette ; les PDF s'ouvrent dans le lecteur de l'appareil)
- **Marché** : galerie d'artisanat culturel (maquette, paiement en Phase 2/3)

### Accessibilité
- Libellés explicites sur les cartes de récit, les favoris, les filtres, le héros
  d'accueil et les boutons de narration
- Compteur de résultats annoncé aux lecteurs d'écran (`accessibilityLiveRegion`)
- États vides et menus du profil annoncés avec rôle, libellé et état désactivé
- Onglets de navigation dotés de libellés dédiés (`tabBarAccessibilityLabel`)
- Contrastes et tailles de police alignés sur le thème Djelia

### Robustesse
- **ErrorBoundary** global : toute erreur de rendu affiche un écran de secours
  en français avec un bouton « Réessayer », sans page blanche

---

## 2. Stack technique

| Élément | Technologie |
| --- | --- |
| Framework | Expo SDK 54 / React Native 0.81 |
| Langage | TypeScript strict |
| Navigation | React Navigation 7 (tabs + stacks) |
| UI | React Native Paper, polices Poppins & Playfair Display |
| Animations | React Native Animated, Reanimated, SVG |
| Backend | Firebase Auth, Firestore, Storage |
| OAuth | expo-auth-session (Google / Facebook) + Firebase Auth |
| Audio | expo-av (lecture), expo-speech (narration et prononciation) |
| Images | expo-image (cache mémoire/disque), expo-image-picker, expo-image-manipulator |
| Stockage local | expo-secure-store (mobile) / localStorage (web) |
| Tests | Jest + jest-expo |

### Architecture

```
App.tsx
  └── AppProvider (session, favoris, actions OAuth)
        └── NavigationContainer
              ├── AuthStack (splash, onboarding, login, signup, reset)
              └── MainTabs
                    ├── Accueil ──────► StoryDetail ──► AudioPlayer / SpeechNarration
                    ├── Recherche ────► StoryCard (pagination 20)
                    ├── Livres / Langues / Marché / DjeliBot
                    └── Profil ───────► Favoris, photo, langues

services/
  ├── authService ──► Firebase Auth + profils Firestore + OAuth
  ├── dataService ──► catalogue local (50 récits) + Firestore + recherche
  └── storageService ──► session et favoris locaux (mode démo)

config/
  ├── firebase.ts ──► initialisation Firebase, détection du mode démo
  └── oauth.ts ─────► client IDs publics Google / Facebook
```

---

## 3. Installation

```bash
npm install
npx expo start
```

Puis scanner le QR code avec **Expo Go**, ou lancer :

```bash
npm run android
npm run ios
npm run web
```

> L'application démarre en **mode démo** (données locales) si aucune clé Firebase
> n'est renseignée. Aucun compte réel n'est alors créé.

---

## 4. Configuration Firebase et OAuth

### 4.1 Firebase

1. Créer un projet sur [console.firebase.google.com](https://console.firebase.google.com)
   (plan **Spark** suffit pour Firestore, Auth et le web).
2. Activer **Authentication → Email/Password**, puis **Google** et **Facebook**
   si les connexions sociales sont souhaitées.
3. Créer une base **Firestore** (mode production). Le bucket **Storage** n'est
   nécessaire que pour les photos de profil : il exige le plan **Blaze** sur les
   nouveaux projets. Sans Storage, l'application fonctionne (récits, favoris,
   auth) mais la photo reste locale sur le web.
4. Copier `.env.example` vers `.env` et renseigner les clés de la console
   (Paramètres du projet → Vos applications → Configuration SDK).

```bash
cp .env.example .env
```

Variables Firebase attendues :

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Pour un build EAS, ajouter ces variables dans les *Environment variables* du projet
Expo, ou dans `app.json` sous `expo.extra`.

### 4.2 Google

1. Dans Google Cloud Console, créer un **ID client OAuth** de type « Application web ».
2. Ajouter les URI de redirection autorisées :
   - `https://auth.expo.io/@<compte-expo>/djelia` (Expo Go)
   - `djelia://` et, pour le web, l'URL de déploiement (ex. `https://djelia.example`)
3. Renseigner le client ID dans `.env` :

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
```

4. Dans Firebase Console → Authentication → Google, activer le fournisseur.

### 4.3 Facebook

1. Créer une application sur [developers.facebook.com](https://developers.facebook.com).
2. Ajouter le produit **Facebook Login**, puis l'URI de redirection
   `https://auth.expo.io/@<compte-expo>/djelia`.
3. Renseigner l'App ID dans `.env` :

```
EXPO_PUBLIC_FACEBOOK_APP_ID=
```

4. Dans Firebase Console → Authentication → Facebook, saisir l'App ID et
   l'App Secret, puis activer le fournisseur.

> Les client IDs OAuth ne sont pas des secrets. En revanche, l'App Secret Facebook
> ne doit jamais être exposé dans `.env` côté client : il se configure uniquement
> dans la console Firebase.

Sans identifiants OAuth, l'application reste utilisable : les boutons sociaux
passent automatiquement en **simulation locale** lorsque Firebase n'est pas
configuré, ou affichent un message explicite lorsque Firebase est configuré mais
que les client IDs manquent.

### 4.4 Collections Firestore

| Collection | Champs principaux |
| --- | --- |
| `users` | `id`, `name`, `email`, `photoUrl`, `preferredLanguages[]`, `role`, `createdAt` |
| `stories` | `title`, `category`, `region`, `ethnicGroup`, `content`, `imageUrl`, `audioUrl`, `likes`, `views` |
| `favorites` | `userId`, `storyId`, `createdAt` (document id : `${userId}_${storyId}`) |
| `products` | artisanat (Phase 2) |

Les **50 récits de démonstration** (12 contes, 13 fables, 13 proverbes et
12 coutumes) sont définis dans `src/data/stories.ts`.

> ⚠️ Le seed embarqué dans l'application (`seedInitialStoriesToFirestore`) est
> **bloqué par les règles** : `stories` n'accepte la création que pour un
> administrateur. Tant qu'aucun admin n'existe, Firestore reste vide et
> l'application affiche le catalogue local. Utiliser le script de seed ci-dessous.

#### Alimenter Firestore (recommandé)

1. Console Firebase → **Paramètres du projet** → **Comptes de service** →
   **Générer une nouvelle clé privée**. Enregistrer le fichier **hors du dépôt**
   (il est ignoré par Git : `serviceAccount*.json`).
2. Lancer le seed :

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\chemin\serviceAccount.json"
npm run seed
```

Le script est **incrémental** : seuls les récits absents sont ajoutés, les
documents existants ne sont jamais écrasés. Pour visualiser sans écrire :

```powershell
npm run seed:dry
```

Le SDK Admin contourne les règles de sécurité : ne jamais committer la clé de
service ni l'exposer dans le client.

### 4.5 Règles de sécurité

```bash
firebase deploy --only firestore:rules,storage
```

Les règles fournies :
- lecture publique des récits et produits ;
- écriture réservée aux administrateurs / griots certifiés ;
- chaque utilisateur ne gère que ses propres favoris ;
- upload de photo limité au propriétaire, 5 Mo, type image.

---

## 5. Structure du projet

```
App.tsx                      Point d'entrée (polices, thème, providers)
eas.json                     Profils de build EAS (development, preview, production)
src/
  config/                    Couleurs, thème Paper, Firebase, OAuth
  navigation/                Auth, tabs principaux, stacks par module
  screens/
    auth/                    Splash, onboarding, login, signup, reset
    home/                    Bibliothèque et détail d'un récit
    search/                  Recherche, filtres et pagination
    profile/                 Profil, édition, favoris
    learn/                   Initiation aux langues
    books/                   Bibliothèque de livres
    marketplace/             Artisanat
    ai/                      DjeliBot
  components/
    audio/                   Lecteur audio, narration vocale de secours
    auth/                    Boutons OAuth Google / Facebook
    common/                  StoryCard, en-têtes, EmptyState, ErrorBoundary, motifs, skeletons
  services/
    __tests__/               Tests unitaires Jest
    authService.ts           Auth email, profils OAuth, messages d'erreur
    dataService.ts           Catalogue de 50 récits, recherche, seed, favoris
    storageService.ts        Session et favoris locaux
  store/                     Contexte global (auth, favoris)
firestore.rules              Règles Firestore
storage.rules                Règles Storage
```

---

## 6. Scripts

| Commande | Rôle |
| --- | --- |
| `npm start` | Démarre le serveur Expo |
| `npm run android` | Lance sur Android |
| `npm run ios` | Lance sur iOS |
| `npm run web` | Lance la version web |
| `npm run build` | Génère le build web statique dans `dist/` |
| `npm run seed` | Injecte les 50 récits dans Firestore (SDK Admin) |
| `npm run seed:dry` | Simule le seed et liste les récits manquants |
| `npm run lint` | Analyse ESLint |
| `npm test` | Exécute la suite Jest |
| `npm run test:watch` | Tests en mode watch |
| `npx tsc --noEmit` | Vérification TypeScript |
| `npx expo export --platform web` | Génère le build web statique |
| `npx expo install <pkg>` | Installe une dépendance compatible SDK |

### Tests

```bash
npm test
```

La suite couvre :
- l'intégrité du catalogue (50 récits, identifiants uniques, champs obligatoires,
  quatre catégories, facettes de filtres) ;
- la recherche (catégorie, région, ethnie, combinaisons, accents, pluriels) ;
- la normalisation des facettes de catégorie (singulier, pluriel, valeur inconnue) ;
- la lecture d'un récit par identifiant ;
- la validation email / mot de passe et les messages d'erreur Firebase.

Les tests mockent Firebase : ils ne nécessitent ni réseau ni projet distant.

---

## 7. Déploiement

### 7.1 Préparation

1. Renseigner `.env` (Firebase + OAuth) et vérifier `app.json`
   (`scheme`, `bundleIdentifier`, `package`).
2. Vérifier la qualité :

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

3. Déployer les règles Firestore / Storage :

```bash
firebase deploy --only firestore:rules,storage
```

### 7.2 Web

```bash
npm run build
```

Le dossier `dist/` contient l'application statique. Il peut être publié sur
Firebase Hosting, Netlify, Vercel ou tout hébergeur statique. Ajouter l'URL du
site aux URI de redirection OAuth autorisées.

#### Déploiement Vercel

Le fichier `vercel.json` est déjà prêt :

```json
{
  "framework": null,
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

1. Pousser le dépôt sur GitHub, puis dans Vercel : **Add New → Project**.
2. Choisir le dépôt `Dje-lia`. Laisser la **Root Directory** vide si le
   `package.json` est à la racine du dépôt.
3. Vercel lit `vercel.json` : commande `npm run build`, dossier `dist`.
   Ne pas définir un autre dossier de sortie dans le dashboard.
4. Ajouter les variables d'environnement dans **Settings → Environment
   Variables** (Production **et** Preview) :

```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_FACEBOOK_APP_ID
```

5. **Redéployer** après toute modification de variable : Expo les intègre au
   bundle au moment du build, pas à l'exécution.
6. Dans Firebase Console → **Authentication → Settings → Authorized domains**,
   ajouter le domaine Vercel (`xxx.vercel.app`) et le domaine personnalisé.
7. Dans Google Cloud Console et Facebook Developers, ajouter l'URL Vercel aux
   origines / URI de redirection OAuth autorisées.

Erreurs Vercel fréquentes :

| Erreur | Cause | Correction |
| --- | --- | --- |
| `Missing script: "build"` | Ancien projet sans script `build` | `npm run build` est maintenant défini |
| `No Output Directory named "dist"` | Dossier de sortie mal configuré | Garder `outputDirectory: "dist"` |
| 404 après actualisation d'une route | Pas de fallback SPA | La réécriture vers `/index.html` est fournie |
| L'app reste en **mode démo** | Variables `EXPO_PUBLIC_*` absentes | Les ajouter dans Vercel puis redéployer |
| `auth/unauthorized-domain` | Domaine absent de Firebase | Ajouter le domaine Vercel dans Authentication |
| `redirect_uri_mismatch` | URL absente de Google/Facebook | Ajouter l'URL Vercel aux URI autorisées |
| Écran blanc | Erreur JavaScript au chargement | Ouvrir la console du navigateur et vérifier le build Vercel |

> Pour un test local proche de la production :
> `npm run build` puis servir `dist/` avec un fallback vers `index.html`.


### 7.3 Android / iOS avec EAS

Le fichier `eas.json` fourni contient trois profils :

| Profil | Usage | Sortie Android |
| --- | --- | --- |
| `development` | tests internes rapides | APK |
| `preview` | recette avec testeurs | APK |
| `production` | stores | AAB |

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Puis lancer :

```bash
eas build --platform android --profile preview
eas build --platform android --profile production
eas build --platform ios --profile production
```

- Android : le profil `production` génère un **AAB** pour le Play Store ; `preview`
  produit un **APK** installable directement.
- iOS : build **IPA** pour l'App Store, avec un compte Apple Developer.
- `autoIncrement` active l'incrément distant de version sur `production`.
- Ajouter les empreintes SHA-1/SHA-256 Android et l'identifiant de bundle iOS
  dans les consoles Google / Facebook.
- Configurer les variables `EXPO_PUBLIC_*` dans les *Environment variables* EAS,
  puis soumettre avec `eas submit --platform android --profile production`.

### 7.4 Mise en production des contenus

- Faire relire les 50 récits par des spécialistes culturels et des locuteurs
  des langues concernées.
- Remplacer progressivement les narrations de synthèse par des enregistrements
  de griots, puis renseigner `audioUrl` dans Firestore.
- Vérifier les droits sur les images et les enregistrements avant publication.

---

## 8. État d'avancement MVP

- [x] Setup Expo / TypeScript / thème Djelia
- [x] Splash animé, onboarding 3 écrans, persistance de l'onboarding
- [x] Authentification email / mot de passe + réinitialisation
- [x] OAuth Google / Facebook (`expo-auth-session`, simulation locale en mode démo)
- [x] Bibliothèque (contes, fables, proverbes, coutumes) + recherche et filtres
- [x] Catalogue de 50 contenus culturels
- [x] Détail de récit + lecteur audio + narration vocale de secours
- [x] Pagination de la recherche (20 récits par page)
- [x] Favoris Firestore + cache local hors-ligne
- [x] Rafraîchissement manuel (pull-to-refresh) et états vides partagés
- [x] Profil + édition du nom et des langues
- [x] Photo de profil (galerie + recadrage, Storage Firebase ou stockage local)
- [x] Livres : lecteur audio réel + ouverture des PDF
- [x] Accessibilité de base (libellés, rôles, annonces de résultats)
- [x] ErrorBoundary global et profils de build EAS (`eas.json`)
- [x] Tests unitaires des services (Jest)
- [ ] Validation réelle des parcours OAuth avec des identifiants de production
- [ ] Enregistrements audio des 50 récits
- [ ] Lecture PDF intégrée à l'application (`react-native-pdf`, build natif requis)
- [ ] Build EAS APK / IPA et publication sur les stores

---

## 9. Limites connues

- Les récits au-delà du socle initial sont des **adaptations éditoriales de
  démonstration** : ils doivent être relus et validés par des spécialistes
  culturels avant production. Les images distantes sont illustratives et
  remplacées par un visuel de secours si elles ne se chargent pas.
- Seul le récit d'ouverture dispose d'un enregistrement audio réel. Les autres
  utilisent la synthèse vocale du système, clairement annoncée dans l'interface ;
  ces narrations ne remplacent pas la voix d'un griot.
- Les parcours OAuth réels n'ont pas pu être testés sans projet Firebase et
  identifiants Google / Facebook. Le mode démo couvre uniquement le parcours UI.
- DjeliBot utilise un moteur de réponses local en attendant un modèle IA.
- Les modules Livres et Marché restent des maquettes (catalogue fictif) : les PDF
  s'ouvrent dans le lecteur externe de l'appareil, le paiement n'est pas encore branché.
- La photo de profil est choisie dans la galerie et recadrée en carré. Avec
  Firebase, elle est envoyée dans Storage ; en mode démo elle reste locale à
  l'appareil (dossier de documents sur mobile, data URI compressée sur le web).
- Les tests couvrent les services métier ; il n'y a pas encore de tests
  d'intégration UI ni de tests end-to-end sur appareil.
- `expo-av` est déprécié dans les SDK récents ; une migration vers `expo-audio`
  est recommandée avant la mise en production.

---

## 10. Licence

Projet Djelia — Hackathon Ansuten. Tous droits réservés.
#   d j e l i a - v 2  
 