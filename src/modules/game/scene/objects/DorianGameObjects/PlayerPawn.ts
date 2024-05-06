import PTObject from "@/modules/game/scene/objects/PTObject";
import {BoxGeometry, Mesh, MeshBasicMaterial, type Object3D, Vector3} from "three";
import {AnimationQueue, type AnimationQueueInterface} from "@/modules/utils/AnimationQueue";


export class playerPawn extends PTObject implements AnimationQueueInterface {
    animationQueue: AnimationQueue;
    case : {casePawnX : number ,casePawnY : number}
    positionTest : Vector3 = new Vector3(0, 0, 0);

    constructor(name: string, object3D: Object3D) {
        super(name, object3D);
        this.animationQueue = new AnimationQueue();
        this.case = {casePawnX : 0 ,casePawnY : 0}
    }

    moveTo(caseX : number, caseY : number): void {
        if (this.case.casePawnX == caseX && this.case.casePawnY == caseY) {this.moveCase();}
        while (this.case.casePawnX != caseX || this.case.casePawnY != caseY) {
            this.moveCase();
        }
    }

    rotate(x: number, y: number, z: number): void {
    }

    select(): void {
        this.moveTo(0, 0);
    }

    unselect(): void {
    }

    moveCase() : void {

            const vectDepart: Vector3 = this.positionTest.clone();
            const position: Vector3 = this.object3D.position;
            const dir = ((this.case.casePawnX > 0 && this.case.casePawnY == 10) || (this.case.casePawnX == 0 && this.case.casePawnY > 0)) ? 1 : -1;
            const saut = ((this.case.casePawnX == 0 && this.case.casePawnY == 0) || (this.case.casePawnX == 9 && this.case.casePawnY == 0) || (this.case.casePawnX == 10 && this.case.casePawnY == 0) || (this.case.casePawnX == 10 && this.case.casePawnY == 9) || (this.case.casePawnX == 10 && this.case.casePawnY == 10) || (this.case.casePawnX == 1 && this.case.casePawnY == 10) || (this.case.casePawnX == 0 && this.case.casePawnY == 10) || (this.case.casePawnX == 0 && this.case.casePawnY == 1)
            ) ? 2.325 * dir : 1.795 * dir;
            const tempX: number = ((this.case.casePawnX > 0 && this.case.casePawnY == 10) || (this.case.casePawnX < 10 && this.case.casePawnY == 0)) ? vectDepart.x + saut : vectDepart.x;
            const tempZ: number = ((this.case.casePawnX == 10 && this.case.casePawnY < 10) || (this.case.casePawnX == 0 && this.case.casePawnY > 0)) ? vectDepart.z + saut : vectDepart.z;


            const vectArrivee: Vector3 = new Vector3(tempX, 0, tempZ);
            const movVec: Vector3 = new Vector3((vectArrivee.x - vectDepart.x), 0, vectArrivee.z - vectDepart.z);

            if (this.case.casePawnX < 10 && this.case.casePawnY == 0) {this.case.casePawnX += 1;}
            else if (this.case.casePawnX == 10 && this.case.casePawnY < 10) {this.case.casePawnY += 1;}
            else if (this.case.casePawnX > 0 && this.case.casePawnY == 10) {this.case.casePawnX -= 1;}
            else if (this.case.casePawnX == 0 && this.case.casePawnY > 0) {this.case.casePawnY -= 1;}
            this.positionTest.x = vectArrivee.x;
            this.positionTest.y = vectArrivee.y;
            this.positionTest.z = vectArrivee.z;


            this.animationQueue.push({
                duration: 100,
                startCallback: (): void => {
                },
                animationCallback: (progress: number): void => {
                    position.x = vectDepart.x + movVec.x * progress;
                    position.y = vectDepart.y + movVec.y * progress;
                    position.z = vectDepart.z + movVec.z * progress;
                },
                finalCallback: (): void => {
                    position.x = vectArrivee.x;
                    position.y = vectArrivee.y;
                    position.z = vectArrivee.z;
                }
            })
        }
}