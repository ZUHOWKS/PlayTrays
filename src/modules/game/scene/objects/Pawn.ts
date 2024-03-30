import PTObject from "@/modules/game/scene/objects/PTObject";
import type {Object3D} from "three";


export default class Pawn extends PTObject {
    dead: boolean;

    constructor(name: string, obj: Object3D, dead: boolean) {
        super(name, obj);
        this.dead = dead
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