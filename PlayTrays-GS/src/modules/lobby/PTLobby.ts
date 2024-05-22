import {Socket} from "socket.io";
import PTServer from "../PTServer";

/**
 * Permet d'instancier un lobby
 */
export default abstract class PTLobby {
    protected uuid: string;
    protected game: string;
    protected visibility: "public" | "private";
    protected status: "waiting" | "running" | "finished" = "waiting";
    protected sockets: Map<number, Socket>;
    protected server: PTServer;
    protected helpTimeout: NodeJS.Timeout | undefined;

    /**
     * Permet d'instancier un lobby.
     *
     * @param uuid Identifiant unique du lobby
     * @param game Jeu du lobby
     * @param visibility Visibilité du lobby
     * @param server Instance du serveur jeu
     * @protected
     */
    protected constructor(uuid: string, game: string, visibility: "public" | "private", server: PTServer) {
        this.uuid = uuid;
        this.game = game;
        this.visibility = visibility;
        this.sockets = new Map<number, Socket>();
        this.server = server;
    }

    /**
     * Setup les élèments du jeu.
     *
     * @private
     */
    protected abstract setupGame(): void;

    /**
     * Enregistrer un socket utilisateur qui a rejoint le lobby et initialiser tous les évènements lier au lobby.
     *
     * @param socket Socket de l'utilisateur
     */
    abstract registerNewSocket(socket: Socket): void;

    /**
     * Supprimer le socket d'un utilisateur du lobby
     *
     * @param user
     * @protected
     */
    protected removeSocket(user: number): boolean {
        return this.sockets.delete(user);
    }

    /**
     * Émettre sur tous les sockets clients du lobby sauf celui passé en paramètre.
     *
     * @param socketNotEmit socket client où l'on ne veut pas émettre l'évènement.
     * @param event évènement à émettre
     * @param args arguments de l'évènement
     */
    emitWithout(socketNotEmit: Socket, event: string, ...args: any[]) {
        const socketArray: Socket[] = Array.from(this.sockets.values());
        socketArray.forEach((socket) => {
            if (socket.data.user != socketNotEmit.data.user) {
                socket.emit(event, ...args);
            }
        })
    }

    /**
     * Retourner les élèments utiles pour décrire le lobby au format JSON.
     *
     * @return {attribute: Object}
     */
    public getJSON(): {uuid: string, game: string, status: 'waiting' | 'running' | 'finished', visibility: 'public' | 'private'} {
        return {
            uuid: this.uuid,
            game: this.game,
            status: this.status,
            visibility: this.visibility,
        }
    }

    /**
     * Obtenir le status du lobby
     */
    public getStatus(): "waiting" | "running" | "finished" {
        return this.status
    }

    /**
     * Push le nouveau status du lobby à Adonis
     *
     * @param newStatus
     */
    public pushStatus(newStatus: "waiting" | "running" | "finished"): void {
        this.status = newStatus;
        this.server.io.to('adonis').emit('lobby_status', this.uuid, this.status);
    }

    /**
     * Activer l'anti lobby vide
     */
    public activeAntiEmptyLobby(): void {
        this.helpTimeout = setTimeout(() => {
            this.pushStatus('finished');
            this.server.io.to(this.uuid).disconnectSockets();
        }, 30000)
    }

    /**
     * Désactiver l'anti lobby vide
     */
    public disableAntiEmptyLobby(): void {
        clearTimeout(this.helpTimeout)
    }
}