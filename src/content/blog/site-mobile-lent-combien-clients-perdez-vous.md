---
title: "Votre site mobile est lent : combien de clients perdez-vous chaque jour sans le savoir"
description: "Un site qui met plus de 3 secondes à charger sur téléphone perd 53 % de ses visiteurs. Pour un artisan suisse, cela représente des milliers de francs de chiffre d'affaires envolé."
pubDate: 2026-06-14
author: "Mohamed Saber"
tags: ["Performance", "Mobile", "PME"]
image: "https://picsum.photos/800/400"
---

Un entrepreneur vaudois nous contacte récemment. Son site a été refait il y a deux ans par une agence genevoise. Le design est correct. Les textes sont bien écrits. Mais son téléphone ne sonne presque jamais via le site.

Nous ouvrons Google PageSpeed Insights. Le score mobile est de 34 sur 100. Le temps de chargement dépasse sept secondes. L'entrepreneur ne le savait pas. Son agence ne l'avait jamais informé.

## Ce que la lenteur coûte en chiffres

Les données de Google sont claires : quand le temps de chargement passe d'une à trois secondes, la probabilité de rebond augmente de 32 %. À cinq secondes, elle bondit de 90 %. Au-delà de sept secondes, votre visiteur est déjà parti chez un concurrent.

Prenons un chiffre concret. Un serrurier à Lausanne reçoit 800 visites par mois sur son site. Avec un temps de chargement de sept secondes, il perd environ 53 % de ce trafic, soit 424 visiteurs. Avec un taux de conversion moyen de 5 %, cela représente 21 appels manqués par mois. Si une intervention moyenne est facturée 400 CHF, la perte mensuelle dépasse 8 000 CHF.

## D'où vient la lenteur

Dans les audits que nous réalisons, les causes sont toujours les mêmes :

**Des images non compressées.** Des photos prises avec un smartphone récent pèsent facilement 3 Mo. Sur un site mobile, une image ne devrait jamais dépasser 100 Ko.

**Un constructeur de pages trop lourd.** Les sites faits avec des builders type Elementor, Divi ou WPBakery génèrent un code HTML monstrueux que le navigateur doit digérer avant d'afficher quoi que ce soit.

**Des polices Google chargées depuis les serveurs américains.** À chaque visite, le navigateur doit contacter un serveur distant pour télécharger les fichiers de police. Cela ajoute des centaines de millisecondes de latence. La solution est simple : héberger les polices localement.

**Des widgets sociaux inutiles.** La timeline Instagram dans le footer, le fil Twitter dans la sidebar, le chatbot d'une plateforme externe. Chacun de ces widgets déclenche des dizaines de requêtes vers des serveurs tiers.

## La solution : un site statique et léger

Un site performant en 2026 est un site qui envoie du HTML, du CSS et le strict minimum de JavaScript. C'est l'approche que nous appliquons avec Astro, un framework moderne qui génère des pages statiques ultra-légères, sans base de données, sans code superflu.

Le résultat : un temps de chargement inférieur à une seconde, un score Google PageSpeed supérieur à 95, et surtout, un téléphone qui sonne.