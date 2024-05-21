import PTObject from "@/modules/game/scene/objects/PTObject";
import {type Object3D} from "three";


export class de extends PTObject{

    constructor(name: string, object3D: Object3D) {
        super(name, object3D);
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