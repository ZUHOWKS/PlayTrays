import PTObject from "@/modules/game/scene/objects/PTObject";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import type {Object3D} from "three";


export default class ActuatorObject extends PTObject implements Actuator {
    subject: PTObject;

    constructor(name: string, object3D: Object3D, subject: PTObject) {
        super(name, object3D);
        this.subject = subject
    }

    getSubject(): PTObject {
        return this.subject;
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