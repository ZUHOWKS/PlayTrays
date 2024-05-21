"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var PTLobby_1 = require("../PTLobby");
var Pawn_1 = require("../../checkers/Pawn");
var Vectors_1 = require("../../utils/Vectors");
var services_1 = require("../../../services");
var Checkers = /** @class */ (function (_super) {
    __extends(Checkers, _super);
    /**
     * Permet d'instancier un lobby pour le jeu des dames.
     *
     * @param uuid Identifiant unique du lobby
     * @param game Jeu du lobby
     * @param visibility Visibilité du lobby
     * @param server Instance du serveur jeu
     */
    function Checkers(uuid, game, visibility, server) {
        var _this = _super.call(this, uuid, game, visibility, server) || this;
        _this.whoPlay = "black";
        _this.actualTimer = 120;
        _this.pawns = [];
        _this.setupGame();
        _this.activeAntiEmptyLobby();
        return _this;
    }
    /**
     * Setup les élèments du jeu.
     *
     * @private
     */
    Checkers.prototype.setupGame = function () {
        // Setup des pions blancs
        for (var i = 0; i < 12; i++) {
            this.pawns.push(new Pawn_1.default("white-" + i, (-21 + ((Math.floor(i / 4) + 1) % 2) * 6) + (i % 4) * 12, 0, -21 + Math.floor(i / 4) * 6)); // nom, position x, position y
        }
        // Setup des pions noirs
        for (var i = 0; i < 12; i++) {
            this.pawns.push(new Pawn_1.default("black-" + i, (-21 + ((Math.floor(i / 4)) % 2) * 6) + (i % 4) * 12, 0, 21 - Math.floor(i / 4) * 6)); // nom, position x, position y
        }
    };
    /**
     * Enregistrer un socket utilisateur qui a rejoint le lobby et initialiser tous les évènements lier au lobby.
     *
     * @param socket Socket de l'utilisateur
     */
    Checkers.prototype.registerNewSocket = function (socket) {
        var _this = this;
        this.sockets.set(socket.data.user, socket);
        socket.join(this.uuid);
        // émettre une update de la partie
        var userTeam = this.setTeam(socket.data.user);
        socket.emit("setup game", this.getPawnsJSON(), { team: userTeam, canPlay: false, timer: this.actualTimer }, function (error, response) {
            if (!error && response.loaded) {
                if (_this.status === 'waiting') {
                    if (_this.whitePlayer && _this.blackPlayer) {
                        _this.pushStatus('running');
                        _this.disableAntiEmptyLobby();
                        _this.getUsernames().then(function (users) {
                            Array.from(_this.sockets.values()).forEach(function (_socket) {
                                var _userTeam = _this.getTeam(_socket.data.user);
                                _socket.emit('start', { team: _userTeam, canPlay: _this.whoPlay == _userTeam, timer: _this.actualTimer }, users);
                            });
                        });
                        var intervalID_1 = setInterval(function () {
                            if (_this.status === 'finished')
                                clearInterval(intervalID_1);
                            if (_this.actualTimer == 0) {
                                _this.actualTimer = 90;
                                _this.whoPlay = _this.whoPlay == "black" ? "white" : "black";
                                _this.emitWithout(null, 'pawn action', []);
                                _this.checkEndGame();
                            }
                            else {
                                _this.actualTimer -= 1;
                            }
                            _this.server.io.to(_this.uuid).emit('timer', _this.actualTimer);
                        }, 1000);
                    }
                }
                else if (_this.status === 'running') {
                    _this.getUsernames().then(function (users) { return socket.emit('start', { team: userTeam, canPlay: _this.whoPlay == userTeam, timer: _this.actualTimer }, users); });
                }
            }
        });
        // évènement de déconnection du socket
        socket.on("disconnect", function () {
            _this.removeSocket(socket.data.user);
            console.log("The user " + socket.data.user + " leave the lobby " + _this.uuid + ".");
        });
        socket.on("pawn action", function (action, callback) {
            var userTeam = _this.getTeam(socket.data.user);
            if (_this.status === 'running') {
                var result = _this.pawnMoveAction(action, socket);
                if (result.length > 0) {
                    if (action.moveX != result[0].moveX || action.moveY != result[0].moveY || action.moveZ != result[0].moveZ) {
                        callback("Error: can't perform this action !", { team: userTeam, canPlay: _this.whoPlay == userTeam, rollback: false });
                        return socket.emit("pawn action", result, { team: userTeam, canPlay: _this.whoPlay == userTeam, timer: _this.actualTimer });
                    }
                    else {
                        return callback(undefined, { actions: result, team: userTeam, canPlay: _this.whoPlay == userTeam, replay: action.pawn, timer: _this.actualTimer });
                    }
                }
            }
            return callback("Error: can't perform this action !", { pawns: _this.getPawnsJSON(), team: userTeam, canPlay: _this.whoPlay == userTeam, rollback: true });
        });
        //TODO:Timeout de setup de party -> si la party ne se lance pas au bout de 30 secondes, déconnecter tout le monde + fermer le lobby
        socket.on('leave party', function (callback) {
            if (_this.status != "finished")
                _this.endGame((userTeam == 'black' ? 'white' : 'black'));
            callback(undefined, { status: 200 });
        });
        console.log("The user " + socket.data.user + " join the lobby " + this.uuid + ".");
    };
    /**
     *
     * Get usernames of players.
     *
     * @private
     */
    Checkers.prototype.getUsernames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var form1, users, _a, _b, form2, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        form1 = new FormData();
                        users = [];
                        // @ts-ignore
                        form1.append('userID', parseInt(this.blackPlayer));
                        _b = (_a = users).push;
                        return [4 /*yield*/, services_1.Axios.post('/server/user-info', form1)];
                    case 1:
                        _b.apply(_a, [(_e.sent()).data.username]);
                        form2 = new FormData();
                        // @ts-ignore
                        form2.append('userID', parseInt(this.whitePlayer));
                        _d = (_c = users).push;
                        return [4 /*yield*/, services_1.Axios.post('/server/user-info', form2)];
                    case 2:
                        _d.apply(_c, [(_e.sent()).data.username]);
                        return [2 /*return*/, users];
                }
            });
        });
    };
    /**
     * Place le joueur dans une équipe.
     *
     * @param user nom de l'utilisateur
     * @private
     */
    Checkers.prototype.setTeam = function (user) {
        if (!this.blackPlayer || this.blackPlayer == user) {
            this.blackPlayer = user;
            return "black";
        }
        else if (!this.whitePlayer || this.whitePlayer == user) {
            this.whitePlayer = user;
            return "white";
        }
        else {
            return "spectator";
        }
    };
    /**
     * Obtenir l'équipe du joueur donné.
     *
     * @param user id de l'utilisateur
     * @private
     */
    Checkers.prototype.getTeam = function (user) {
        if (this.blackPlayer == user) {
            return "black";
        }
        else if (this.whitePlayer == user) {
            return "white";
        }
        else {
            return "spectator";
        }
    };
    /**
     * Permet de vérifié la cohérence des mouvements d'un pion (anti-cheat) et de les exécuter
     * si les conditions de jouabilité sont réunis.
     *
     * @param action action du pion
     * @param socket socket du l'utilisateur responsable de l'action
     * @private
     */
    Checkers.prototype.pawnMoveAction = function (action, socket) {
        var _this = this;
        var actions = [action];
        var pawn = this.getPawn(action.pawn);
        // si c'est le tour du joueur et que le pion n'est pas joué en dehors du plateau
        if (pawn && this.getTeam(socket.data.user) == this.whoPlay && Math.abs(action.moveX) <= 21 && Math.abs(action.moveZ) <= 21) {
            // si le pion existe
            // vérifie que le pion est de l'équipe du joueur et qu'il reste sur le plateau
            if (Math.abs(action.moveY - pawn.y) == 0 && pawn.name.includes(this.getTeam(socket.data.user))) {
                var pos = { x: action.moveX, y: action.moveY, z: action.moveZ };
                var xDiff = action.moveX - pawn.x;
                var zDiff = action.moveZ - pawn.z;
                if (pawn.queen) {
                    if (!this.anyPawnAt(pos)) {
                        // check legit action
                        var pawnToKill = void 0;
                        // on parcours le chemin de l'origine jusqu'à la position du mouvement
                        for (var i = Math.floor(Math.max(Math.abs(xDiff), Math.abs(zDiff)) / 6) - 1; i > 0; i--) {
                            pawnToKill = this.anyPawnAt({
                                x: pos.x + (xDiff < 0 ? i : -i) * 6,
                                y: pos.y,
                                z: pos.z + (zDiff < 0 ? i : -i) * 6
                            });
                            if (pawnToKill && !pawnToKill.dead) {
                                break; // le chemin serra interrompu dans tous les cas (règle de la prise maximale obligatoire ou abort move)
                            }
                            else {
                                pawnToKill = undefined;
                            }
                        }
                        if (pawnToKill) {
                            if (!pawnToKill.name.includes(pawn.name.split("-")[0]) && !pawnToKill.dead) {
                                var killPos = {
                                    x: pawnToKill.x + (xDiff > 0 ? 1 : -1) * 6,
                                    y: pawnToKill.y,
                                    z: pawnToKill.z + (zDiff > 0 ? 1 : -1) * 6
                                };
                                if (!this.anyPawnAt(killPos)) {
                                    while (!(this.anyPawnAt(killPos) || Vectors_1.VecHelp.equal(killPos, pos) || Math.abs(killPos.x) >= 21 && Math.abs(killPos.z) >= 21)) {
                                        killPos = {
                                            x: killPos.x + (xDiff > 0 ? 1 : -1) * 6,
                                            y: killPos.y,
                                            z: killPos.z + (zDiff > 0 ? 1 : -1) * 6
                                        };
                                    }
                                    actions[0].moveX = killPos.x;
                                    actions[0].moveY = killPos.y;
                                    actions[0].moveZ = killPos.z;
                                    actions[0].pawnKilled = pawnToKill.name;
                                    pawn.setPosition(killPos);
                                    actions.forEach(function (action) {
                                        var _a;
                                        // @ts-ignore
                                        (_a = _this.getPawn(action.pawnKilled)) === null || _a === void 0 ? void 0 : _a.dead = true; // l'action comporte toujours un pion tué
                                    });
                                    this.actualTimer = 90;
                                    this.emitWithout(socket, "pawn action", actions);
                                    this.checkEndGame();
                                    return actions;
                                }
                            }
                        }
                        else {
                            this.whoPlay = this.getTeam(socket.data.user) == "black" ? "white" : "black";
                            pawn.setPosition(pos);
                            this.actualTimer = 90;
                            this.emitWithout(socket, "pawn action", actions);
                            this.checkEndGame();
                            return actions;
                        }
                    }
                }
                else {
                    // si il s'agit d'un déplacement d'une case
                    if (Math.abs(xDiff) == 6 && Math.abs(zDiff) == 6) {
                        if (!this.anyPawnAt(pos)) {
                            this.whoPlay = this.getTeam(socket.data.user) == "black" ? "white" : "black";
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
                    }
                    else if (Math.abs(xDiff) == 12 && Math.abs(zDiff) == 12) {
                        var pawnToKill = this.anyPawnAt({
                            x: pos.x + (xDiff < 0 ? 1 : -1) * 6,
                            y: pos.y,
                            z: pos.z + (zDiff < 0 ? 1 : -1) * 6
                        });
                        if (pawnToKill) {
                            if (!pawnToKill.name.includes(pawn.name.split("-")[0]) && !pawnToKill.dead) {
                                if (!this.anyPawnAt(pos)) {
                                    actions[0].pawnKilled = pawnToKill.name;
                                    this.whoPlay = this.getTeam(socket.data.user) == "black" ? "white" : "black";
                                    actions = this.obligatoryKill(pawn, pos, actions);
                                    var lastAction = actions[actions.length - 1];
                                    pawn.setPosition({ x: lastAction.moveX, y: lastAction.moveY, z: lastAction.moveZ });
                                    actions.forEach(function (action) {
                                        var _a;
                                        // @ts-ignore
                                        (_a = _this.getPawn(action.pawnKilled)) === null || _a === void 0 ? void 0 : _a.dead = true; // l'action comporte toujours un pion tué
                                    });
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
    };
    /**
     * Renvoie le pion du nom donné.
     *
     * @param name nom du pion recherché
     * @return le pion, sinon undenfined
     * @private
     */
    Checkers.prototype.getPawn = function (name) {
        for (var i = 0; i < this.pawns.length; i++) {
            var pawn = this.pawns[i];
            if (pawn.name == name) {
                return pawn;
            }
        }
        return;
    };
    /**
     * Renvoie le pion trouvé à une localisation donnée.
     *
     * @param pos Localisation
     * @return Le pion trouvé à la localisation donnée, sinon undefined.
     * @private
     */
    Checkers.prototype.anyPawnAt = function (pos) {
        for (var i = 0; i < this.pawns.length; i++) {
            var pawn = this.pawns[i];
            if (pawn.x == pos.x && pawn.y == pos.y && pawn.z == pos.z && !(pawn.dead)) {
                return pawn;
            }
        }
        return;
    };
    /**
     * Selon la régle du jeu des dames de la prise obligatoire maximale, détermine la liste
     * des actions à effectuer.
     *
     * @param pawn pion responsable
     * @param pos position du pion
     * @param lastActions actions déjà effectuées
     * @private
     */
    Checkers.prototype.obligatoryKill = function (pawn, pos, lastActions) {
        var actions = [];
        for (var i = -1; i <= 1; i += 2) {
            var pasZ = i * 6;
            var _loop_1 = function (j) {
                var pasX = j * 6;
                var x = pos.x + pasX;
                var z = pos.z + pasZ;
                var pawnToKill = this_1.anyPawnAt({ x: x, y: pos.y, z: z });
                if (pawnToKill && !(pawnToKill.name.includes(pawn.name.split("-")[0]) || pawnToKill.dead || this_1.pawnWasKilledInActions(pawnToKill, lastActions))) {
                    x += pasX;
                    z += pasZ;
                    if (Math.abs(x) <= 21 && Math.abs(z) <= 21 && !this_1.anyPawnAt({ x: x, y: pos.y, z: z })) {
                        var _actions_1 = [];
                        lastActions.forEach(function (a) { return _actions_1.push(a); });
                        _actions_1.push({
                            pawn: pawn.name,
                            queen: false,
                            moveX: x,
                            moveY: pos.y,
                            moveZ: z,
                            pawnKilled: pawnToKill.name
                        });
                        _actions_1 = this_1.obligatoryKill(pawn, { x: x, y: pos.y, z: z }, _actions_1);
                        if (_actions_1.length > actions.length) {
                            actions = _actions_1;
                        }
                    }
                }
            };
            var this_1 = this;
            for (var j = -1; j <= 1; j += 2) {
                _loop_1(j);
            }
        }
        return actions.length == 0 ? lastActions : actions;
    };
    /**
     * Vérifier si un pion a déjà été tué dans les actions précédentes.
     *
     * @param pawn pion vérifié
     * @param actions liste des actions
     * @private
     */
    Checkers.prototype.pawnWasKilledInActions = function (pawn, actions) {
        for (var i = 0; i < actions.length; i++) {
            if (actions[i].pawnKilled && actions[i].pawnKilled === pawn.name) {
                return true;
            }
        }
        return false;
    };
    /**
     * Obtenir la liste des pions ainis que leurs attributs au format JSON.
     *
     * @private
     */
    Checkers.prototype.getPawnsJSON = function () {
        var pawns = [];
        this.pawns.forEach(function (pawn) { return pawns.push({
            name: pawn.name,
            x: pawn.x,
            y: pawn.y,
            z: pawn.z,
            dead: pawn.dead,
            queen: pawn.queen
        }); });
        return pawns;
    };
    /**
     * Obtenir la liste des pions des blancs.
     *
     * @private
     */
    Checkers.prototype.getWhitePawns = function () {
        var whitePawns = [];
        this.pawns.forEach(function (pawn) {
            if (pawn.name.includes('white'))
                whitePawns.push(pawn);
        });
        return whitePawns;
    };
    /**
     * Obtenir la liste des pions des noirs.
     *
     * @private
     */
    Checkers.prototype.getBlackPawns = function () {
        var blackPawns = [];
        this.pawns.forEach(function (pawn) {
            if (pawn.name.includes('black'))
                blackPawns.push(pawn);
        });
        return blackPawns;
    };
    /**
     * Checker si la tous les pions de la liste sont morts
     *
     * @param pawns
     * @private
     */
    Checkers.prototype.teamDeath = function (pawns) {
        var count = 0;
        for (var _i = 0, pawns_1 = pawns; _i < pawns_1.length; _i++) {
            var pawn = pawns_1[_i];
            if (pawn.dead)
                count++;
        }
        return count == pawns.length;
    };
    /**
     * Retourner le nom du gagnant.
     * Null si la partie n'est toujours pas remporté
     *
     * @private
     */
    Checkers.prototype.isWinBy = function () {
        if (this.teamDeath(this.getBlackPawns()))
            return 'black';
        else if (this.teamDeath(this.getWhitePawns()))
            return 'black';
        else
            return null;
    };
    /**
     * Checker s'il s'agit d'une fin de partie.
     *
     * @private
     */
    Checkers.prototype.checkEndGame = function () {
        var whoWin = this.isWinBy();
        if (whoWin) {
            this.endGame(whoWin);
        }
    };
    /**
     * Mettre fin à la partie.
     *
     * @param whoWin équipe gagnante
     * @private
     */
    Checkers.prototype.endGame = function (whoWin) {
        var _this = this;
        console.log(this.uuid + ": party ended!");
        this.server.io.to(this.uuid).emit('end game', whoWin);
        this.pushStatus('finished');
        setTimeout(function () { return _this.server.io.to(_this.uuid).disconnectSockets(); }, 25000);
    };
    Checkers.prototype.emitWithout = function (socketNotEmit, event) {
        var _this = this;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var socketArray = Array.from(this.sockets.values());
        socketArray.forEach(function (socket) {
            if (!socketNotEmit || socket.data.user != socketNotEmit.data.user) {
                var userTeam = _this.getTeam(socket.data.user);
                socket.emit.apply(socket, __spreadArray(__spreadArray([event], args, false), [{ team: userTeam, canPlay: _this.whoPlay == userTeam, timer: _this.actualTimer }], false));
            }
        });
    };
    return Checkers;
}(PTLobby_1.default));
exports.default = Checkers;
