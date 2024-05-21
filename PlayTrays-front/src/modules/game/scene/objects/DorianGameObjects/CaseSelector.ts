import PTObject from "@/modules/game/scene/objects/PTObject";
import {type Object3D} from "three";


export class CaseSelector extends PTObject{
    nbCase: number;

    constructor(name: string, object3D: Object3D, nbCase: number) {
        super(name, object3D);

        this.nbCase = nbCase


    }
    moveTo(x: number, y: number, z: number): void {
    }

    rotate(x: number, y: number, z: number): void {
    }

    select(): void {
    }

    unselect(): void {
    }
}