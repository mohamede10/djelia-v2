# Djelia — La mémoire africaine à l'ère du numérique

Application mobile Expo / React Native de préservation et de valorisation de la culture
guinéenne : contes, fables, proverbes, coutumes, initiation aux langues locales et
galerie d'artisanat.

Ce dépôt contient le **MVP Phase 1** décrit dans le cahier des charges (`cahiercharges.md`).

---

## 1. Fonctionnalités

### Authentification
- Inscription et connexion par email / mot de passe (Firebase Auth)
- Validation du mot de passe (8 caractères, majuscule, chiffre, caractère spécial)
- Réinitialisation du mot de passe par email
- Session persistante (Firebase Auth ; profil et favoris conservés en mode démo)
- Mode démo automatique si Firebase n'est pas configuré

### Bibliothèque vivante
- Contes, fables, proverbes et coutumes classés par région et ethnie
- Recherche plein texte + filtres par catégorie, région et ethnie
- Fiche récit avec lecteur audio intégré (play / pause, ±10 s, vitesse 1x–2x)
- Favoris synchronisés avec Firestore et mis en cache localement

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
| Audio | expo-av (lecture), expo-speech (prononciation) |
| Photos | expo-image-picker (galerie + recadrage carré) + expo-image-manipulator (480 px, < 500 Ko) |
| Stockage local | expo-secure-store (mobile) / localStorage (web) |

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

## 4. Configuration Firebase

1. Créer un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. Activer **Authentication → Email/Password**.
3. Créer une base **Firestore** et un bucket **Storage**.
4. Copier `.env.example` vers `.env` et renseigner les clés de la console
   (Paramètres du projet → Vos applications → Configuration SDK).

```bash
cp .env.example .env
```

Variables attendues :

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

### Collections Firestore

| Collection | Champs principaux |
| --- | --- |
| `users` | `id`, `name`, `email`, `photoUrl`, `preferredLanguages[]`, `role`, `createdAt` |
| `stories` | `title`, `category`, `region`, `ethnicGroup`, `content`, `imageUrl`, `audioUrl`, `likes`, `views` |
| `favorites` | `userId`, `storyId`, `createdAt` (document id : `${userId}_${storyId}`) |
| `products` | artisanat (Phase 2) |

Les 30 récits de démonstration (8 contes, 7 fables, 7 proverbes et 8 coutumes)
sont injectés automatiquement dans `stories` au lancement. Le seed est incrémental :
seuls les récits absents sont ajoutés, les documents existants ne sont jamais écrasés.

### Règles de sécurité

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
src/
  config/                    Couleurs, thème Paper, initialisation Firebase
  navigation/                Auth, tabs principaux, stacks par module
  screens/
    auth/                    Splash, onboarding, login, signup, reset
    home/                    Bibliothèque et détail d'un récit
    search/                  Recherche et filtres
    profile/                 Profil, édition, favoris
    learn/                   Initiation aux langues
    books/                   Bibliothèque de livres
    marketplace/             Artisanat
    ai/                      DjeliBot
  components/
    audio/                   Lecteur audio
    common/                  StoryCard, en-têtes, motifs, skeletons
  services/                  Auth, données Firestore, stockage local
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
| `npm run lint` | Analyse ESLint |
| `npx tsc --noEmit` | Vérification TypeScript |
| `npx expo install <pkg>` | Installe une dépendance compatible SDK |

---

## 7. État d'avancement MVP

- [x] Setup Expo / TypeScript / thème Djelia
- [x] Splash animé, onboarding 3 écrans, persistance de l'onboarding
- [x] Authentification email / mot de passe + réinitialisation
- [x] Bibliothèque (contes, fables, proverbes, coutumes) + recherche et filtres
- [x] Catalogue de 30 contenus culturels (objectif : 50)
- [x] Détail de récit + lecteur audio
- [x] Favoris Firestore + cache local hors-ligne
- [x] Profil + édition du nom et des langues
- [x] Photo de profil (galerie + recadrage, Storage Firebase ou stockage local)
- [x] Livres : lecteur audio réel + ouverture des PDF
- [ ] OAuth Google / Facebook (`expo-auth-session`)
- [ ] Lecture PDF intégrée à l'application (`react-native-pdf`, build natif requis)
- [ ] Catalogue de 50 contenus culturels
- [ ] Tests unitaires (Jest)
- [ ] Build EAS APK / IPA

---

## 8. Limites connues

- Les données de démonstration comptent 30 récits sur les 50 visés. Les récits
  ajoutés au-delà du socle initial sont des adaptations éditoriales de démonstration :
  ils doivent être relus et validés par des spécialistes culturels avant production.
  Les images distantes sont illustratives et remplacées par un visuel de secours si
  elles ne se chargent pas.
- DjeliBot utilise un moteur de réponses local en attendant un modèle IA.
- Les modules Livres et Marché restent des maquettes (catalogue fictif) : les PDF
  s'ouvrent dans le lecteur externe de l'appareil, le paiement n'est pas encore branché.
- La photo de profil est choisie dans la galerie et recadrée en carré. Avec
  Firebase, elle est envoyée dans Storage ; en mode démo elle reste locale à
  l'appareil (dossier de documents sur mobile, data URI compressée sur le web).
- `expo-av` est déprécié dans les SDK récents ; une migration vers `expo-audio`
  est recommandée avant la mise en production.

---

## 9. Licence

Projet Djelia — Hackathon Ansuten. Tous droits réservés.
