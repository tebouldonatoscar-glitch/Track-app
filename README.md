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
  app/            pages (App Router) : /, /scan, /product, /add, /history, /favorites, /goals
  components/     composants UI réutilisables
  lib/
    api/          client Open Food Facts + parsing
    macros/       calcul des macronutriments (fonctions pures)
    scoring/      score maison (fonctions pures)
    storage/      IndexedDB (historique, favoris, objectifs) + export CSV
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

**Étape manuelle unique requise** (impossible à faire depuis l'agent, nécessite un accès aux
paramètres du dépôt) : dans **Settings → Pages** du dépôt GitHub, régler *Source* sur
**"GitHub Actions"**. Une fois cette option activée, chaque push sur `main` redéploie
automatiquement l'app sur `https://<owner>.github.io/Track-app/`.

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
- Ajout manuel d'un produit absent d'Open Food Facts
- Historique des scans, favoris/produits fréquents, objectifs journaliers avec barres de
  progression, export CSV
- Gestion des cas limites : produit introuvable, valeurs nutritionnelles manquantes, quantité
  invalide, absence de réseau
