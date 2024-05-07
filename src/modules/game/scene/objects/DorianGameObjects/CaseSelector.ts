import PTObject from "@/modules/game/scene/objects/PTObject";
import {BoxGeometry, type Color, Mesh, MeshBasicMaterial, type Object3D, Vector3} from "three";
import {cardHelper, cardColorHelper} from "@/modules/game/scene/objects/DorianGameObjects/CardHelper";
import {prison} from "@/modules/game/scene/objects/DorianGameObjects/Prison";


export class CaseSelector extends PTObject{
    case : {casePawnX : number ,casePawnY : number, caseType : string, colorCase : Color | null}


    constructor(name: string, object3D: Object3D, caseX : number, caseY : number) {
        super(name, object3D);

        //Permet de construire les variables en fonction de la position de la carte en utilisatn les dictionnaires CardHelper et CardColorHelper
        let tempHelp : string = "" + caseX + caseY;
        const caseType: string = (tempHelp in cardHelper) ? cardHelper[tempHelp as keyof typeof cardHelper] : "ville";
        const colorCase: Color | null = (tempHelp in cardColorHelper) ? cardColorHelper[tempHelp as keyof typeof cardColorHelper] : null;
        this.case = {casePawnX : caseX, casePawnY : caseY, caseType : caseType, colorCase : colorCase};
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