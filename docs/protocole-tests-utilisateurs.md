# Protocole de tests utilisateurs — Djelia

**Version :** 1.0 (novembre 2026)
**Public :** 10 testeurs externes
**Objectif :** vérifier que le MVP du cahier des charges est utilisable par un
public non technique et recueillir une note de satisfaction ≥ 4/5.

Ce document prépare la recette exigée au § 9 du cahier des charges. Les tests ne
sont pas encore réalisés : il faut un panel de 10 personnes.

---

## 1. Profil des testeurs

| # | Profil | Critère |
|---|---|---|
| 1-3 | Jeunes urbains 18-25 ans | Guinée, usage quotidien du smartphone |
| 4-5 | Enseignants / bibliothécaires | Intérêt pour le patrimoine oral |
| 6-7 | Personnes de 45 ans et plus | Lecture d'écran difficile, texte agrandi |
| 8 | Personne en situation de handicap visuel | Lecteur d'écran (TalkBack / VoiceOver) |
| 9 | Utilisateur Android d'entrée de gamme | Réseau 3G, appareil ancien |
| 10 | Membre de la diaspora | Français langue seconde |

Aucun testeur ne doit avoir participé au développement.

---

## 2. Déroulé d'une session (45 min)

1. **Accueil (5 min)** — rappeler qu'on teste l'application, pas la personne ;
   recueillir le consentement pour l'enregistrement d'écran.
2. **Tâches guidées (25 min)** — une tâche à la fois, sans aide, sauf blocage de
   plus de 2 minutes. Noter le temps, les hésitations, les erreurs.
3. **Entretien (10 min)** — questions ouvertes sur les points de friction.
4. **Questionnaire (5 min)** — 8 affirmations, échelle de 1 à 5.

---

## 3. Tâches à réaliser

| # | Tâche | Critère de réussite | Mesure |
|---|---|---|---|
| T1 | Depuis la page d'accueil, créer un compte | Compte créé, arrivée sur l'accueil | Temps, nombre d'erreurs |
| T2 | Trouver un conte du Mandingue | 1 récit filtré par région + catégorie | Temps |
| T3 | Écouter un récit | Audio lancé en moins de 2 s | Temps de démarrage |
| T4 | Mettre un récit en favori, le retrouver | Favori visible dans le profil | Réussite oui/non |
| T5 | Poser une question à DjeliBot (« Qui était Soundiata Keïta ? ») | Réponse en français, sources affichées | Pertinence notée 1-5 |
| T6 | Poser une question hors catalogue (« Quelle est la capitale du Sénégal ? ») | Réponse sourcée (web) ou refus explicite | Pertinence notée 1-5 |
| T7 | Modifier son nom et ses langues préférées | Profil enregistré après rechargement | Réussite oui/non |
| T8 | Utiliser l'application en mode avion (catalogue déjà chargé) | Récits consultables, bannière « Hors ligne » visible | Réussite oui/non |

---

## 4. Questionnaire de satisfaction (1 = pas du tout d'accord, 5 = tout à fait)

1. L'application est facile à prendre en main.
2. Je comprends immédiatement à quoi sert Djelia.
3. Les récits sont faciles à trouver.
4. La lecture audio est agréable.
5. Les réponses de DjeliBot sont fiables.
6. Le design donne envie d'explorer.
7. Je recommanderais Djelia à un proche.
8. Je me sentirais à l'aise pour l'utiliser sans aide.

**Cible :** moyenne ≥ 4/5 et aucune question sous 3,5/5.

---

## 5. Grille d'observation (par testeur)

| Élément | Valeur |
|---|---|
| Appareil / navigateur | |
| T1 temps / erreurs | |
| T2 temps | |
| T3 démarrage audio | |
| T4, T7, T8 réussite | |
| T5, T6 pertinence | |
| Blocages rencontrés | |
| Citations marquantes | |
| Note moyenne du questionnaire | |

---

## 6. Livrables attendus

1. Tableau de synthèse des 10 sessions (temps, réussites, notes).
2. Liste des 5 principaux points de friction, classés par gravité.
3. Rapport de satisfaction avec la moyenne par question et la moyenne globale.
4. Décision : correctifs bloquants avant diffusion, ou mise en production.

---

## 7. Points à surveiller (hypothèses à valider)

- La page d'accueil publique est-elle comprise sans explication orale ?
- Le nom « DjeliBot » est-il clair pour un public non initié ?
- Les six onglets de navigation sont-ils trop nombreux ?
- Le vocabulaire (« archives récentes », « gardien du savoir ») est-il compris ?
- Le mode hors ligne est-il remarqué et compris ?
