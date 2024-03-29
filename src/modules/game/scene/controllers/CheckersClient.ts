import SupportController from "@/modules/game/scene/SupportController";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import Tray from "@/modules/game/scene/objects/Tray";
import {PerspectiveCamera, Scene} from "three";
import type {Ref} from "vue";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Socket} from "socket.io-client";


export default class CheckersClient extends SupportController {

    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls | null>, ws: Socket) {
        super(scene, cameraRef, orbitControlsRef, ws);
    }

    confirmAction(): void {
    }

    getSelectedActuator(): Actuator | null {
        return null;
    }

    selectActuator(name: string): void {
    }

    setup(): void {
        const loader = new GLTFLoader();

        this.loadGLTFSceneModel(loader, "checkers/checkers_tray.glb").then((obj) => {
            obj.name = "checkersTray";
            this.registerObject(new Tray(obj.name, obj));
        });
    }

    showSelectedObjectActuators(object: PTObject | null): void {
    }

    unselectAll(): void {
    }

}