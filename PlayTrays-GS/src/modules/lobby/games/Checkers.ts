import PTLobby from "../PTLobby";
import {Socket} from "socket.io";
import PTServer from "../../PTServer";
import Pawn from "../../checkers/Pawn";
import {Vec3, VecHelp} from "../../utils/Vectors";
import {Axios} from "../../../services";

interface Action {
    pawn: string;
    queen: boolean;
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
    actualTimer: number = 120;

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
        socket.emit("setup game", this.getPawnsJSON(), {team: userTeam, canPlay: false, timer: this.actualTimer}, (error: any, response: any) => {
            if (!error && response.loaded) {
                if (this.status === 'waiting') {
                    if (this.whitePlayer && this.blackPlayer) {
                        this.pushStatus('running');
                        this.disableAntiEmptyLobby();

                        this.getUsernames().then((users) => {
                            Array.from(this.sockets.values()).forEach((_socket) => {
                                const _userTeam = this.getTeam(_socket.data.user)

                                _socket.emit('start', {team: _userTeam, canPlay: this.whoPlay == _userTeam, timer: this.actualTimer}, users)
                            })
                        });


                        const intervalID = setInterval(() => {
                            if (this.status === 'finished') clearInterval(intervalID);

                            if (this.actualTimer == 0) {
                                this.actualTimer = 90;
                                this.whoPlay = this.whoPlay == "black" ? "white" : "black";

                                this.emitWithout(null, 'pawn action', []);
                                this.checkEndGame();
                            } else {
                                this.actualTimer-=1;
                            }

                            this.server.io.to(this.uuid).emit('timer', this.actualTimer);
                        }, 1000)
                    } else {
                        this.activeAntiEmptyLobby();
                    }
                } else if (this.status === 'running') {
                    this.getUsernames().then((users) => socket.emit('start', {team: userTeam, canPlay: this.whoPlay == userTeam, timer: this.actualTimer}, users))
                }
            }
        });

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
            const userTeam = this.getTeam(socket.data.user);
            if (this.status === 'running') {
                const result: Action[] = this.pawnMoveAction(action as Action, socket);
                if (result.length > 0) {
                    if (action.moveX != result[0].moveX || action.moveY != result[0].moveY || action.moveZ != result[0].moveZ) {
                        callback("Error: can't perform this action !", {team: userTeam, canPlay: this.whoPlay == userTeam, rollback: false});
                        return socket.emit("pawn action", result, {team: userTeam, canPlay: this.whoPlay == userTeam, timer: this.actualTimer});
                    } else {
                        return callback(undefined, {actions: result, team: userTeam, canPlay: this.whoPlay == userTeam, replay: action.pawn, timer: this.actualTimer});
                    }
                }
            }

            return callback("Error: can't perform this action !", {pawns: this.getPawnsJSON(), team: userTeam, canPlay: this.whoPlay == userTeam, rollback: true});
        })
        //TODO:Timeout de setup de party -> si la party ne se lance pas au bout de 30 secondes, déconnecter tout le monde + fermer le lobby

        socket.on('leave party', (callback) => {
            if (this.status != "finished") this.endGame((userTeam == 'black' ? 'white' : 'black'));
            callback(undefined, {status: 200});
        })

        console.log("The user " + socket.data.user + " join the lobby " + this.uuid + ".")
    }

    /**
     *
     * Get usernames of players.
     *
     * @private
     */
    private async getUsernames(): Promise<string[]> {
        const form1 = new FormData();
        const users: string[] = []

        // @ts-ignore
        form1.append('userID', parseInt(this.blackPlayer));
        users.push((await Axios.post('/server/user-info', form1)).data.username);

        const form2 = new FormData();

        // @ts-ignore
        form2.append('userID', parseInt(this.whitePlayer));
        users.push((await Axios.post('/server/user-info', form2)).data.username)

        return users
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
                let pos: Vec3 = {x: action.moveX, y: action.moveY, z: action.moveZ};

                const xDiff: number = action.moveX - pawn.x;
                const zDiff: number = action.moveZ - pawn.z;


                if (pawn.queen) {

                    if (!this.anyPawnAt(pos)) {

                        // check legit action
                        let pawnToKill: Pawn | undefined;
                        // on parcours le chemin de l'origine jusqu'à la position du mouvement
                        for(let i: number = Math.floor(Math.max(Math.abs(xDiff), Math.abs(zDiff))/6) - 1; i > 0; i--) {
                            pawnToKill = this.anyPawnAt({
                                x: pos.x + (xDiff < 0 ? i : -i) * 6,
                                y: pos.y,
                                z: pos.z + (zDiff < 0 ? i : -i) * 6
                            });

                            if (pawnToKill && !pawnToKill.dead) {
                                break; // le chemin serra interrompu dans tous les cas (règle de la prise maximale obligatoire ou abort move)
                            } else {
                                pawnToKill = undefined;
                            }
                        }

                        if (pawnToKill) {

                            if (!pawnToKill.name.includes(pawn.name.split("-")[0]) && !pawnToKill.dead) {
                                var killPos: Vec3 = {
                                    x: pawnToKill.x + (xDiff > 0 ? 1 : -1) * 6,
                                    y: pawnToKill.y,
                                    z: pawnToKill.z + (zDiff > 0 ? 1 : -1) * 6
                                }

                                if (!this.anyPawnAt(killPos)) {
                                    while (!(this.anyPawnAt(killPos) || VecHelp.equal(killPos, pos) || Math.abs(killPos.x) >= 21 && Math.abs(killPos.z) >= 21)) {
                                        killPos = {
                                            x: killPos.x + (xDiff > 0 ? 1 : -1) * 6,
                                            y: killPos.y,
                                            z: killPos.z + (zDiff > 0 ? 1 : -1) * 6
                                        }
                                    }

                                    actions[0].moveX = killPos.x;
                                    actions[0].moveY = killPos.y;
                                    actions[0].moveZ = killPos.z;
                                    actions[0].pawnKilled = pawnToKill.name;

                                    pawn.setPosition(killPos);

                                    actions.forEach((action) => {
                                        // @ts-ignore
                                        const pawnToKill = this.getPawn(action.pawnKilled);
                                        if (pawnToKill) {
                                            pawnToKill.dead = true;
                                        }
                                    })
                                    this.actualTimer = 90;
                                    this.emitWithout(socket, "pawn action", actions);
                                    this.checkEndGame();
                                    return actions;
                                }

                            }
                        } else {
                            this.whoPlay = this.getTeam(socket.data.user) == "black" ? "white" : "black";
                            pawn.setPosition(pos);
                            this.actualTimer = 90;
                            this.emitWithout(socket, "pawn action", actions);
                            this.checkEndGame();
                            return actions;
                        }
                    }
                } else {
                    // si il s'agit d'un déplacement d'une case
                    if (Math.abs(xDiff) == 6 && Math.abs(zDiff) == 6) {
                        if (!this.anyPawnAt(pos)) {
                            this.whoPlay = this.getTeam(socket.data.user) == "black" ? "white" : "black"
                            pawn.setPosition(pos);

                            if (pawn.queen) {
                                actions[0].queen = true;
                            }
                            this.actualTimer = 90;
                            this.emitWithout(socket, "pawn action", actions);
                            this.checkEndGame();
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

                                    this.whoPlay = this.getTeam(socket.data.user) == "black" ? "white" : "black"

                                    actions = this.obligatoryKill(pawn, pos, actions);

                                    const lastAction: Action = actions[actions.length - 1];
                                    pawn.setPosition({x: lastAction.moveX, y: lastAction.moveY, z: lastAction.moveZ});

                                    actions.forEach((action) => {
                                        // @ts-ignore
                                        const pawnToKill = this.getPawn(action.pawnKilled);
                                        if (pawnToKill) {
                                            pawnToKill.dead = true;
                                        }
                                    })

                                    if (pawn.queen) {
                                        actions[actions.length - 1].queen = true;
                                    }

                                    this.actualTimer = 90;
                                    this.emitWithout(socket, "pawn action", actions);
                                    this.checkEndGame();
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
    private anyPawnAt(pos: Vec3): Pawn | undefined {

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
     * @param pawn pion responsable
     * @param pos position du pion
     * @param lastActions actions déjà effectuées
     * @private
     */
    private obligatoryKill(pawn: Pawn, pos: {x: number; y: number; z: number}, lastActions: Action[]): Action[] {
        let actions: Action[] = [];

        for (let i: number = -1; i <= 1; i += 2) {
            const pasZ = i * 6;
            for (let j: number = -1; j <= 1; j += 2) {
                const pasX = j * 6;

                let x: number = pos.x + pasX;
                let z: number = pos.z + pasZ;

                const pawnToKill: Pawn | undefined = this.anyPawnAt({x: x, y: pos.y, z: z});

                if (pawnToKill && !(pawnToKill.name.includes(pawn.name.split("-")[0]) || pawnToKill.dead || this.pawnWasKilledInActions(pawnToKill, lastActions))) {

                    x += pasX;
                    z += pasZ;

                    if (Math.abs(x) <= 21 && Math.abs(z) <= 21 && !this.anyPawnAt({x: x, y: pos.y, z: z})) {
                        let _actions: Action[] = [];

                        lastActions.forEach((a) => _actions.push(a));

                        _actions.push({
                            pawn: pawn.name,
                            queen: false,
                            moveX: x,
                            moveY: pos.y,
                            moveZ: z,
                            pawnKilled: pawnToKill.name
                        } as Action);

                        _actions = this.obligatoryKill(pawn, {x: x, y: pos.y, z: z}, _actions);

                        if (_actions.length > actions.length) {
                            actions = _actions;
                        }
                    }
                }
            }
        }

        return actions.length == 0 ? lastActions : actions;
    }

    /**
     * Vérifier si un pion a déjà été tué dans les actions précédentes.
     *
     * @param pawn pion vérifié
     * @param actions liste des actions
     * @private
     */
    private pawnWasKilledInActions(pawn: Pawn, actions: Action[]): boolean {

        for (let i = 0; i < actions.length; i++) {
            if (actions[i].pawnKilled && actions[i].pawnKilled === pawn.name) {
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

    /**
     * Obtenir la liste des pions des blancs.
     *
     * @private
     */
    private getWhitePawns(): Pawn[] {
        const whitePawns: Pawn[] = [];
        this.pawns.forEach((pawn) => {
            if (pawn.name.includes('white')) whitePawns.push(pawn)
        })

        return whitePawns;
    }

    /**
     * Obtenir la liste des pions des noirs.
     *
     * @private
     */
    private getBlackPawns(): Pawn[] {
        const blackPawns: Pawn[] = [];
        this.pawns.forEach((pawn) => {
            if (pawn.name.includes('black')) blackPawns.push(pawn)
        })

        return blackPawns;
    }

    /**
     * Checker si la tous les pions de la liste sont morts
     *
     * @param pawns
     * @private
     */
    private teamDeath(pawns: Pawn[]): boolean {
        let count = 0;
        for (const pawn of pawns) {
            if (pawn.dead) count++;
        }

        return count == pawns.length;
    }

    /**
     * Retourner le nom du gagnant.
     * Null si la partie n'est toujours pas remporté
     *
     * @private
     */
    private isWinBy(): "black" | "white" | null {
        if (this.teamDeath(this.getBlackPawns())) return 'white';
        else if (this.teamDeath(this.getWhitePawns())) return 'black';
        else return null;
    }

    /**
     * Checker s'il s'agit d'une fin de partie.
     *
     * @private
     */
    private checkEndGame() {
        const whoWin = this.isWinBy();
        if (whoWin) {
            this.endGame(whoWin);
        }
    }

    /**
     * Mettre fin à la partie.
     *
     * @param whoWin équipe gagnante
     * @private
     */
    private endGame(whoWin: string) {
        console.log(this.uuid +  ": party ended!")
        this.server.io.to(this.uuid).emit('end game', whoWin);
        this.pushStatus('finished')
        setTimeout(() => this.server.io.to(this.uuid).disconnectSockets(), 25000)
    }


    emitWithout(socketNotEmit: Socket | null, event: string, ...args: any[]) {
        const socketArray: Socket[] = Array.from(this.sockets.values());
        socketArray.forEach((socket) => {
            if (!socketNotEmit || socket.data.user != socketNotEmit.data.user) {
                const userTeam = this.getTeam(socket.data.user)
                socket.emit(event, ...args, {team: userTeam, canPlay: this.whoPlay == userTeam, timer: this.actualTimer});
            }
        })
    }
}