# PlayTrays

L'objectif est de développer une application de jeux sur plateau, ergonomique, moderne et ouverte à tout type 
de public.

## Crédits

Ce projet a été développé dans le cadre de notre cursus **préparatoire aux écoles d'ingénieurs de Polytech** en partenariat
avec l'**Université Savoie Mont Blanc** et est encadré par **Flavien VERNIER**.

L'application a été développée par :
- **Joris VILARDELL** (aka ZUHOWKS)
- **Mathias HELLAL** (aka Majurax)
- **Mathilde VARAGNAT**
- **Othmane GARTANI**

# Développement des serveurs jeux

Afin d'offrir la possibilité à notre architecture serveur de scale up vers des solutions plus poussées, l'API suivante
nous permettra d'instancier un serveur de jeu PlayTrays qui aura pour mission de gérer les parties en jeu des joueurs.

# Documentation API

L'API **Game Server** permet à un serveur Node.js d'instancier un websocket tout en contrôlant plusieurs lobbies à la
fois. Le serveur peut-être contrôler à distance via une authentification de type serveur pour créer/supprimer/obtenir 
les lobbies. Les authentifications utilisateurs elles permettent seulement d'être redirigé vers un lobbie dans le but
de communiquer avec ce dernier.

## Création d'un serveur jeu

L'API offre à disposition différentes classes simplistes d'utilisation. Commençons par la classe `PTServer`: elle est
à l'origine même de la création du websocket server (Lib Socket.io) offrant une communication bilatérale entre client
et serveur. On commence par instancier un serveur depuis le module "http" afin de le passer en paramètre au niveau du
constructeur de PTServer, le second paramètre étant le nombre de lobbies au maximum.

```typescript
// dans le fichier src/server.ts 

import PTServer from "./modules/PTServer";
import { createServer } from "http";

require('dotenv').config();

const httpServer = createServer();
const gServer: PTServer = new PTServer(httpServer, 10);
httpServer.listen(25526)
gServer.init();
```
Dans cet exemple, on écoute le serveur sur le port 25526. Enfin on initialise le game server via la méthode `init()`.

De cette manière nous venons d'instancier un serveur jeu. Pour s'y connecter deux possibilités:
- Authentification de type serveur. Permet d'avoir un contrôle sur le serveur jeu tel que la supression/creation/obtiention des lobbies
- Authentification de type utilisateur. Via celle-ci, on ne se connecte non pas au serveur mais à un lobby spécifique du serveur.
```typescript
// dans src/PTServer.ts
/**
 * Permet de modéliser les données d'authentification serveur
 */
interface AuthServerData {
    identifier: string;
    token: string;
}

/**
 * Permet de modéliser les données d'authentification utilisateur
 */
interface AuthUserData {
    user: number;
    token: string;
    lobbyUUID: string;
}
```

Lorsque le client se connecte, ses informations de connexion passe par le middleware du serveur. Pour l'authentification
serveur, les crédances sont comparés aux variables d'environnements du fichier dans le dossier racine `./.env`. Pour 
un utilisateur, le serveur vérifie avec le serveur adonis authentifié si son token est valable et qu'il est autorisé
à se connecter au lobby:

```typescript
export class PTServer {
    
    //... code de la classe
    
    /**
     * Détermine si l'authentification de type utilisateur est valide.
     *
     * @param auth Données d'authentification
     * @return boolean
     * @private
     */
    private async isUserAuthentificationValid(auth: any): Promise<boolean> {
        try {
            const authUserData: AuthUserData = auth as AuthUserData;

            if (authUserData.user && authUserData.token && authUserData.lobbyUUID && this.lobbies.get(authUserData.lobbyUUID) && this.lobbies.get(authUserData.lobbyUUID)?.getStatus() != 'finished') {
                
                const formData = new FormData();
                formData.append('userID', authUserData.user+"");
                formData.append('userToken', authUserData.token);
                formData.append('lobbyUUID', authUserData.lobbyUUID);
                // Axios configuration >> src/services.ts
                const response = (await Axios.post('/server/legit-user', formData)); 

                return response.status == 200;
                // Pour passer cette étape de conformitée, commenter et mettre:
                //return true;
            }
        } catch (e) {
            console.error(e);
        }

        return false;
    }

    //... code de la classe
}
