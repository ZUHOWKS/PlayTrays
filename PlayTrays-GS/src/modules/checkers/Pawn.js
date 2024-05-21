"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pawn = /** @class */ (function () {
    function Pawn(name, x, y, z) {
        this.dead = false;
        this.queen = false;
        this.name = name;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
     * Remplace la position actuelle par la nouvelle position passée en paramètre
     *
     * @param pos vecteur à 3 coordonnées
     */
    Pawn.prototype.setPosition = function (pos) {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
        // deviens reine quand il atteint le quand ennemi
        if (!this.queen && this.z == 21 * (this.name.includes("white") ? 1 : -1)) {
            this.queen = true;
        }
    };
    return Pawn;
}());
exports.default = Pawn;
