"use strict";
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
/**
 * Permet d'instancier un lobby
 */
var PTLobby = /** @class */ (function () {
    /**
     * Permet d'instancier un lobby.
     *
     * @param uuid Identifiant unique du lobby
     * @param game Jeu du lobby
     * @param visibility Visibilité du lobby
     * @param server Instance du serveur jeu
     * @protected
     */
    function PTLobby(uuid, game, visibility, server) {
        this.status = "waiting";
        this.uuid = uuid;
        this.game = game;
        this.visibility = visibility;
        this.sockets = new Map();
        this.server = server;
    }
    /**
     * Supprimer le socket d'un utilisateur du lobby
     *
     * @param user
     * @protected
     */
    PTLobby.prototype.removeSocket = function (user) {
        return this.sockets.delete(user);
    };
    /**
     * Émettre sur tous les sockets clients du lobby sauf celui passé en paramètre.
     *
     * @param socketNotEmit socket client où l'on ne veut pas émettre l'évènement.
     * @param event évènement à émettre
     * @param args arguments de l'évènement
     */
    PTLobby.prototype.emitWithout = function (socketNotEmit, event) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var socketArray = Array.from(this.sockets.values());
        socketArray.forEach(function (socket) {
            if (socket.data.user != socketNotEmit.data.user) {
                socket.emit.apply(socket, __spreadArray([event], args, false));
            }
        });
    };
    /**
     * Retourner les élèments utiles pour décrire le lobby au format JSON.
     *
     * @return {attribute: Object}
     */
    PTLobby.prototype.getJSON = function () {
        return {
            uuid: this.uuid,
            game: this.game,
            status: this.status,
            visibility: this.visibility,
        };
    };
    PTLobby.prototype.getStatus = function () {
        return this.status;
    };
    PTLobby.prototype.pushStatus = function (newStatus) {
        this.status = newStatus;
        this.server.io.to('adonis').emit('lobby_status', this.uuid, this.status);
    };
    PTLobby.prototype.activeAntiEmptyLobby = function () {
        var _this = this;
        this.helpTimeout = setTimeout(function () {
            _this.pushStatus('finished');
            _this.server.io.to(_this.uuid).disconnectSockets();
        }, 120000);
    };
    PTLobby.prototype.disableAntiEmptyLobby = function () {
        clearTimeout(this.helpTimeout);
    };
    return PTLobby;
}());
exports.default = PTLobby;
