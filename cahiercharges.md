DJELIA
La mémoire africaine à l'ère du numérique
CAHIER DES CHARGES TECHNIQUE
Développement du Prototype Mobile (Expo/React Native)
Version 1.0 • MVP Phase 1
Conakry, Guinée 
Avril 2025
 
1. PRÉSENTATION DU PROJET
1.1. Vision
Djelia est une application mobile dédiée à la préservation, la valorisation et l'apprentissage de la culture africaine, en commençant par la Guinée. Le nom Djelia fusionne « Djeli » (griot, gardien de la mémoire orale) et Intelligence Artificielle, symbolisant l'alliance entre héritage ancestral et innovation technologique.
Notre ambition : faire de Djelia la référence africaine de la culture numérique, une plateforme où chaque Africain peut explorer, apprendre et partager son identité culturelle.
1.2. Contexte
Djelia répond à plusieurs lacunes critiques :
•	Disparition progressive des savoirs oraux : les griots vieillissent sans transmission numérique
•	Déconnexion des jeunes générations vis-à-vis de leur culture à l'ère du numérique
•	Absence d'outil centralisé réunissant contes, coutumes, langues locales et talents
•	Barrière linguistique : les langues locales ne sont pas soutenues par les plateformes éducatives existantes
•	Invisibilité des talents culturels : artisans, musiciens, conteurs n'ont pas de vitrine numérique
1.3. Lauréat Hackathon Ansuten
Djelia a remporté le Hackathon Ansuten et bénéficie d'un accompagnement technique de 100 000 000 FG. Le projet est porté par une équipe fondatrice de 5 femmes innovatrices basées à Conakry.
 
2. OBJECTIFS DU PROTOTYPE MVP (PHASE 1)
Le prototype Expo doit valider le concept et servir de démonstration fonctionnelle pour les investisseurs, partenaires institutionnels et utilisateurs pilotes. Il s'agit d'un Minimum Viable Product (MVP) focalisé sur les fonctionnalités essentielles.
2.1. Périmètre du MVP
Fonctionnalités incluses :
•	Authentification utilisateur (email/mot de passe + OAuth Google/Facebook)
•	Bibliothèque Vivante : affichage de contes, proverbes et coutumes classés par région/ethnie
•	Lecteur audio intégré pour les contes et proverbes
•	Interface de recherche et filtrage (par catégorie, région, langue)
•	Système de favoris pour sauvegarder le contenu
•	Profil utilisateur basique (nom, photo, préférences linguistiques)
Fonctionnalités reportées à la Phase 2/3 :
•	DjeliBot (IA conversationnelle) — nécessite entraînement du modèle
•	Module d'apprentissage des langues locales — exercices interactifs complexes
•	Marketplace culturelle — gestion transactionnelle et paiements
2.2. Indicateurs de succès du MVP
•	Application installable et fonctionnelle sur iOS et Android
•	50 contenus culturels minimum dans la bibliothèque (contes, proverbes, coutumes)
•	Temps de chargement < 3 secondes sur connexion 3G
•	Interface intuitive validée par 10 utilisateurs test
•	Démonstration réussie devant investisseurs et partenaires institutionnels
 
3. ARCHITECTURE TECHNIQUE
3.1. Stack technologique
Composant	Technologie	Justification
Frontend Mobile	Expo + React Native	Cross-platform iOS/Android, développement rapide, écosystème riche
Backend / API	Node.js + Express / NestJS	Performance, flexibilité, JavaScript full-stack
Base de données	Firebase Firestore	NoSQL temps réel, scalabilité, intégration native avec Expo
Authentification	Firebase Auth	Sécurité éprouvée, OAuth social intégré
Stockage médias	Firebase Storage / Cloudinary	Audio, images, vidéos culturelles optimisées
State Management	Redux Toolkit / Zustand	Gestion d'état prévisible, DevTools, communauté active
UI Framework	React Native Paper / NativeBase	Composants Material Design prêts à l'emploi, accessibilité

3.2. Schéma d'architecture
Architecture en 3 couches :
1.	Couche Présentation : Application mobile Expo (React Native) — UI/UX, navigation, gestion d'état locale
2.	Couche Métier : API REST (Node.js/Express) — logique applicative, validation, orchestration
3.	Couche Données : Firebase (Firestore + Storage + Auth) — persistance, médias, authentification
 
4. SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES
4.1. Module Authentification
User Stories :
•	En tant qu'utilisateur, je peux créer un compte avec email/mot de passe
•	En tant qu'utilisateur, je peux me connecter via Google ou Facebook
•	En tant qu'utilisateur, je peux réinitialiser mon mot de passe par email
•	En tant qu'utilisateur, je reste connecté après fermeture de l'app (persistent login)
Spécifications techniques :
•	Firebase Authentication pour gestion des tokens JWT
•	OAuth 2.0 pour intégration Google/Facebook via expo-auth-session
•	Validation email : regex + vérification domaine
•	Mot de passe : minimum 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
•	Stockage sécurisé du token : expo-secure-store (keychain iOS / keystore Android)
Écrans concernés :
•	Splash Screen (animation logo Djelia 2s)
•	Onboarding (3 slides explicatives swipables)
•	Login
•	Signup
•	Reset Password
4.2. Module Bibliothèque Vivante
User Stories :
•	En tant qu'utilisateur, je peux parcourir les contes, proverbes et coutumes
•	En tant qu'utilisateur, je peux filtrer par région (Conakry, Kindia, Labé, etc.)
•	En tant qu'utilisateur, je peux filtrer par ethnie (Peul, Mandingue, Soussou, etc.)
•	En tant qu'utilisateur, je peux rechercher par mot-clé (titre, description)
•	En tant qu'utilisateur, je peux écouter la narration audio des contes
•	En tant qu'utilisateur, je peux ajouter du contenu à mes favoris
Spécifications techniques :
•	FlatList avec pagination (20 items par page) pour performances optimales
•	Pull-to-refresh pour actualiser le contenu
•	Lecteur audio : expo-av avec contrôles play/pause/seek
•	Streaming audio progressif (pas de téléchargement complet avant lecture)
•	Cache images : react-native-fast-image pour réduire consommation data
•	Indexation Firestore : index composites pour requêtes multi-filtres
Modèle de données (Firestore Collections) :
•	Collection 'stories' : { id, title, description, content, audioUrl, imageUrl, category (conte/proverbe/coutume), region, ethnicity, createdAt, likes, views }
•	Collection 'favorites' : { userId, storyId, createdAt }
Écrans concernés :
•	Home (liste de contenu avec filtres)
•	Story Detail (lecture complète + audio player)
•	Search (barre de recherche + résultats)
4.3. Module Profil Utilisateur
User Stories :
•	En tant qu'utilisateur, je peux modifier mes informations (nom, photo)
•	En tant qu'utilisateur, je peux définir mes langues préférées (Pular, Mandingue, Soussou)
•	En tant qu'utilisateur, je peux voir mes contenus favoris
•	En tant qu'utilisateur, je peux me déconnecter
Spécifications techniques :
•	Upload photo : expo-image-picker + compression automatique (max 500KB)
•	Stockage photo de profil : Firebase Storage avec URL publique
•	Collection 'users' : { uid, displayName, email, photoURL, preferredLanguages[], createdAt }
Écrans concernés :
•	Profile (affichage informations utilisateur)
•	Edit Profile
•	Favorites List
 
5. SPÉCIFICATIONS NON-FONCTIONNELLES
5.1. Performance
•	Temps de chargement initial : < 3 secondes sur 3G
•	Temps de réponse API : < 500ms pour 95% des requêtes
•	Démarrage audio : < 2 secondes après appui play
•	Scroll fluide : 60 FPS minimum sur listes de contenu
5.2. Compatibilité
•	iOS : version 13.0 et supérieures
•	Android : API Level 21 (Android 5.0 Lollipop) et supérieures
•	Résolutions : support smartphones de 4 à 7 pouces
5.3. Sécurité
•	HTTPS obligatoire pour toutes les communications API
•	Tokens JWT avec expiration à 7 jours
•	Refresh token automatique avant expiration
•	Règles de sécurité Firestore : accès lecture publique, écriture authentifiée uniquement
•	Validation côté serveur (Firebase Cloud Functions) pour toute création/modification de données
5.4. Accessibilité
•	Labels accessibilité (accessibilityLabel) sur tous les boutons
•	Contraste minimum WCAG AA : ratio 4.5:1 pour texte normal
•	Support des lecteurs d'écran (VoiceOver iOS / TalkBack Android)
5.5. Offline-first (Nice to have)
•	Affichage des contenus mis en cache même hors connexion
•	Synchronisation automatique au retour de connexion
 
6. SPÉCIFICATIONS DESIGN UI/UX
6.1. Identité visuelle
Palette de couleurs (inspirée de l'Afrique) :
•	Primaire : #B85042 (Terracotta) — chaleur, terre africaine
•	Secondaire : #E7E8D1 (Sable) — neutralité, élégance
•	Accent : #A7BEAE (Sauge) — fraîcheur, modernité
•	Texte principal : #2D2D2D (Charbon foncé)
•	Arrière-plan : #FAFAFA (Blanc cassé)
Typographie :
•	Titres : Poppins Bold (Google Fonts)
•	Corps de texte : Poppins Regular / Light
6.2. Navigation
Structure de navigation (Bottom Tab Navigator) :
•	Accueil : Bibliothèque vivante (feed de contenu)
•	Recherche : Moteur de recherche + filtres avancés
•	Favoris : Contenus sauvegardés
•	Profil : Paramètres utilisateur
6.3. Composants UI clés
•	StoryCard : Carte visuelle avec image, titre, catégorie, durée audio, bouton favoris
•	AudioPlayer : Player minimaliste avec waveform, play/pause, seek bar, durée
•	FilterChip : Chips cliquables pour filtrage rapide (région, ethnie)
•	EmptyState : Illustration + message encourageant si aucun résultat
 
7. PLANNING DE DÉVELOPPEMENT
7.1. Roadmap détaillée (6 semaines)
Semaine	Livrables	Jalons
S1	• Setup projet Expo (expo init + config)
• Architecture dossiers (screens, components, services)
• Firebase config (Firestore, Auth, Storage)
• Navigation (React Navigation v6)	Environnement prêt
S2	• Écrans auth (Login, Signup, Reset Password)
• Intégration Firebase Auth (email + OAuth)
• Splash screen + Onboarding
• Gestion état auth (Context API)	Auth fonctionnelle
S3	• Modèle de données Firestore
• Écran Home (FlatList + StoryCard)
• Filtres (région, ethnie, catégorie)
• Pagination et pull-to-refresh	Liste de contenus
S4	• Écran Story Detail (texte + image)
• AudioPlayer component (expo-av)
• Système de favoris (Firestore CRUD)
• Écran Search (barre + résultats)	Lecture et favoris
S5	• Écrans Profile (affichage + édition)
• Upload photo profil (expo-image-picker)
• Écran Favorites List
• Polissage UI (animations, transitions)	Profil et favoris
S6	• Tests utilisateurs (10 testeurs)
• Corrections bugs et feedback
• Build APK/IPA (EAS Build)
• Documentation technique	MVP livré

7.2. Méthodologie
•	Framework : Agile / Scrum adapté (sprints d'1 semaine)
•	Rituels : Stand-up quotidien (15min), revue de sprint (vendredi)
•	Outils : GitHub (versioning), Trello (task management), Figma (design)
•	Tests : Jest pour tests unitaires, test manuels sur appareils réels (iOS + Android)
 
8. BESOINS ET RESSOURCES
8.1. Équipe projet
Rôle	Responsabilités	Charge (j/h)
Lead Developer	Architecture, dev frontend/backend, intégration Firebase	30 jours
UI/UX Designer	Maquettes Figma, design system, assets visuels	10 jours
Content Manager	Collecte de données culturelles (50 contenus minimum)	15 jours
QA Tester	Tests fonctionnels, recette utilisateur	5 jours

8.2. Outils et services
•	Firebase (gratuit jusqu'à 50K utilisateurs actifs/mois) : 0 € pour MVP
•	Expo EAS Build (plan gratuit) : 0 €
•	Cloudinary (plan free 25GB) : 0 €
•	Figma (plan gratuit pour équipe) : 0 €
•	Total infrastructure MVP : 0 € (offres gratuites suffisantes)
8.3. Budget estimé
Coût total développement MVP : couvert par l'accompagnement technique Hackathon Ansuten (100 000 000 FG).
Le budget permet de couvrir les honoraires de développement, de design, de collecte de contenu et de tests utilisateurs.
 
9. CRITÈRES DE VALIDATION ET RECETTE
9.1. Tests fonctionnels
Scénarios de test obligatoires :
•	Création de compte et connexion réussie
•	Navigation fluide entre les onglets
•	Filtrage par région et affichage correct des résultats
•	Lecture audio sans interruption pendant 5 minutes
•	Ajout et retrait de favoris avec persistance après redémarrage
•	Modification de profil avec upload photo
•	Déconnexion et retour à l'écran login
9.2. Tests de performance
•	Temps de chargement initial < 3s sur 3G (testé avec Chrome DevTools throttling)
•	Scroll sans lag sur liste de 100+ items
•	Consommation mémoire < 150MB sur appareil Android moyen
9.3. Tests utilisateurs
•	10 utilisateurs pilotes (mix hommes/femmes, 18-45 ans)
•	Questionnaire de satisfaction (échelle 1-5) : objectif moyenne ≥ 4/5
•	Recueil de feedback qualitatif pour amélioration continue
9.4. Critères d'acceptation finaux
•	Application installable et fonctionnelle sur iOS (TestFlight) et Android (APK)
•	Minimum 50 contenus culturels disponibles dans la bibliothèque
•	Zéro bug bloquant (crashs, impossibilité de se connecter, etc.)
•	Documentation technique livrée (README, guide d'installation, architecture)
•	Démo réussie devant les investisseurs et partenaires institutionnels
 
10. ANALYSE DES RISQUES ET MITIGATION
Risque	Probabilité	Impact	Mitigation
Retard développement	Moyenne	Élevé	Backlog priorisé, sprints courts, revues hebdo
Collecte de contenu insuffisante	Moyenne	Élevé	Partenariat Ministère Culture, appel contributeurs communauté
Problèmes Firebase (quotas)	Faible	Moyen	Monitoring quotas dès S3, plan de migration si dépassement
UX non intuitive	Moyenne	Moyen	Tests utilisateurs dès S4, itérations rapides sur feedback
Problèmes de performance	Moyenne	Élevé	Profiling dès S5, optimisations lazy loading, image caching

 
11. LIVRABLES FINAUX
À l'issue des 6 semaines de développement, les éléments suivants seront livrés :
•	Application mobile fonctionnelle :
◦	Build APK Android (installation sur appareil Android via fichier .apk)
◦	Build IPA iOS (distribué via TestFlight pour tests sur iPhone/iPad)
•	Code source :
◦	Repository GitHub avec historique complet des commits
◦	Architecture modulaire et commentée
•	Documentation technique :
◦	README détaillé (installation, configuration, commandes)
◦	Diagramme d'architecture (Firestore, API, App mobile)
◦	Guide de déploiement (EAS Build, Firebase)
•	Assets de design :
◦	Maquettes Figma complètes (tous les écrans)
◦	Design system exporté (couleurs, typographie, composants)
•	Contenu initial :
◦	Minimum 50 contes/proverbes/coutumes avec audios
◦	Classement par région et ethnie guinéenne
•	Rapport de tests utilisateurs : synthèse des retours, score de satisfaction, axes d'amélioration identifiés
 
12. PERSPECTIVES FUTURES (POST-MVP)
Le MVP constitue la première pierre de l'édifice Djelia. Les phases suivantes permettront d'évoluer vers la vision complète :
Phase 2 — Croissance (3-6 mois post-MVP)
•	Lancement de la Marketplace culturelle (exposition et vente de produits artisanaux)
•	Onboarding des premiers talents et artisans guinéens
•	Partenariat officiel avec le Ministère de la Culture de Guinée
•	Système de contribution communautaire (utilisateurs peuvent soumettre du contenu)
•	Expansion de la base de données culturelle (objectif : 500+ contenus)
Phase 3 — Innovation IA & Langues (6-12 mois post-MVP)
•	Entraînement d'un modèle IA sur le corpus culturel guinéen collecté
•	Lancement de DjeliBot — IA narratrice capable de raconter des contes et répondre aux questions culturelles
•	Module d'apprentissage des langues locales (Pular, Mandingue, Soussou) avec exercices interactifs
•	Expansion vers d'autres pays africains (Sénégal, Mali, Côte d'Ivoire)
•	Recherche de financements auprès d'investisseurs et bailleurs de fonds internationaux
Vision à long terme
Djelia ambitionne de devenir la plateforme de référence pour la culture africaine numérique, accessible à la diaspora mondiale et reconnue par les institutions culturelles internationales (UNESCO, Union Africaine). L'objectif est de préserver et valoriser la mémoire orale africaine pour les générations futures tout en créant une économie culturelle numérique durable pour les artisans et porteurs de culture.
 
CONCLUSION
Ce cahier des charges définit le cadre technique et fonctionnel pour le développement du prototype MVP de Djelia. Le projet s'inscrit dans une démarche d'innovation culturelle et technologique avec un impact social fort : préserver la mémoire orale africaine à l'ère numérique.
L'approche Agile, le choix d'une stack technologique moderne (Expo/React Native + Firebase) et la priorisation d'un MVP centré sur la bibliothèque vivante permettront de livrer un produit fonctionnel en 6 semaines, prêt à être démontré aux investisseurs et partenaires institutionnels.
Djelia n'est pas seulement une application. C'est un mouvement culturel numérique.
« La culture est la mémoire du peuple, la conscience collective de la continuité historique. »
— Proverbe africain
