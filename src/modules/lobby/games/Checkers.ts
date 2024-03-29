import PTLobby from "../PTLobby";
import {Socket} from "socket.io";
import PTServer from "../../PTServer";
import Pawn from "../../checkers/Pawn";


export default class Checkers extends PTLobby {
    pawns: Pawn[];

    /**
     * Permet d'instancier un lobby pour le jeu des dames.
     *
     * @param uuid Identifiant unique du lobby
     * @param game Jeu du lobby
     * @param visibility Visibilité du lobby
     * @param server Instance du serveur jeu
     */
    constructor(uuid: string, game: string, visibility: "public" | "private", server: PTServer) {
        super(uuid, game, visibility, server);
        this.pawns = [];
        this.setupGame();
    }

    /**
     * Setup les élèments du jeu.
     *
     * @private
     */
    protected setupGame(): void {

        // Setup des pions blancs
        for(let i: number=0; i < 8; i++) {
            this.pawns.push(new Pawn("white-" + i, i, i % 2)); // nom, position x, position y
        }

        // Setup des pions noirs
        for(let i: number = 0; i < 8; i++) {
            this.pawns.push(new Pawn("black-" + i, i, 7 - (i % 2))); // nom, position x, position y
        }
    }

    /**
     * Enregistrer un socket utilisateur qui a rejoint le lobby et initialiser tous les évènements lier au lobby.
     *
     * @param socket Socket de l'utilisateur
     */
    registerNewSocket(socket: Socket): void {
        socket.join(this.uuid);

        // émettre une update de la partie
        socket.emit("update game", this.getPawnsJSON());

        // évènement de déconnection du socket
        socket.on('disconnect', (user) => {
            this.removeSocket(user);
            console.log("The user " + socket.data.user + " leave the lobby " + this.uuid + ".")
        });



        console.log("The user " + socket.data.user + " join the lobby " + this.uuid + ".")
    }

    private getPawnsJSON(): { name: string; x: number; y: number; dead: boolean; }[] {
        const pawns: { name: string; x: number; y: number; dead: boolean; }[] = [];

        this.pawns.forEach((pawn) => pawns.push({
            name: pawn.name,
            x: pawn.x,
            y: pawn.y,
            dead: pawn.dead
        }))

        return pawns;
    }
}