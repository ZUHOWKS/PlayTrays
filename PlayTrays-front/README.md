# PlayTrays

L'objectif est de développer une application de jeux de plateau, ergonomique, moderne et ouverte à tout type de public.

## Crédits

Ce projet a été développé dans le cadre de notre cursus **préparatoire aux écoles d'ingénieurs de Polytech** en partenariat avec l'**Université Savoie Mont Blanc** et est encadré par **Flavien VERNIER**.

L'application a été développée par :
- **Joris VILARDELL** (aka ZUHOWKS)
- **Mathias HELLAL** (aka Majurax)
- **Mathilde VARAGNAT**
- **Othmane GARTANI**

# Développement du Front avec VueJS

Le site est structuré en trois parties :
- La Landing Page (page vitrine)
- Le menu de l'interface jeu, pour sélectionner le jeu, accéder aux paramètres utilisateurs, etc.
- L'interface en jeu

## Landing Page

La Landing Page est divisée en plusieurs sections : About, Games (pour présenter les différents modes de jeux), et Contact.

### Fonctionnalités développées :
- **Navbar** : Barre de navigation permettant de naviguer entre les sections.
- **Welcome Section** : Section d'accueil avec une présentation générale.
- **About Section** : Section décrivant le projet et l'équipe.
- **Games Section** : Présentation des différents modes de jeux disponibles.
- **Contact Section** : Section de contact située en bas de page (footer).
- **Boutons fonctionnels** : Tous les boutons de la Landing Page sont opérationnels.

![img.png](https://cdn.discordapp.com/attachments/1217073750009184256/1242432727207379065/image.png?ex=664dd125&is=664c7fa5&hm=6421a6ccd95fa7083637d3b40df01cf1463f07bcdec1a89719aee50a455983bf&)
*Preview de la section de bienvenue*

## Interface jeu

L'objectif est de créer une interface de jeu modulable, où seuls les modèles et les textures changent avec une configuration de caméra relative au mode de jeu. 
Pour créer notre scène 3D, nous utilisons ThreeJS, une bibliothèque JavaScript conçue pour la conception d'applications 3D avancées compatibles avec VueJS.

### Fonctionnalités développées :
- **UHD** : Interface utilisateur affichant des statistiques relatives à la partie.
- **Scoreboard** : Tableau affichant la liste des joueurs et leurs statistiques (en cours de développement).
- **Scene 3D universelle** : Scène 3D adaptable à différents jeux.
- **Modèle de partie universelle** : Modèle générique pour les différentes parties.
- **Textures et modèles** : Intégration des textures et modèles spécifiques à chaque jeu.
- **Intégration des modèles de chaque jeu** : Modélisation et intégration des jeux de plateau.
- **Intéractions utilisateurs** : Gestion des interactions de base des utilisateurs.

## Menu de l'Application

Le menu permet aux utilisateurs de sélectionner un jeu et de rejoindre des parties publiques/privées via un système de matchmaking.

### Fonctionnalités développées :
- **Navbar** : Barre de navigation pour le menu.
- **Grille de sélection des jeux** : Interface de sélection des jeux disponibles.
- **Interface réseau social** : Interface pour gérer les amis et les interactions sociales.
- **Système de matchmaking** : Système permettant de trouver des parties avec d'autres joueurs.

L'objectif est de concevoir un menu similaire aux applications mobiles, ergonomique et donnant l'illusion de rester constamment sur la même page.
