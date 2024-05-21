"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VecHelp = void 0;
var VecHelp = /** @class */ (function () {
    function VecHelp() {
    }
    VecHelp.equal = function (a, b) {
        return a.x == b.x && a.y == b.y && a.z == b.z;
    };
    return VecHelp;
}());
exports.VecHelp = VecHelp;
