RÈGLE ABSOLUE : CONFORMITÉ PYPI (Exigence de Sécurité)
Il est STRICTEMENT INTERDIT d'ajouter ou de modifier l'un des éléments suivants sans mettre à jour immédiatement la section "Background behavior, fully disclosed" du README :

Services en arrière-plan (Background services)

Processus persistants (ex: file watching, hooks, login services)

Télémétrie (même anonyme) ou appels réseau cachés

Stockage de fichiers locaux (ex: ~/.code-index/)

Motif : Non-négociable. Le défaut de divulgation a déjà entraîné une mise en quarantaine par la sécurité de PyPI.