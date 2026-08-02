# NutriScan

PWA personnelle de scan nutritionnel : scanner un code-barres alimentaire, consulter le
Nutri-Score / NOVA / ingrédients via [Open Food Facts](https://world.openfoodfacts.org/), calculer
les macronutriments pour une quantité donnée, et suivre ses apports quotidiens.

100% côté client : aucune donnée personnelle ne quitte l'appareil. Le stockage (historique,
favoris, produits ajoutés manuellement, objectifs) se fait en local via IndexedDB.

## Stack technique

- **Next.js 14** (App Router) + React + TypeScript, exporté en site statique (`output: "export"`)
- **Tailwind CSS** pour le style
- **PWA** : `manifest.json` + service worker maison (cache app shell, réseau direct pour l'API)
- **html5-qrcode** pour le scan caméra des codes-barres EAN/UPC
- **idb** (wrapper IndexedDB) pour le stockage local
- **Vitest** pour les tests unitaires de la logique métier
- **Playwright** pour les tests end-to-end (caméra simulée via un flux vidéo factice Chromium,
  API Open Food Facts mockée)

## Structure

```
src/
  app/            pages (App Router) : /, /scan, /product, /add, /foods, /describe,
                  /history, /favorites, /goals
  components/     composants UI réutilisables
  lib/
    api/          client Open Food Facts + parsing
    ai/           estimation de plats via l'API Gemini (client + parsing + redimensionnement photo)
    data/         base d'aliments courants intégrée (fruits, légumes, œufs, féculents...)
    macros/       calcul des macronutriments (fonctions pures)
    scoring/      score maison (fonctions pures)
    storage/      IndexedDB (historique, favoris, objectifs) + réglages IA (localStorage) + export CSV
    types/        types partagés
e2e/              tests Playwright
tests/unit/       tests Vitest
```

## Développement

```bash
npm install
npm run dev       # http://localhost:3000
npm run lint
npm run test       # tests unitaires (Vitest)
npm run test:e2e   # tests end-to-end (Playwright)
npm run build      # build statique -> dossier out/
```

## Déploiement : GitHub Pages

**Choix : GitHub Pages plutôt que Vercel.** Un déploiement Vercel nécessite de lier un compte
Vercel et un token d'API externe — une étape impossible à automatiser en autonomie complète sans
accès à ce compte. GitHub Pages, elle, ne dépend que du dépôt lui-même : le workflow GitHub
Actions (`.github/workflows/deploy.yml`) build et déploie automatiquement à chaque push sur
`main`, avec le `GITHUB_TOKEN` fourni nativement par Actions (aucun secret à configurer).
L'application étant 100% statique (pas de backend, pas d'API routes Next.js), l'export statique
(`output: "export"`) est parfaitement adapté à GitHub Pages.

Le workflow :
1. installe les dépendances, lint, lance les tests unitaires et Playwright ;
2. build l'export statique (`npm run build` → dossier `out/`) ;
3. publie `out/` sur GitHub Pages via `actions/deploy-pages`.

L'activation initiale de GitHub Pages (Settings → Pages → Source : "GitHub Actions") a nécessité
une action manuelle ponctuelle du propriétaire du dépôt : le `GITHUB_TOKEN` fourni à Actions n'a
pas le droit de créer un site Pages pour la première fois (`Resource not accessible by
integration`), même avec la permission `pages: write`. Une fois cette activation faite, chaque
push sur `main` redéploie automatiquement l'app sur `https://tebouldonatoscar-glitch.github.io/Track-app/`.

## Fonctionnalités

- Scan caméra de codes-barres (EAN/UPC) — mobile-first, nécessite HTTPS
- Fiche produit : nom, marque, image, Nutri-Score, groupe NOVA, ingrédients, allergènes
- **Score maison** : note sur 100 combinant Nutri-Score, degré de transformation NOVA, teneur en
  sucres et nombre d'additifs — un produit peut avoir un bon Nutri-Score tout en étant très
  transformé, le score maison le reflète
- Calcul des macros (calories, protéines, glucides, sucres, lipides, fibres, sel) pour une
  quantité donnée (grammes ou portion)
- Mise en avant du ratio protéines/calories (usage sportif) et alerte visuelle NOVA 4
  (ultra-transformé)
- Ajout manuel d'un produit absent d'Open Food Facts, avec ou sans code-barres (aliments génériques
  type œufs/farine dont les valeurs ne dépendent pas de la marque), et saisie à l'unité (ex: "2
  œufs") plutôt qu'en grammes quand ça a du sens
- **Base d'aliments courants** intégrée (`/foods`) : fruits, légumes, œufs, féculents et
  légumineuses avec valeurs nutritionnelles moyennes, sans avoir besoin de les scanner ni de les
  saisir soi-même
- **Estimation par IA** (`/describe`) : décrire un plat en texte et/ou joindre une photo pour
  obtenir une estimation des valeurs nutritionnelles totales, via l'API gratuite de Google Gemini.
  Nécessite une clé API personnelle (gratuite sur [aistudio.google.com](https://aistudio.google.com/apikey)),
  stockée uniquement dans le navigateur — jamais transmise ailleurs qu'à l'API Gemini. Estimation
  approximative, clairement signalée comme telle, moins fiable qu'un scan de code-barres
- Historique des scans, favoris/produits fréquents, objectifs journaliers avec barres de
  progression, export CSV
- Gestion des cas limites : produit introuvable, valeurs nutritionnelles manquantes, quantité
  invalide, absence de réseau, clé API IA manquante/invalide, quota IA dépassé
