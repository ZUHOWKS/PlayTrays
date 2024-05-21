"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = require("socket.io");
var Checkers_1 = require("./lobby/games/Checkers");
var services_1 = require("../services");
var DorianGame_1 = require("./lobby/games/DorianGame");
/**
 * Cette classe permet d'instancier un serveur jeu PlayTrays pour créer un lobby et gérer
 * le lobby en jeu.
 */
var PTServer = /** @class */ (function () {
    function PTServer(httpServer, lobbyMax) {
        this.games = new Map();
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: "*",
            }
        });
        this.lobbies = new Map();
        this.capacity = lobbyMax;
    }
    /**
     * Initialiser le serveur
     */
    PTServer.prototype.init = function () {
        this.initGames();
        this.initWebSocketServer();
    };
    /**
     * Initialiser les jeux jouables sur le lobby.
     * @private
     */
    PTServer.prototype.initGames = function () {
        this.games.set("checkers", Checkers_1.default);
        this.games.set("dorian_game", DorianGame_1.default);
    };
    /**
     * Initialiser le middleware et les évènements serveur
     * @private
     */
    PTServer.prototype.initWebSocketServer = function () {
        var _this = this;
        this.io.use(function (socket, next) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.middleware(socket, next)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); });
        this.io.on("connection", function (socket) {
            if (socket.data.authType == "server") {
                _this.setupServerEvents(socket);
            }
            else if (socket.data.authType == "user") {
                var lobby = _this.lobbies.get(socket.data.lobbyUUID);
                if (lobby) {
                    lobby.registerNewSocket(socket);
                }
                else {
                    socket.disconnect();
                }
            }
            else {
                socket.disconnect();
            }
        });
        this.io.listen(25525);
        // Manifester la présence du serveur jeu auprès de l'app
        services_1.Axios.post('/server/manifest').then(function () { return console.log('Manifest successful !'); });
    };
    /**
     * Middleware d'authentification (serveur & utilisateur).
     *
     * @param socket Socket du serveur ou de l'utilisateur communicant avec le serveur
     * @param next Fonction qui permet de passer au middleware suivant s'il n'y a rien
     * en, sinon la communication est interrompue.
     * @private
     */
    PTServer.prototype.middleware = function (socket, next) {
        return __awaiter(this, void 0, void 0, function () {
            var auth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auth = socket.handshake.auth;
                        if (!auth) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.isServerAuthentificationValid(auth)];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 2];
                        socket.data = {};
                        socket.data.authType = "server";
                        return [2 /*return*/, next()];
                    case 2: return [4 /*yield*/, this.isUserAuthentificationValid(auth)];
                    case 3:
                        if (_a.sent()) {
                            socket.data = {};
                            socket.data.authType = "user";
                            socket.data.user = auth.user;
                            socket.data.token = auth.token;
                            socket.data.lobbyUUID = auth.lobbyUUID;
                            return [2 /*return*/, next()];
                        }
                        else {
                            console.log("middleware: authentification invalid");
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/, next(new Error("unauthorized"))];
                }
            });
        });
    };
    /**
     * Détermine si l'authentification de type serveur est valide.
     *
     * @param auth Données d'authentification
     * @return boolean
     * @private
     */
    PTServer.prototype.isServerAuthentificationValid = function (auth) {
        return __awaiter(this, void 0, void 0, function () {
            var authServerData;
            return __generator(this, function (_a) {
                try {
                    authServerData = auth;
                    console.log('Try Server Authentification...');
                    if (authServerData.identifier == process.env.SERVER_IDENTIFIER && authServerData.token == process.env.SERVER_TOKEN) {
                        console.log('Server Authentification successfully !');
                        return [2 /*return*/, true];
                    }
                }
                catch (e) {
                    console.error(e);
                }
                return [2 /*return*/, false];
            });
        });
    };
    /**
     * Détermine si l'authentification de type utilisateur est valide.
     *
     * @param auth Données d'authentification
     * @return boolean
     * @private
     */
    PTServer.prototype.isUserAuthentificationValid = function (auth) {
        return __awaiter(this, void 0, void 0, function () {
            var authUserData, formData, response, e_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        authUserData = auth;
                        console.log('Try User Authentification...');
                        if (!(authUserData.user && authUserData.token && authUserData.lobbyUUID && this.lobbies.get(authUserData.lobbyUUID) && ((_a = this.lobbies.get(authUserData.lobbyUUID)) === null || _a === void 0 ? void 0 : _a.getStatus()) != 'finished')) return [3 /*break*/, 2];
                        formData = new FormData();
                        formData.append('userID', authUserData.user + "");
                        formData.append('userToken', authUserData.token);
                        formData.append('lobbyUUID', authUserData.lobbyUUID);
                        return [4 /*yield*/, services_1.Axios.post('/server/legit-user', formData)];
                    case 1:
                        response = (_b.sent());
                        console.log((response === null || response === void 0 ? void 0 : response.status) == 200 ? 'User is Authenticated !' : 'Authentification Error: Unauthorized !');
                        return [2 /*return*/, (response === null || response === void 0 ? void 0 : response.status) == 200];
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        console.error(e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Mettre en place les évènements pour le socket de type serveur.
     *
     * @param socket Socket du serveur connecté au serveur jeu
     * @private
     */
    PTServer.prototype.setupServerEvents = function (socket) {
        var _this = this;
        socket.join("adonis");
        socket.on("create lobby", function (uuid, game, visibility, callback) {
            console.log("Setup lobby request...");
            if ((visibility === "public" || visibility === "private") && _this.games.get(game) && uuid && _this.lobbies.size < _this.capacity) {
                _this.createLobby(uuid, game, visibility);
                console.log("Lobby ", uuid, " setup !");
                var response = {
                    status: 200,
                };
                return callback(undefined, response);
            }
            else {
                return callback("Failed authentification", { status: "Failed" });
            }
        });
        socket.on('delete lobby', function (uuid) {
            // le temps que le lobby expulse les joueurs du socket.
            setTimeout(function () { return _this.lobbies.delete(uuid); }, 30000);
        });
        socket.emit("update", this.capacity, this.getLobbiesList());
    };
    /**
     * Créer un lobby.
     *
     * @param uuid Identifiant unique du lobby
     * @param game Jeu du lobby
     * @param visibility Visibilité du lobby
     * @private
     */
    PTServer.prototype.createLobby = function (uuid, game, visibility) {
        this.lobbies.set(uuid, new (this.games.get(game))(uuid, game, visibility, this));
    };
    /**
     * Obtenir la liste sous format JSON des lobbies.
     *
     * @private
     * @return Array
     */
    PTServer.prototype.getLobbiesList = function () {
        var lobbies = [];
        Array.from(this.lobbies.values()).forEach(function (lobby) { return lobbies.push(lobby.getJSON()); });
        return lobbies;
    };
    return PTServer;
}());
exports.default = PTServer;
