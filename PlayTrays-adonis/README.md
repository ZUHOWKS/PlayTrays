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

Adonis est une technologie robuste et puissante pour créer des API REST. Dans le cadre de ce projet, Adonis joue le rôle de chef
d'orchestre ! C’est lui qui gère en arrière-plan toutes les requêtes utilisateurs. En plus de cela, en complément de
l'API Game Server, il est capable de balancer les utilisateurs sur l'un des lobbies des serveurs jeu grâce au processus de
Matchmaking.

Voici la liste des fonctionnalités développées:
- [x] Réseau social. Les utilisateurs peuvent demander en ami !
- [x] Système de groupage pour être lancé dans une même partie.
- [x] Processus de Matchmaking pour matché des utilisateurs recherchant une partie d'un même mode de jeu.

# Documentation

Cette documentation retrace les features developpées pour une future reprise de développement. En effet, Adonis joue un rôle 
majeur dans le fonctionnement de PlayTrays. Il permet de gérer les requêtes utilisateurs, coordiner les serveurs jeu et balancer
les joueurs dans des lobbies. En effet, il est le seul à pouvoir accéder à la base de données. Dans l'état actuel, cela facilite la 
sécurisation de cette dernière et d'éviter la saturation des pulls.

De marnière globale, VueJS réagit avec Adonis afin d'obtenir toutes les données lié à un compte authentifié. Pour lancer une
partie, l'utilisateur démarre une procédure de matchmaking gérer par notre entité centrale (nous reviendrons en détail sur le 
fonctionnement de celui-ci). Une fois matché avec le nombre de personnes requises, les joueurs sont balancés dans le lobby d'un
des serveurs jeu. En partie la main est laissé au lobby.

## Organisation du projet

Ce projet reprend l'agencement imposé par le framework : 
- Dans `app/` nous retrouvons tout ce qui est à l'application, à savoir les modèles, les contrôleurs, les handlers (ou middlewares), 
ainsi que les services.
- `config/` concerne la configuration d'Adonis pour la base de données, le guard...
- `database/` contient les fichiers de migrations de la DB.
- `start/` où les fichiers à l'intérieur de ce dossier sont lancés au démarrage de l'application.

## Base de données.

L'application back-end de PlayTrays a été élaboré sur la base du schéma relationnelle de la DB. En jaune, les tables primaires qui n'ont pas de 
lien avec une clé étrangère. Parmi celle-ci, la table `users` qui est au centre du schéma. Ensuite les tables violettes, qui ont des relations
avec des clés étrangères et en vert, celles qui n'ont que des clés étrangères pour servir d'intermédiaire.

![schema_relationnel_db.png](https://cdn.discordapp.com/attachments/1217073750009184256/1242280181843103744/PlayTrays_Modelisation_DB_1.jpeg?ex=664d4313&is=664bf193&hm=c8b8d88f35b456f9290baa42e60c588a3d5d0b1c313294be89c9bc877b7e0bdf&)

## Système d'authentification

Afin de conserver la session de l'utilisateur, nous utilisons [un système de token](https://docs.adonisjs.com/guides/authentication/access-tokens-guard)
fourni par la librairie d'Adonis. Lorsque l'utilisateur se connecte, un token est mise à jour en base de données. Du côté client,
le token est conservé et utilisé pour être reconnu. Pour la configuration de celui-ci, la documentation d'adonis est disponible [ici](https://docs.adonisjs.com/guides/authentication/access-tokens-guard).

## Amis et Groupage

Les utilisateurs ont la possibilité de s'ajouter en ami et de rejoindre des groupes. Les joueurs d'un même groupe peuvent ainsi rejoindre
une même partie. Un groupe est modélisé par la classe `Group` dans `#models/group.ts`. Un ami est une relation entre les id de deux utilisateurs
et d'un boolean pour savoir s'ils sont amis ou non.

## Socket Adonis

La websocket permet d'avoir une communication bilatérale entre l'application back-end et le client. Authentifié, l'utilisateur est en mesure
d'être synchronisé et de recevoir des évènements serveurs. Cela facilite la synchronisation des joueurs lorsqu'ils sont groupés, dans un matchmaking
ou bien pour obtenir le statu d'activité d'un ami.

## Lobbies et Matchmaking

PlayTrays a développé sa solution en termes de matchmaking. Tout d'abord l'application est en lien avec des serveurs jeu propulsés par notre
propre API Game Server. Elle est constamment en lien avec les serveurs actifs et contrôle la création ainsi que la disposition des lobbies.
Un `Lobby` (`#models/lobby.ts`) est créé en fonction de la répartition de la charge. Plus un `PTServer` (`#models/pt_server.ts`) est chargé, moins il 
accueillera de nouveau lobby.

![schema_simple_infrastructure.png](https://cdn.discordapp.com/attachments/1217073750009184256/1242286803873042463/schema_simplifie_infra.png?ex=664d493e&is=664bf7be&hm=1e1727d67837e2d1df4d8d14cccc41524af96d36fb9db07673f4be7ccdd4b31a&)

Lorsqu’un joueur va être matché avec un autre, un lobby est créé en amont afin de les lancer en partie. Ce processus de balancement sur le serveur jeu où 
le lobby se trouve, est réalisé par Adonis. Grâce à cette solution, les serveurs jeu communiquent l’état des lobbies en temps voulu à notre entité centrale.
