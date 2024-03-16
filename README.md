# PlayTrays

L'objectif est de développer une application de jeux sur plateau en reproduisant certains jeux existant.

# Développement du Front avec VueJS

Le site sera construit en 3 parties:
- La Landing Page (page vitrine)
- Le menu de l'interface jeu, pour sélectionner le jeu, accèder aux paramètres utilisateurs, etc
- L'interface en jeu

La première partie du développement s'accera sur la conception de la landing page. Ensuite nous
procéderons à réalisation de l'interface en jeu avec une interface du menu provisoire. Nous finaliserons
le site sur l'interface du menu de l'application, avec des fonctionnalités bonus: paramètre du compte, 
profil utilisateur, cosmetique.


![img.png](readmeimg/img.png)
*Preview de la section de bienvenue*


## Landing Page

La Landing Page sera découpé en plusieurs sections: About, Games (pour présenter les différents modes de
jeux), Contact.

**_État d'avancement:_**
- [ ] Navbar
- [ ] Welcome Section
- [ ] About Section
- [ ] Games Section
- [ ] Contact Section (en foot page)
- [ ] Rendre fonctionnelle les boutons

## Interface jeu

Le but est de créer une interface jeu modulable, où seul les modèles et les textures changent avec une 
configuration de caméra relative au mode de jeu. Pour créer notre scène 3D nous utiliserons ThreeJS, une
bibliothèque JavaScript conçu pour la conception d'application 3D avancé compatible avec VueJS.

Nous aurons l'occasion de modéliser quelques jeux de plateau de manière à ce que celle-ci soit utilisable
et intégrable à la partie back-end.

Certains élèments seront communs aux différents modes de jeux tel que l'UHD affichant des statistiques
relatives à la partie ou encore le scoreboard (affichant la liste des joueurs ainsi que leur stat). Aussi,
certaines choses devront être pensées de manière universelle par exemple les intéractions utilisateurs de bases
seront définies pour des touches spécifiques.

**_État d'avancement:_**
- [ ] UHD
- [ ] Scoreboard
- [ ] Scene 3D universelle
- [ ] Modèle de partie universelle
- [ ] Textures et modèles
- [ ] Intégration du modèle de chacun des jeux
- [ ] Intéractions utilisateurs

## Menu de l'Application

Le menu permet aux utilisateurs de sélectionner un jeu, créer des parties, rejoindre des parties public/privées ou via
un système de matchmaking.

Le but est de concevoir un Menu similaire aux applications mobiles, ergonomique et donnant l'illusion de rester constament
sur la même page.

**_État d'avancement:_**
- [ ] Navbar
- [ ] Grille de sélection des jeux
- [ ] Interface liste des parties public
- [ ] Formulaire partie privée


# VueJS

## Recommended IDE Setup (VueJS Info)

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration (VueJS Info)

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Command

### Compile et Hot-reload pour un rendu en temps réel

```sh
npm run dev
```

### Pour Compiler l'app

```sh
npm run build
```
