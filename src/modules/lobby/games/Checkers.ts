import PTLobby from "../PTLobby";
import {Socket} from "socket.io";
import PTServer from "../../PTServer";
import Pawn from "../../checkers/Pawn";


export default class Checkers extends PTLobby {
    pawns: Pawn[];
    whitePlayer: string | undefined;
    blackPlayer: string | undefined;
    whoPlay: "black" | "white" = "black";

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
        const userTeam = this.setTeam(socket.data.user);
        socket.emit("setup game", this.getPawnsJSON(), {team: userTeam, canPlay: this.whoPlay == userTeam});

        // évènement de déconnection du socket
        socket.on("disconnect", () => {
            this.removeSocket(socket.data.user);
            console.log("The user " + socket.data.user + " leave the lobby " + this.uuid + ".");
        });

        socket.on("pawn action", (action: {
            pawn: string,
            moveX: number,
            moveY: number,
            moveZ: number,
        }, callback) => {
            const result: string | undefined = this.pawnMoveAction(action, socket);
            const userTeam = this.getTeam(socket.data.user);
            if (!result) {
                return callback("Error: can't perform this action !", {pawns: this.getPawnsJSON(), team: userTeam, canPlay: this.whoPlay == userTeam});
                //socket.emit("rollback game", this.getPawnsJSON())
            } else {

                return callback("", {pawnKilled: result == action.pawn ? undefined : result, team: userTeam, canPlay: this.whoPlay == userTeam});
            }

        })

        console.log("The user " + socket.data.user + " join the lobby " + this.uuid + ".")
    }

    /**
     * Place le joueur dans une équipe.
     *
     * @param user nom de l'utilisateur
     * @private
     */
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

    private getTeam(user: string): "white" | "black" | "spectator" {
        if (this.blackPlayer == user) {
            return "black";
        } else if (this.whitePlayer == user) {
            return "white";
        } else {
            return "spectator";
        }
    }

    private pawnMoveAction(action: { pawn: string, moveX: number, moveY: number, moveZ: number, }, socket: Socket): string | undefined {
        const pawn: Pawn | undefined = this.getPawn(action.pawn);
        if (this.getTeam(socket.data.user) == this.whoPlay && Math.abs(action.moveX) <= 21 && Math.abs(action.moveZ) <= 21) {
            if (pawn) {
                if (Math.abs(action.moveY - pawn.y) == 0 && pawn.name.includes(this.getTeam(socket.data.user))) {
                    const pos: {x: number, y: number, z: number} = {x: action.moveX, y: action.moveY, z: action.moveZ};

                    const xDiff: number = action.moveX - pawn.x;
                    const zDiff: number = action.moveZ - pawn.z;

                    if (Math.abs(xDiff) == 6 && Math.abs(zDiff) == 6) {
                        if (!this.anyPawnAt(pos)) {
                            this.whoPlay = this.getTeam(socket.data.user) == "black" ? "white" : "black"
                            pawn.setPosition(pos);
                            this.emitWithout( socket, "pawn action", action, undefined)
                            return pawn.name;
                        }
                    } else if (Math.abs(xDiff) == 12 && Math.abs(zDiff) == 12) {
                        const pawnToKill: Pawn | undefined = this.anyPawnAt({x: pos.x + (xDiff < 0 ? 1 : -1) * 6, y: pos.y, z: pos.z + (zDiff < 0 ? 1 : -1) * 6});
                        if (pawnToKill) {
                            if (!pawnToKill.name.includes(pawn.name.split("-")[0])) {
                                if (!this.anyPawnAt(pos)) {
                                    this.whoPlay = this.getTeam(socket.data.user) == "black" ? "white" : "black"
                                    pawn.setPosition(pos);
                                    pawnToKill.dead = true;
                                    this.emitWithout( socket, "pawn action", action, pawnToKill.name)
                                    return pawnToKill.name;
                                }
                            }
                        }
                    }
                }
            }
        }

        return undefined;

    }

    /**
     * Renvoie le pion du nom donné.
     *
     * @param name nom du pion recherché
     * @return le pion, sinon undenfined
     * @private
     */
    private getPawn(name: string): Pawn | undefined {

        for (let i: number = 0; i < this.pawns.length; i++) {
            const pawn: Pawn = this.pawns[i];
            if (pawn.name == name) {
                return pawn;
            }
        }

        return;
    }

    /**
     * Renvoie le pion trouvé à une localisation donnée.
     *
     * @param pos Localisation
     * @return Le pion trouvé à la localisation donnée, sinon undefined.
     * @private
     */
    private anyPawnAt(pos: {x: number; y: number; z: number}): Pawn | undefined {

        for (let i:number = 0; i < this.pawns.length; i++) {
            const pawn: Pawn = this.pawns[i];

            if (pawn.x == pos.x && pawn.y == pos.y && pawn.z == pos.z && !(pawn.dead)) {
                return pawn;
            }
        }

        return;
    }

    /**
     * Obtenir la liste des pions ainis que leurs attributs au format JSON.
     *
     * @private
     */
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


    emitWithout(socketNotEmit: Socket, event: string, ...args: any[]) {
        const socketArray: Socket[] = Array.from(this.sockets.values());
        socketArray.forEach((socket) => {
            if (socket.data.user != socketNotEmit.data.user) {
                const userTeam = this.getTeam(socket.data.user)
                socket.emit(event, ...args, {team: userTeam, canPlay: this.whoPlay == userTeam});
            }
        })
    }
}