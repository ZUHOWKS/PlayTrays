import PTObject from "@/modules/game/scene/objects/PTObject";
import type {Object3D} from "three";

export class maison extends PTObject{

    nbCase: number

    constructor(name: string, object3D: Object3D, nbCase: number) {
        super(name, object3D);
        this.selectable = false;
        this.nbCase = nbCase
    }

    changeVisible(isVisible: boolean): void {
        this.object3D.visible = isVisible;
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