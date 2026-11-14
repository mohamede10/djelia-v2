# Conformité au cahier des charges — Djelia

**Document de référence :** `cahierdescharges.txt` / `cahiercharges.md`
(version 1.0, MVP Phase 1, avril 2025)
**Audit :** novembre 2026
**Périmètre audité :** application Expo / React Native + Firestore + fonction
serverless `api/chat.ts`

Légende : ✅ conforme · 🟡 partiel · ⚠️ écart assumé · ➕ au-delà du périmètre ·
❌ non réalisé · ⛔ bloqué par un prérequis externe

---

## 1. Synthèse

Le MVP demandé est fonctionnel sur le web (https://djelia-v2.vercel.app) et
couvre l'ensemble du socle : authentification, bibliothèque de 50 récits,
recherche et filtres, pagination, favoris, profil, audio.

Les écarts restants ne sont pas des fonctionnalités à coder mais des
**livrables de production** : enregistrements audio des 50 récits, identifiants
OAuth, builds APK/IPA, tests utilisateurs et maquettes Figma.

Le produit a par ailleurs dépassé le cahier : DjeliBot, Langues et Boutique,
prévus en phases 2 et 3, sont déjà livrés.

---

## 2. Conformité exigence par exigence

### 2.1 Authentification (§ 4.1)

| Exigence | État | Preuve / remarque |
|---|---|---|
| Création de compte email / mot de passe | ✅ | `src/services/authService.ts`, `SignupScreen.tsx` |
| Connexion email / mot de passe | ✅ | `LoginScreen.tsx` |
| Connexion Google / Facebook | 🟡 | Code `expo-auth-session` + `SocialAuthButtons` ; client IDs absents → « OAuth non configuré » |
| Réinitialisation du mot de passe | ✅ | `ResetPasswordScreen.tsx` |
| Session persistante | ✅ | `onAuthStateChanged`, `browserLocalPersistence` |
| JWT gérés par Firebase | ✅ | Firebase Auth |
| Validation email | ✅ | Regex côté formulaire + Firebase |
| Mot de passe 8 car. / majuscule / chiffre / spécial | ✅ | `validatePassword` |
| Stockage sécurisé du token | ✅ | `expo-secure-store` (mobile), localStorage (web) |
| Splash (animation logo) | ✅ | 2,6 s |
| Onboarding 3 slides swipables | ✅ | `OnboardingScreen.tsx` |
| Login / Signup / Reset Password | ✅ | + page d'accueil publique (hors cahier) |

### 2.2 Bibliothèque vivante (§ 4.2)

| Exigence | État | Preuve / remarque |
|---|---|---|
| Parcourir contes, proverbes, coutumes | ✅ | `src/data/stories.ts` |
| Filtrer par région | ✅ | `SearchScreen.tsx` |
| Filtrer par ethnie | ✅ | `SearchScreen.tsx` |
| Filtrer par catégorie | ✅ | `SearchScreen.tsx` |
| Filtrer par langue | ⚠️ | Le catalogue ne porte pas d'attribut de langue : les récits sont en français. Décision éditoriale à prendre avant d'ajouter le filtre |
| Recherche par mot-clé | ✅ | Insensible à la casse, aux accents et au pluriel |
| Écoute audio | 🟡 | `expo-av` + 1 enregistrement réel (`soundiatastory.mp3`), synthèse vocale pour les 49 autres |
| Ajout / retrait des favoris | ✅ | Firestore + cache local |
| Pagination 20 par page | ✅ | `PAGE_SIZE = 20` |
| Pull-to-refresh | ✅ | Accueil, recherche, favoris |
| Streaming audio progressif | ✅ | Lecture par URL, pas de pré-téléchargement |
| Cache images | ✅ | `expo-image` (`cachePolicy="memory-disk"`) |
| Index composites Firestore | ✅ | `firestore.indexes.json` (prêts pour des requêtes serveur) |
| Modèle `stories` | ✅ | `id, title, content, imageUrl, audioUrl, category, region, ethnicGroup, likes, views` |
| Modèle `favorites` | ✅ | `{ userId, storyId, createdAt }`, document `{userId}_{storyId}` |

### 2.3 Profil utilisateur (§ 4.3)

| Exigence | État | Preuve / remarque |
|---|---|---|
| Modifier nom et photo | ✅ | `EditProfileScreen.tsx` |
| Upload photo (galerie, compression) | ✅ | `expo-image-picker` + `expo-image-manipulator` |
| Stockage photo | ✅ | Firebase Storage, repli local en mode démo |
| Langues préférées | ✅ | Mandingue, Pular, Soussou, Français |
| Voir ses favoris | ✅ | Écran `Favorites` |
| Se déconnecter | ✅ | `ProfileScreen.tsx` |
| Modèle `users` | ✅ | `{ id, name, email, photoUrl, preferredLanguages, role, createdAt }` |

### 2.4 Non-fonctionnel (§ 5)

| Exigence | État | Preuve / remarque |
|---|---|---|
| Chargement initial < 3 s en 3G | ❓ | Non mesuré. Le catalogue en cache s'affiche avant le réseau (perception améliorée) |
| Réponse API < 500 ms (95 %) | 🟡 | Recherche locale après cache mémoire ; DjeliBot dépend de Gemini (12 s max par tentative) |
| Démarrage audio < 2 s | ❓ | Non mesuré |
| Scroll 60 FPS | 🟡 | `FlatList` optimisée (`initialNumToRender`, `windowSize`, `removeClippedSubviews`) |
| iOS 13+ / Android 5+ | ⚠️ | Expo SDK 54 impose des minimums plus récents (iOS 15.1, Android API 24) |
| HTTPS | ✅ | Vercel |
| Tokens JWT 7 jours + refresh | ✅ | Géré par Firebase Auth |
| Règles Firestore | ✅ | Lecture publique des récits, écriture admin, favoris par propriétaire |
| Lecture des profils restreinte | ✅ | Propriétaire ou admin uniquement |
| Validation serveur des écritures | 🟡 | Règles Firestore durcies (champs, intégrité) ; pas de Cloud Functions |
| Accessibilité (libellés, rôles) | ✅ | Cartes, favoris, filtres, onglets, en-têtes |
| Contraste WCAG AA | 🟡 | Petits textes or remplacés par le vert profond ; audit complet non réalisé |
| Lecteurs d'écran | 🟡 | Rôles et libellés posés, test VoiceOver / TalkBack non réalisé |
| Offline-first | ✅ | Cache `AsyncStorage` du catalogue + bannière hors ligne + cache des favoris |

### 2.5 Design (§ 6)

| Exigence | État | Preuve / remarque |
|---|---|---|
| Palette terracotta / sable / sauge | ⚠️ | Palette du logo retenue : vert `#006838`, or `#F9D616`, rouge `#CE2029` |
| Typographie Poppins | ✅ | + Playfair Display pour les titres |
| Bottom tabs Accueil / Recherche / Favoris / Profil | ⚠️ | 6 onglets : Accueil, DjeliBot, Langues, Livres, Boutique, Profil ; Favoris accessible depuis le Profil |
| StoryCard | ✅ | Image, catégorie, région, favori |
| AudioPlayer | ✅ | Play/pause, ±10 s, vitesse |
| FilterChip | ✅ | Catégorie, région, ethnie |
| EmptyState | ✅ | Message éditorial + action |

### 2.6 Livrables et recette (§ 7, 9, 11)

| Exigence | État | Prérequis |
|---|---|---|
| Code source versionné | ✅ | GitHub `mohamede10/djelia-v2` |
| README / doc technique | ✅ | `README.md` + ce document |
| Tests unitaires Jest | ✅ | 54 tests, 5 suites |
| Tests utilisateurs (10 personnes) | ❌ | À organiser |
| Rapport de satisfaction ≥ 4/5 | ❌ | Dépend des tests utilisateurs |
| Build APK Android | ⛔ | Compte Expo EAS + `eas build -p android` |
| Build IPA iOS / TestFlight | ⛔ | Compte Apple Developer |
| Maquettes Figma + design system | ❌ | Fichier Figma non fourni |
| 50 récits avec audios | 🟡 | 50 récits livrés, 1 audio réel |
| Démo investisseurs | ❌ | À planifier |

---

## 3. Fonctionnalités ajoutées lors de cet audit

1. **Catalogue hors-ligne** (cahier § 5.5)
   - `src/services/storageService.ts` : `readCachedCatalogue`,
     `writeCachedCatalogue`, `clearCachedCatalogue`, `toCacheableStories`.
   - `src/services/dataService.ts` : `getCatalogue`, `getCachedStories`,
     `invalidateCatalogue`, cache mémoire de 5 minutes.
   - `src/screens/home/HomeScreen.tsx` : affichage instantané du cache, puis
     rafraîchissement réseau ; bannière « Hors ligne » avec la date du cache.
   - `getStoryById` consulte désormais le cache avant le catalogue embarqué.

2. **Règles de sécurité renforcées** (cahier § 5.3)
   - Lecture des profils limitée au propriétaire ou à un administrateur.
   - Validation des champs `name` / `email` à la création et à la mise à jour.
   - Intégrité des favoris : identifiant `{userId}_{storyId}` vérifié.

3. **Index Firestore** (cahier § 4.2)
   - `firestore.indexes.json` + déclaration dans `firebase.json`.

4. **Accessibilité et contraste** (cahier § 5.4)
   - Libellé sur le bouton de recherche de l'accueil.
   - État `selected` annoncé sur le bouton favori.
   - Titres d'écran en `accessibilityRole="header"`.
   - Petits textes or sur fond clair passés au vert profond.

5. **Tests**
   - `dataService.offline.test.ts` : bascule sur le cache, réassociation de
     l'audio embarqué, cache mémoire.
   - Tests du catalogue local et de l'invalidation dans `dataService.test.ts`.

---

## 4. Ce qui reste à faire

### 4.1 Réalisable sans dépendance externe

| Action | Effort | Impact |
|---|---|---|
| Mesurer le chargement (3G, Chrome DevTools) et consigner les chiffres | 1 h | Prouve le critère < 3 s |
| Audit VoiceOver / TalkBack sur 3 écrans | 0,5 j | Conformité accessibilité |
| Rédiger le protocole de test utilisateur (10 personnes) | 0,5 j | Prépare la recette |
| Filtrer les sources web de DjeliBot sur celles réellement citées | 0,5 j | Qualité des réponses |

### 4.2 Bloqué par un prérequis externe

| Action | Prérequis exact |
|---|---|
| OAuth Google / Facebook | Client IDs Google Cloud + Facebook Developers, domaines autorisés dans Firebase |
| 50 audios de griots | Enregistrements + validation culturelle ; dépôt dans `assets/audio/` ou Firebase Storage |
| APK / IPA | Compte Expo (EAS) et compte Apple Developer |
| Maquettes Figma | Fichier source du designer |
| Tests 10 utilisateurs | Panel de testeurs |

### 4.3 Décisions à acter

1. **Palette** : conserver l'identité du logo (vert / or / rouge) et mettre à
   jour le cahier, ou revenir au terracotta.
2. **Navigation** : 6 onglets (produit actuel) ou 4 onglets + menus secondaires.
3. **Filtre par langue** : ajouter un attribut `language` aux récits (travail
   éditorial) ou retirer l'exigence.
4. **DjeliBot / Langues / Boutique** : les déclarer livrés en avance et mettre à
   jour la roadmap du cahier.

---

## 5. Mise en production des règles et index

```bash
firebase login
firebase use djelia-991aa
firebase deploy --only firestore:rules,firestore:indexes
```

Les règles sont plus strictes qu'avant : vérifier après déploiement que
l'inscription, la connexion et l'ajout aux favoris fonctionnent toujours.

---

## 6. Conclusion

Le socle MVP du cahier des charges est livré et vérifié. Les points ouverts
relèvent de la production (contenus audio, identifiants OAuth, builds, recette
utilisateur) et de décisions de design, non de développements manquants.
