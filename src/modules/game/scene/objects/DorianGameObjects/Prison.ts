import PTObject from "@/modules/game/scene/objects/PTObject";
import {BoxGeometry, Mesh, MeshBasicMaterial, type Object3D, Vector3} from "three";
import {AnimationQueue, type AnimationQueueInterface} from "@/modules/utils/AnimationQueue";


export class prison extends PTObject implements AnimationQueueInterface{
    animationQueue: AnimationQueue;
    isUp : boolean = true;
    selectable : boolean = false;

    constructor(name: string, object3D: Object3D) {
        super(name, object3D);
        this.object3D.translateY(10);
        this.animationQueue = new AnimationQueue();
        this.object3D.visible = false;
    }

    moveTo(x: number, y: number, z: number, duration : number, finalCallback? : any): void {
        const vectDepart : Vector3 = this.object3D.position.clone();
        const vectArrivee : Vector3 = new Vector3(x, y, z);
        const movVec: Vector3 = new Vector3((x - vectDepart.x), (y - vectDepart.y), (z - vectDepart.z));
        const position: Vector3 = this.object3D.position;

        this.animationQueue.push({
            duration: duration,
            startCallback: (): void => {
                this.object3D.visible = true;
            },
            animationCallback: (progress : number): void => {
                position.x = vectDepart.x + movVec.x*progress;
                position.y = vectDepart.y + movVec.y*progress;
                position.z = vectDepart.z + movVec.z*progress;
            },
            finalCallback: (): void => {
                if (finalCallback) finalCallback();
            }
            })

}

    rotate(x: number, y: number, z: number): void {
        this.object3D.rotateX(x);
        this.object3D.rotateY(y);
        this.object3D.rotateZ(z);
    }

    select(): void{

        /*
        this.moveTo(0,0, 0, 100)
        this.selectable = false;
        this.moveTo(0,100, 0, 1000, () => {
            this.object3D.visible = false;
            this.object3D.position.set(0, 10, 0);
        })

        this.selectable = true;
        */
        if (this.isUp){this.down();}
        else {this.up();}

    }

    unselect(): void {
    }
    down() : void{
        this.moveTo(0,0, 0, 100)
        this.isUp = false;

    }
    up() : void {
        this.moveTo(0,100, 0, 1000, () => {
            this.object3D.visible = false;
            this.object3D.position.set(0, 10, 0);
        })
        this.isUp = true;
    }
}