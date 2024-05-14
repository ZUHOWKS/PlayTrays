# PlayTrays

L'objectif est de développer une application de jeux sur plateau, ergonomique, moderne et ouverte à tout type 
de public.

## Crédits

Ce projet a été développé dans le cadre de notre cursus **préparatoire aux écoles d'ingénieurs de Polytech** en partenariat
avec l'**Université Savoie Mont Blanc** et est encadré par **Flavien VERNIER**.

L'application a été developpée par :
- **Joris VILARDELL** (aka ZUHOWKS)
- **Mathias HELLAL** (aka Majurax)
- **Mathilde VARAGNAT**
- **Othmane GARTANI**

# Adonis pour PlayTrays

Adonis est une technologie robuste et puissante pour créer des API REST. Dans le cadre ce projet, Adonis joue le rôle de chef
d'orchestre ! C’est lui qui gère en arrière plan toutes les requêtes utilisateurs. En plus de cela, en complément de
l'API Game Server, il est capable de balancer les utilisateurs sur l'un des lobbies des serveurs jeu grâce au processus de
Matchmaking.

Voici la liste des fonctionnalités développées:
- [x] Réseau social. Les utilisateurs peuvent demander en ami !
- [x] Système de groupage pour être lancé dans une même partie.
- [x] Processus de Matchmaking pour matché des utilisateurs recherchant une partie d'un même mode de jeu.