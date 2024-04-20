import PTLobby from "../PTLobby";
import {Socket} from "socket.io";
import PTServer from "../../PTServer";
import Pawn from "../../checkers/Pawn";

interface Action {
    pawn: string;
    moveX: number;
    moveY: number;
    moveZ: number;
    pawnKilled: string | undefined;
}

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
            const result: Action[] = this.pawnMoveAction(action as Action, socket);
            const userTeam = this.getTeam(socket.data.user);
            if (result.length == 0) {
                return callback("Error: can't perform this action !", {pawns: this.getPawnsJSON(), team: userTeam, canPlay: this.whoPlay == userTeam});
            } else {
                return callback("", {actions: result, team: userTeam, canPlay: this.whoPlay == userTeam});
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

    /**
     * Obtenir l'équipe du joueur donné.
     *
     * @param user id de l'utilisateur
     * @private
     */
    private getTeam(user: string): "white" | "black" | "spectator" {
        if (this.blackPlayer == user) {
            return "black";
        } else if (this.whitePlayer == user) {
            return "white";
        } else {
            return "spectator";
        }
    }

    /**
     * Permet de vérifié la cohérence des mouvements d'un pion (anti-cheat) et de les exécuter
     * si les conditions de jouabilité sont réunis.
     *
     * @param action action du pion
     * @param socket socket du l'utilisateur responsable de l'action
     * @private
     */
    private pawnMoveAction(action: Action, socket: Socket): Action[] {
        let actions: Action[] = [action];
        const pawn: Pawn | undefined = this.getPawn(action.pawn);

        // si c'est le tour du joueur et que le pion n'est pas joué en dehors du plateau
        if (pawn && this.getTeam(socket.data.user) == this.whoPlay && Math.abs(action.moveX) <= 21 && Math.abs(action.moveZ) <= 21) {
            // si le pion existe

            // vérifie que le pion est de l'équipe du joueur et qu'il reste sur le plateau
            if (Math.abs(action.moveY - pawn.y) == 0 && pawn.name.includes(this.getTeam(socket.data.user))) {
                const pos: { x: number, y: number, z: number } = {x: action.moveX, y: action.moveY, z: action.moveZ};

                const xDiff: number = action.moveX - pawn.x;
                const zDiff: number = action.moveZ - pawn.z;


                if (pawn.queen) {
                    if (!this.anyPawnAt(pos)) {
                        for(let i: number = Math.floor(Math.max(Math.abs(xDiff), Math.abs(zDiff))/6); i > 1; i--) {
                            //TODO: Checker les actions de la reine
                        }
                    }
                } else {
                    // si il s'agit d'un déplacement d'une case
                    if (Math.abs(xDiff) == 6 && Math.abs(zDiff) == 6) {
                        if (!this.anyPawnAt(pos)) {
                            this.whoPlay = this.getTeam(socket.data.user) == "black" ? "white" : "black"
                            pawn.setPosition(pos);

                            this.emitWithout(socket, "pawn action", actions)
                            return actions;
                        }

                        // s'il s'agit d'une prise
                    } else if (Math.abs(xDiff) == 12 && Math.abs(zDiff) == 12) {
                        const pawnToKill: Pawn | undefined = this.anyPawnAt({
                            x: pos.x + (xDiff < 0 ? 1 : -1) * 6,
                            y: pos.y,
                            z: pos.z + (zDiff < 0 ? 1 : -1) * 6
                        });

                        if (pawnToKill) {
                            if (!pawnToKill.name.includes(pawn.name.split("-")[0]) && !pawnToKill.dead) {
                                if (!this.anyPawnAt(pos)) {
                                    actions[0].pawnKilled = pawnToKill.name;

                                    console.log("ACTION 0 §§§§ >>>> ", actions[0]);
                                    this.whoPlay = this.getTeam(socket.data.user) == "black" ? "white" : "black"

                                    actions = this.obligatoryKill(pawn, pos, actions);

                                    const lastAction: Action = actions[actions.length - 1];
                                    pawn.setPosition({x: lastAction.moveX, y: lastAction.moveY, z: lastAction.moveZ});

                                    actions.forEach((action) => {
                                        // @ts-ignore
                                        this.getPawn(action.pawnKilled)?.dead = true; // l'action comporte toujours un pion tué
                                    })

                                    console.log("Actions envoyées => ", actions);
                                    this.emitWithout(socket, "pawn action", actions)
                                    return actions;
                                }
                            }
                        }
                    }
                }

            }
        }

        return [];
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
     * Selon la régle du jeu des dames de la prise obligatoire maximale, détermine la liste
     * des actions à effectuer.
     *
     * @param pawn
     * @param pos
     * @private
     */
    private obligatoryKill(pawn: Pawn, pos: {x: number; y: number; z: number}, lastActions: Action[]): Action[] {
        let actions: Action[] = lastActions;

        for (let i: number = -1; i <= 1; i+=2) {
            const pasZ = i * 6;
            for (let j: number = -1; j <= 1; j+=2) {
                const pasX = j * 6;

                let x: number = pos.x + pasX;
                let z: number = pos.z + pasZ;

                const pawnToKill: Pawn | undefined = this.anyPawnAt({x: x, y: pos.y, z: z});

                if (pawnToKill && !(pawnToKill.name.includes(pawn.name.split("-")[0])) && !pawnToKill.dead && !this.pawnWasKilledInActions(pawnToKill, lastActions)) {

                    x+=pasX;
                    z+=pasZ;

                    if (Math.abs(x) <= 21 && Math.abs(x) <= 21 && !this.anyPawnAt({x: x, y: pos.y, z: z})) {
                        let _actions: Action[] = lastActions;
                        _actions.push({
                            pawn: pawn.name,
                            moveX: x,
                            moveY: pos.y,
                            moveZ: z,
                            pawnKilled: pawnToKill.name
                        } as Action);

                        console.log("DEBUG ObligatoryKill: Action temp possible => ", {
                            pawn: pawn.name,
                            moveX: x,
                            moveY: pos.y,
                            moveZ: z,
                            pawnKilled: pawnToKill.name
                        } as Action);

                        _actions.concat(this.obligatoryKill(pawn, {x: x, y: pos.y, z: z}, _actions));

                        if (_actions.length > actions.length) {
                            actions = _actions;
                        }
                    }

                }
            }
        }

        return actions;
    }

    private pawnWasKilledInActions(pawn: Pawn, actions: Action[]): boolean {

        for(let i: number = 0; i < actions.length; i++) {
            if (actions[i].pawnKilled?.includes(pawn.name)) {
                return true;
            }
        }

        return false;
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