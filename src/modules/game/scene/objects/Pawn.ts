import PTObject from "@/modules/game/scene/objects/PTObject";
import {BoxGeometry, Mesh, MeshBasicMaterial, type Object3D} from "three";


export default class Pawn extends PTObject {
    dead: boolean;
    queen: boolean;
    selectEffect: Mesh<BoxGeometry, MeshBasicMaterial> | undefined;

    constructor(name: string, obj: Object3D, dead: boolean, queen: boolean) {
        super(name, obj);
        this.dead = dead;
        this.queen = queen;
    }

    moveTo(x: number, y: number, z: number): void {
    }

    rotate(x: number, y: number, z: number): void {
    }

    select(): void {
        const geometry = new BoxGeometry( 6, 0.05, 6);
        const material = new MeshBasicMaterial( { color: 0x9ffc9a } );
        material.transparent = true;
        material.opacity = 0.65;

        this.selectEffect = new Mesh(geometry, material);
        this.object3D.add(this.selectEffect);
    }

    unselect(): void {
        if (this.selectEffect) {
            this.object3D.remove(this.selectEffect);
            this.selectEffect = undefined;
        }

    }

}