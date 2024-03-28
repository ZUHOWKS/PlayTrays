import {Socket} from "socket.io";
import PTServer from "../PTServer";


export default abstract class PTLobby {
    protected uuid: string;
    protected game: string;
    protected visibility: "public" | "private";
    protected status: "waiting" | "running" | "finished" = "waiting";
    protected sockets: Map<string, Socket>;
    protected server: PTServer;

    protected constructor(uuid: string, game: string, visibility: "public" | "private", server: PTServer) {
        this.uuid = uuid;
        this.game = game;
        this.visibility = visibility;
        this.sockets = new Map<string, Socket>();
        this.server = server;
    }


    /**
     * Enregistrer un socket utilisateur qui a rejoint le lobby.
     *
     * @param socket
     */
    abstract registerNewSocket(socket: Socket): void;

    /**
     * Supprimer le socket d'un utilisateur du lobby
     *
     * @param user
     * @protected
     */
    protected removeSocket(user: string): boolean {
        return this.sockets.delete(user);
    }

    /**
     * Retourner les élèments utiles pour décrire le lobby au format JSON.
     *
     * @return {attribute: Object}
     */
    public getJSON(): {uuid: string, game: string, status: string, visibility: string} {
        return {
            uuid: this.uuid,
            game: this.game,
            status: this.status,
            visibility: this.visibility,
        }
    }

}