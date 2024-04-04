import PTLobby from "../PTLobby";
import {Socket} from "socket.io";
import PTServer from "../../PTServer";
import Pawn from "../../checkers/Pawn";


export default class Checkers extends PTLobby {
    pawns: Pawn[];
    whitePlayer: string | undefined;
    blackPlayer: string | undefined;

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
        for(let i: number=0; i < 12; i++) {
            this.pawns.push(new Pawn("white-" + i, (-21 + ((Math.floor(i/4)+1) % 2) * 6) + (i % 4) * 12, 0,-21 + Math.floor(i/4) * 6)); // nom, position x, position y
        }

        // Setup des pions noirs
        for(let i: number = 0; i < 12; i++) {
            this.pawns.push(new Pawn("black-" + i, (-21 + ((Math.floor(i/4)) % 2) * 6) + (i % 4) * 12, 0, 21 - Math.floor(i/4) * 6)); // nom, position x, position y
        }
    }

    /**
     * Enregistrer un socket utilisateur qui a rejoint le lobby et initialiser tous les évènements lier au lobby.
     *
     * @param socket Socket de l'utilisateur
     */
    registerNewSocket(socket: Socket): void {
        this.sockets.set(socket.data.user, socket);

        socket.join(this.uuid);

        // émettre une update de la partie
        socket.emit("setup game", this.getPawnsJSON(), this.setTeam(socket.data.user));

        // évènement de déconnection du socket
        socket.on("disconnect", (reason, description) => {
            this.removeSocket(socket.data.user);
            console.log("The user " + socket.data.user + " leave the lobby " + this.uuid + ".");
        });


        console.log("The user " + socket.data.user + " join the lobby " + this.uuid + ".")
    }

    private setTeam(user: string): "white" | "black" | "spectator" {
        if (!this.blackPlayer || this.blackPlayer == user) {
            this.blackPlayer = user;
            return "black";
        } else if (!this.whitePlayer || this.whitePlayer == user) {
            this.whitePlayer = user;
            return "white";
        } else {
            return "spectator";
        }
    }

    private getPawnsJSON(): { name: string; x: number; y: number; z: number; dead: boolean; queen: boolean}[] {
        const pawns: { name: string; x: number; y: number; z: number; dead: boolean; queen: boolean}[] = [];

        this.pawns.forEach((pawn) => pawns.push({
            name: pawn.name,
            x: pawn.x,
            y: pawn.y,
            z: pawn.z,
            dead: pawn.dead,
            queen : pawn.queen
        }))

        return pawns;
    }
}