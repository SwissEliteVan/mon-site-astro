# Projet CLICOM

## 1. Présentation
Le projet CLICOM est le site vitrine d'une agence web B2B basée en Suisse. Il est conçu avec une architecture statique afin de garantir des performances de chargement optimales et une sécurité accrue. Le projet met l'accent sur la conformité avec la nouvelle Loi fédérale sur la protection des données (nLPD). Les fonctionnalités principales incluent un mode sombre géré manuellement (via la classe .dark), des formulaires de contact sécurisés, un chatbot d'assistance et une structure optimisée pour le SEO local.

## 2. Stack Technique
- Framework : Astro
- Styling : Tailwind CSS v4
- Environnement : Node.js (version 22.12.0 ou supérieure requise)

## 3. Installation et Développement
Pour configurer l'environnement de développement local, exécutez les commandes suivantes dans votre terminal :

Cloner le dépôt et accéder au répertoire du projet, puis installer les dépendances :
```bash
npm install
```

Démarrer le serveur de développement :
```bash
npm run dev
```
Le serveur sera accessible par défaut sur le port local 4321.

## 4. Production et Déploiement
Le déploiement s'effectue via une génération statique (SSG) suivie d'un transfert manuel vers l'infrastructure d'hébergement.

1. Générer la version de production du site :
```bash
npm run build
```
2. Un dossier `dist` est généré à la racine du projet.
3. Compresser le contenu du dossier `dist` au format ZIP.
4. Transférer et extraire manuellement cette archive via le gestionnaire de fichiers de l'hébergeur (Hostinger).

## 5. Structure du projet
- `src/components/` : Contient les composants réutilisables de l'interface utilisateur.
- `src/pages/` : Contient les fichiers de routage et les vues principales de l'application.
- `src/styles/` : Contient les fichiers de configuration CSS globaux et les directives Tailwind.