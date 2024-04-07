import PTObject from "@/modules/game/scene/objects/PTObject";
import {BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3} from "three";
import {AnimationQueue, type AnimationQueueInterface} from "@/modules/utils/AnimationQueue";


export default class Pawn extends PTObject implements AnimationQueueInterface {
    position: Vector3;
    dead: boolean;
    queen: boolean;
    selectEffect: Mesh<BoxGeometry, MeshBasicMaterial> | undefined;
    animationQueue: AnimationQueue;


    constructor(name: string, obj: Object3D, dead: boolean, queen: boolean) {
        super(name, obj);
        this.dead = dead;
        this.queen = queen;
        this.position = new Vector3(this.object3D.position.x, this.object3D.position.y, this.object3D.position.z);
        this.animationQueue = new AnimationQueue();
    }

    moveTo(x: number, y: number, z: number) {


        const position: Vector3 = this.object3D.position;
        let duration: number = 150;

        const movVec: Vector3 = new Vector3((x - position.x), (y - position.y), (z - position.z))
        const basicPosition: Vector3 = new Vector3(position.x, position.y, position.z);

        this.position.set(x, y, z);

        this.animationQueue.push({
            duration: duration,
            animationCallback: (relativeProgress: number) => {
                position.x = basicPosition.x + movVec.x * relativeProgress;
                position.y = basicPosition.y + movVec.y * relativeProgress;
                position.z = basicPosition.z + movVec.z * relativeProgress;
            },
            finalCallback: () => {

                position.x = x;
                position.y = y;
                position.z = z;
            }
        })
    }

    setPositionTo(x: number, y: number, z: number) {
        this.animationQueue.clear();
        this.animationQueue.cancel();
        this.position.set(x, y, z);

        const position: Vector3 = this.getObject3D().position;
        let doIt: number = 20;

        this.animationQueue.push({
            duration: doIt,
            animationCallback: () => {
                position.x = x;
                position.y = y;
                position.z = z;
            },
            finalCallback: () => {
                position.x = x;
                position.y = y;
                position.z = z;
                this.position.set(x, y, z);
            }
        })

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

    kill(): void {
        this.dead = true;
        this.getObject3D().removeFromParent();
    }

}