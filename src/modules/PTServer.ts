import {Server, Socket} from "socket.io";
import PTLobby from "./lobby/PTLobby";
import Checkers from "./lobby/games/Checkers";
import {Axios} from "../services";

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

/**
 * Cette classe permet d'instancier un serveur jeu PlayTrays pour créer un lobby et gérer
 * le lobby en jeu.
 */
export default class PTServer {
    io: Server;
    lobbies: Map<string, PTLobby>;
    capacity: number;
    games: Map<string, any> = new Map<string, PTLobby>();

    constructor(httpServer: any, lobbyMax: number) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
            }
        });
        this.lobbies = new Map<string, PTLobby>();
        this.capacity = lobbyMax;


    }

    /**
     * Initialiser le serveur
     */
    init(): void {
        this.initGames();
        this.initWebSocketServer();
    }

    /**
     * Initialiser les jeux jouables sur le lobby.
     * @private
     */
    private initGames(): void {
        this.games.set("checkers", Checkers);
    }

    /**
     * Initialiser le middleware et les évènements serveur
     * @private
     */
    private initWebSocketServer(): void {
        this.io.use(async (socket, next) => await this.middleware(socket, next));
        this.io.on("connection", (socket) => {
            if (socket.data.authType == "server") {
                this.setupServerEvents(socket);
            } else if (socket.data.authType == "user") {
                const lobby: PTLobby | undefined = this.lobbies.get(socket.data.lobbyUUID);

                if (lobby) {
                    lobby.registerNewSocket(socket);
                } else {
                    socket.disconnect();
                }

            } else {
                socket.disconnect();
            }
        })
        this.io.listen(25525);

        // Manifester la présence du serveur jeu auprès de l'app
        Axios.post('/server/manifest').then();
    }

    /**
     * Middleware d'authentification (serveur & utilisateur).
     *
     * @param socket Socket du serveur ou de l'utilisateur communicant avec le serveur
     * @param next Fonction qui permet de passer au middleware suivant s'il n'y a rien
     * en, sinon la communication est interrompue.
     * @private
     */
    private async middleware(socket: any, next: any): Promise<void> {
        const auth = socket.handshake.auth;
        if (auth) {
            if (await this.isServerAuthentificationValid(auth)) {
                socket.data = {};
                socket.data.authType = "server";
                return next();
            } else if(await this.isUserAuthentificationValid(auth)) {
                socket.data = {};
                socket.data.authType = "user";
                socket.data.user = auth.user;
                socket.data.token = auth.token;
                socket.data.lobbyUUID = auth.lobbyUUID;
                return next();
            } else {
                console.log("middleware: authentification invalid");
            }
        }

        return next(new Error("unauthorized"));

    }

    /**
     * Détermine si l'authentification de type serveur est valide.
     *
     * @param auth Données d'authentification
     * @return boolean
     * @private
     */
    private async isServerAuthentificationValid(auth: any): Promise<boolean> {
        try {
            const authServerData: AuthServerData = auth as AuthServerData;
            if (authServerData.identifier == process.env.SERVER_IDENTIFIER && authServerData.token == process.env.SERVER_TOKEN) {
                return true;
            }
        } catch (e) {
            console.error(e);
        }

        return false;
    }

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
            if (authUserData.user && authUserData.token && authUserData.lobbyUUID) {
                const formData = new FormData();
                formData.append('lobbyUUID', authUserData.lobbyUUID);
                const response = await Axios.post('/server/legit-user', formData,{
                    headers: {
                        Authorization: `Bearer ${authUserData.token}`,
                    },
                });

                return response.status == 200;
            }
        } catch (e) {
            console.error(e);
        }

        return false;
    }

    /**
     * Mettre en place les évènements pour le socket de type serveur.
     *
     * @param socket Socket du serveur connecté au serveur jeu
     * @private
     */
    private setupServerEvents(socket: Socket) {
        socket.join("adonis");

        socket.on("create lobby", (uuid: string, game: string, visibility: string,  callback) => {
            console.log("Setup lobby request...")
            if ((visibility === "public" || visibility === "private") && this.games.get(game) && uuid && this.lobbies.size < this.capacity) {
                this.createLobby(uuid, game, visibility);
                console.log("Lobby ", uuid, " setup !")
                const response = {
                    status: 200,
                    lobbies: this.getLobbiesList()
                };

                return callback(undefined, response);
            } else {
                return callback("Failed authentification", {status: "Failed"});
            }
        });

        socket.emit("update", this.capacity, this.getLobbiesList());

    }

    /**
     * Créer un lobby.
     *
     * @param uuid Identifiant unique du lobby
     * @param game Jeu du lobby
     * @param visibility Visibilité du lobby
     * @private
     */
    public createLobby(uuid: string, game: string, visibility: string) {
        this.lobbies.set(uuid, new (this.games.get(game))(uuid, game, visibility, this));
    }

    /**
     * Obtenir la liste sous format JSON des lobbies.
     *
     * @private
     * @return Array
     */
    private getLobbiesList(): {uuid: string, game: string, status: 'waiting' | 'running' | 'finished', visibility: 'public' | 'private'}[] {
        const lobbies: { uuid: string, game: string, status: 'waiting' | 'running' | 'finished', visibility: 'public' | 'private' }[] = [];
        Array.from(this.lobbies.values()).forEach((lobby: PTLobby) => lobbies.push(lobby.getJSON()));
        return lobbies;
    }
}