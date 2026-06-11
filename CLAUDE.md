RÈGLE ABSOLUE : CONFORMITÉ PYPI (Exigence de Sécurité)
Il est STRICTEMENT INTERDIT d'ajouter ou de modifier l'un des éléments suivants sans mettre à jour immédiatement la section "Background behavior, fully disclosed" du README :

Services en arrière-plan (Background services)

Processus persistants (ex: file watching, hooks, login services)

Télémétrie (même anonyme) ou appels réseau cachés

Stockage de fichiers locaux (ex: ~/.code-index/)

Motif : Non-négociable. Le défaut de divulgation a déjà entraîné une mise en quarantaine par la sécurité de PyPI.

## ⚡ STANDARDS ASTRO & TYPESCRIPT
---
description: "Cursor rules for Astro development with TypeScript integration."
globs: **/*
alwaysApply: false
---
{
  "rules": {
    "commit_message_guidelines": {
      "description": "Guidelines for creating conventional commit messages.",
      
      "format": {
        "description": "The format for commit messages using the conventional commits spec.",
        "body": "[optional scope]: \n\n[optional body]\n\n[optional footer(s)]"
      },
      
      "enabled": true,
      
      "rules": [
        {
          "description": "Always suggest a conventional commit with a type and optional scope in lowercase letters."
        },
        {
          "description": "Keep the commit message concise and within 60 characters."
        },
        {
          "description": "Ensure the commit message is ready to be pasted into the terminal without further editing."
        },
        {
          "description": "Provide the full command to commit, not just the message."
        }
      ],
      
      "examples": [
        {
          "prompt": "<diff_context> /commit",
          "response": "git commit -m 'feat: add responsive navbar with TailwindCSS'"
        }
      ]
    },
    
    "development_guidelines": {
      "description": "Guidelines for developing code with Astro, TypeScript, and TailwindCSS.",
      
      "enabled": true,
      
      "rules": [
        {
          "description": "Enforce strict TypeScript settings, ensuring type safety across the project."
        },
        {
          "description": "Use TailwindCSS for all styling, keeping the utility-first approach in mind."
        },
        {
          "description": "Ensure Astro components are modular, reusable, and maintain a clear separation of concerns."
        }
      ]
    },
    
    "coding_style": {
      "description": "Guidelines for maintaining consistent coding style.",
      
      "enabled": true,
      
      "rules": [
        {
          "description": "Code must start with path/filename as a one-line comment."
        },
        {
          "description": "Comments should describe purpose, not effect."
        },
        {
          "description": "Prioritize modularity, DRY principles, and performance."
        }
      ]
    },
    
    "custom_slash_commands": {
      "description": "Custom slash commands.",
      
      "enabled": true,
      
      "commands": [
        {
          "name": "/commit",
          "description": "Generate a Git commit message using the conventional commits spec.",
          "enabled": true
        }
      ]
    }
  }
}