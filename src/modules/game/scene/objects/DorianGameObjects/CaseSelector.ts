import PTObject from "@/modules/game/scene/objects/PTObject";
import {BoxGeometry, type Color, Mesh, MeshBasicMaterial, type Object3D, Vector3} from "three";
import {cardHelper, cardCityHelper} from "@/modules/game/scene/objects/DorianGameObjects/CardHelper";
import {prison} from "@/modules/game/scene/objects/DorianGameObjects/Prison";


export class CaseSelector extends PTObject{
    case : {casePawnX : number ,casePawnY : number, caseType : string, colorCase : string,  cityName : string, m0 : number, m1 : number, m2 : number, m3 : number, m4 : number, m5 : number, m6 : number, maison : number, prix : number} | {casePawnX : number ,casePawnY : number, caseType : string}


    constructor(name: string, object3D: Object3D, caseX : number, caseY : number) {
        super(name, object3D);

        //Permet de construire les variables en fonction de la position de la carte en utilisatn les dictionnaires CardHelper et CardColorHelper
        let tempHelp : string = "" + caseX + caseY;
        const caseType: string = (tempHelp in cardHelper) ? cardHelper[tempHelp as keyof typeof cardHelper] : "ville";
        const tempcardvalues= (tempHelp in cardCityHelper) ? cardCityHelper[tempHelp as keyof typeof cardCityHelper] : null;
        if (tempcardvalues != null && typeof tempcardvalues != "undefined" && caseType == "ville"){
            this.case = {casePawnX : caseX, casePawnY : caseY, caseType : caseType, colorCase : tempcardvalues.color, cityName : tempcardvalues.cityName, m0 : tempcardvalues.m0, m1 : tempcardvalues.m1, m2 : tempcardvalues.m2, m3 : tempcardvalues.m3, m4 : tempcardvalues.m4, m5 : tempcardvalues.m5, m6 : tempcardvalues.m6, maison : tempcardvalues.maison, prix : tempcardvalues.prix};
        }
        else{this.case = {casePawnX : caseX, casePawnY : caseY, caseType : caseType};}


    }
    moveTo(x: number, y: number, z: number): void {
    }

    rotate(x: number, y: number, z: number): void {
    }

    select(): void {
    }

    unselect(): void {
    }
    afficherCase() : void {

    }
}