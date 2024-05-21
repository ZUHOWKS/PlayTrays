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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TownCard = void 0;
var Card_1 = require("./Card");
var TownCard = /** @class */ (function (_super) {
    __extends(TownCard, _super);
    function TownCard(caseNb, name, info) {
        var _this = _super.call(this, caseNb, "ville") || this;
        _this.hypotheque = false;
        _this.nbMaison = 0;
        _this.name = name;
        _this.info = info;
        return _this;
    }
    TownCard.prototype.isHypotheque = function () {
        return this.hypotheque;
    };
    TownCard.prototype.addMaison = function () { this.nbMaison += 1; };
    TownCard.prototype.getPassagePrice = function () {
        var price = 0;
        if (!this.isHypotheque()) {
            if (this.nbMaison == 0)
                price = this.info.m0;
            if (this.nbMaison == 1)
                price = this.info.m1;
            if (this.nbMaison == 2)
                price = this.info.m2;
            if (this.nbMaison == 3)
                price = this.info.m3;
            if (this.nbMaison == 4)
                price = this.info.m4;
            if (this.nbMaison == 5)
                price = this.info.m5;
        }
        return price;
    };
    return TownCard;
}(Card_1.Card));
exports.TownCard = TownCard;
