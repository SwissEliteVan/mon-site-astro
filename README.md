# Projet CLICOM

## 1. Présentation
Le projet CLICOM est le site vitrine d'une agence web B2B basée en Suisse. Il est conçu avec une **architecture hybride** (génération statique pour une vitesse optimale et rendu côté serveur pour les routes API) afin de garantir des performances de chargement parfaites et une sécurité accrue. Le projet met l'accent sur la conformité avec la nouvelle Loi fédérale sur la protection des données (nLPD). Les fonctionnalités principales incluent un mode sombre géré manuellement (via la classe .dark), des formulaires de contact hautement sécurisés (Honeypot, Anti-XSS, Rate Limiting), un chatbot d'assistance et une structure avancée pour le SEO local (Programmatic SEO avec JSON-LD).

## 2. Stack Technique
- **Framework** : Astro (Mode Hybrid)
- **Composants UI** : React
- **Styling** : Tailwind CSS v4
- **Validation & Sécurité** : Zod, xss
- **Mailing** : Resend
- **Environnement** : Node.js (version 22.12.0 ou supérieure requise)

## 3. Installation et Développement
Pour configurer l'environnement de développement local, exécutez les commandes suivantes dans votre terminal :

1. Cloner le dépôt et accéder au répertoire du projet, puis installer les dépendances :
`npm install`

2. Créer un fichier `.env` à la racine du projet et y ajouter les clés d'API nécessaires :
`RESEND_API_KEY=re_votre_cle_api_ici`

3. Démarrer le serveur de développement :
`npm run dev`
Le serveur sera accessible par défaut sur le port local `http://localhost:4321`.

## 4. Production et Déploiement
Le projet est configuré pour être déployé automatiquement sur **Vercel** grâce à l'adaptateur `@astrojs/vercel`.

1. Pousser les modifications sur le dépôt GitHub principal :
`git add .`
`git commit -m "Description des modifications"`
`git push`

2. Vercel détecte automatiquement le nouveau commit et lance le build.
3. **Important** : Assurez-vous que la variable d'environnement `RESEND_API_KEY` est bien renseignée dans les paramètres du projet sur le tableau de bord Vercel.

## 5. Structure du projet
- `src/components/` : Contient les composants réutilisables de l'interface utilisateur (Astro et React).
- `src/layouts/` : Contient les gabarits de page et la configuration SEO de base.
- `src/pages/` : Contient les fichiers de routage, les vues principales et la génération dynamique des villes (`[ville].astro`).
- `src/pages/api/` : Contient la logique backend et les routes API sécurisées (ex: `contact.ts`).
- `src/styles/` : Contient les fichiers de configuration CSS globaux et les directives Tailwind.