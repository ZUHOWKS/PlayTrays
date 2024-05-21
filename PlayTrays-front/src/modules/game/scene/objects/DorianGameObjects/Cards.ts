import PTObject from "@/modules/game/scene/objects/PTObject";
import {BoxGeometry, Mesh, MeshBasicMaterial, type Object3D} from "three";


export class arcade extends PTObject{

    constructor(name: string, object3D: Object3D) {
        super(name, object3D);
    }

    moveTo(x: number, y: number, z: number): void {
    }

    rotate(x: number, y: number, z: number): void {
    }

    select(): void {
        const geometry = new BoxGeometry( 1, 1, 1 );
        const material = new MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new Mesh( geometry, material );
        cube.position.set(Math.random()*10, Math.random()*10, Math.random()*10);
        this.object3D.parent?.add( cube );
    }

    unselect(): void {
    }
}