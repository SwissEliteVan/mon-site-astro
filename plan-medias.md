# Plan Médias Technique - Pages Locales [ville].astro

## Spécifications Techniques par Type de Média

| Type de Média | Emplacement | Format | Dimensions (px) | Poids Max | Usage | Critères Qualité |
|---------------|-------------|--------|-----------------|-----------|-------|------------------|
| **Vidéo Hero** | Section Hero - Arrière-plan principal | MP4 + WebM | 1920×1080 (16:9) | < 3 Mo | Lecture automatique en boucle avec poster | Optimisée pour mobile, compression H.264 |
| **Image Hero** | Section Hero - Poster vidéo + Fallback | WebP | 1920×1080 (16:9) | < 150 Ko | Image de couverture avant lecture vidéo | Haute qualité, représentative de la zone géographique |
| **Image SEO/OG** | Métadonnées - Open Graph & JSON-LD | WebP | 1200×630 (1.91:1) | < 100 Ko | Partage social et référencement | Lisible sur miniature, logo/texte visible |
| **Image Services** | Section Services - Illustrations (non utilisée actuellement) | WebP | 800×600 (4:3) | < 80 Ko | Support visuel pour chaque service | Cohérence graphique, clarté iconographique |

## Recommandations par Ville

### Contenu Visuel Requis
- **Identité locale** : Éléments architecturaux ou paysages reconnaissables
- **Cohérence marque** : Palette couleur CLICOM (lime/dark) respectée
- **Lisibilité mobile** : Contraste suffisant pour superposition de texte

### Formats de Livraison
```
/assets/videos/
├── hero-video.mp4        # Version principale (H.264, 30fps)
└── hero-video.webm       # Version alternative (VP9)

/assets/images/
├── [service]-[ville].webp     # Images SEO/Hero (ex: creation-site-lausanne.webp)
└── services-[ville].webp      # Images services (optionnel, non implémenté)
```

### Optimisation Performance
- **Vidéo** : Compression agressive pour mobile, pas de son requis
- **Images** : Compression WebP avec fallback, lazy loading natif
- **CDN** : Toutes les ressources doivent être optimisées pour la diffusion

### Validation Technique
- ✅ Affichage correct sur viewport 360px (mobile)
- ✅ Temps de chargement < 2s sur 3G
- ✅ Ratio aspect maintenu sur tous écrans
- ✅ Accessibilité : alt-text descriptif obligatoire

---
*Dernière mise à jour : Générée automatiquement depuis src/pages/[ville].astro*