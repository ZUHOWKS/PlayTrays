import SupportController from "@/modules/game/scene/SupportController";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import Tray from "@/modules/game/scene/objects/Tray";
import {Object3D, PerspectiveCamera, Scene} from "three";
import type {Ref} from "vue";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Socket} from "socket.io-client";
import Pawn from "@/modules/game/scene/objects/Pawn";


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

        const modelWhitePawn = this.loadGLTFSceneModel(loader, "checkers/pawn_white.glb")
        const modelBlackPawn: Promise<Object3D> = this.loadGLTFSceneModel(loader, "checkers/pawn_black.glb");

        this.ws.on("update game", (pawns: { name: string; x: number; y: number; z: number; dead: boolean; }[]): void => {
            pawns.forEach((pawn) => {
                if (pawn.name.includes("white")) {
                    this.registerPawn(modelWhitePawn, pawn);
                } else if (pawn.name.includes("black")) {
                    this.registerPawn(modelBlackPawn, pawn);
                }
            })

        })
    }

    private registerPawn(modelPawn: Promise<Object3D>, pawn: {
        name: string;
        x: number;
        y: number;
        z: number;
        dead: boolean
    }) {
        modelPawn.then((_obj) => {
            const obj: Object3D = _obj.clone();
            obj.name = pawn.name;
            obj.position.x = pawn.x;
            obj.position.y = pawn.y;
            obj.position.z = pawn.z;
            this.registerObject(new Pawn(obj.name, obj, pawn.dead));
        });
    }

    showSelectedObjectActuators(object: PTObject | null): void {
    }

    unselectAll(): void {
    }

}