import SupportController from "@/modules/game/scene/SupportController";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import Tray from "@/modules/game/scene/objects/Tray";
import {BoxGeometry, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, Vector3} from "three";
import type {Ref} from "vue";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Socket} from "socket.io-client";
import Pawn from "@/modules/game/scene/objects/Pawn";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import ActuatorObject from "@/modules/game/scene/objects/ActuatorObject";


export default class CheckersClient extends SupportController {

    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls>, ws: Socket) {
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

        const modelWhitePawn: Promise<Object3D> = this.loadGLTFSceneModel(loader, "checkers/pawn_white.glb")
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

        const camera: PerspectiveCamera = this.getCamera();
        camera.position.y = 40;
        camera.position.z = 35;

        const controls: OrbitControls = this.getOrbitControls();
        controls.enableDamping = true; // autoriser le contrôle de la caméra (distance, rotation, déplacement)
        //controls.enablePan = false; //désactiver les déplacements de la caméra
        controls.minAzimuthAngle = -10/(Math.PI * 2.5);
        controls.maxAzimuthAngle = 10/(Math.PI * 2.5);
        controls.minDistance = 15;
        controls.maxTargetRadius = 25;
        controls.rotateSpeed = 0.5;
        controls.maxDistance = 85;

        controls.saveState();



        this.getOrbitControls().saveState();
    }

    defaultCamera(): void {
        const camera: PerspectiveCamera = this.getCamera();
        camera.position.y = 40;
        camera.position.z = 35;

        const controls: OrbitControls = this.getOrbitControls();

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

    removeActuators(): void {
        Array.from(this.actuatorRegistry.values()).forEach((act: Actuator) => {
            if (act instanceof ActuatorObject) {
                this.scene.remove((act as ActuatorObject).getObject3D());
            }
        });
        this.actuatorRegistry.clear();
    }

    showSelectedObjectActuators(): void {

        this.removeActuators();


        if (this.selectedObject) {
            let coef: number = 1;
            if (this.selectedObject.getName().includes("black")) {
                coef = -1;
            }

            const obj: Object3D = this.selectedObject.getObject3D();
            const geometry: BoxGeometry = new BoxGeometry( 6, 0.5, 6);
            const material: MeshBasicMaterial = new MeshBasicMaterial( { color: 0x68d0fc } );
            material.transparent = true;
            material.opacity = 0.65;

            const pawns: Pawn[] = this.getPawns();

            for (let i: number = -1; i <= 1; i+=2) {
                const x: number = obj.position.x + i * 6;
                const z: number = obj.position.z + coef * 6;



                if (Math.abs(x) <= 21 && Math.abs(z) <= 21 && !this.anyPawnAt(new Vector3(x, 0, z), pawns)) {
                    const actuatorObj = new Mesh(geometry, material);
                    actuatorObj.position.x = x;
                    actuatorObj.position.y = obj.position.y + 0.025;
                    actuatorObj.position.z = z;

                    const actuator: ActuatorObject = new ActuatorObject("actuator-" + this.selectedObject.name + "" + i, actuatorObj, this.selectedObject);
                    this.registerActuator(actuator);
                    this.scene.add(actuatorObj);
                    this.scene.children[this.scene.children.length - 1].name = actuator.getName();
                }
            }
        }
    }

    private registerActuator(act: Actuator) {
        this.actuatorRegistry.set(act.getName(), act);
    }

    unselectAll(): void {

    }

    private anyPawnAt(pos: Vector3, pawns?: Pawn[]): boolean {
        if (!pawns) {
            pawns = this.getPawns();
        }

        for (let i:number = 0; i < pawns.length; i++) {
            const obj: Object3D = pawns[i].getObject3D();

            if (obj.position.equals(pos)) {
                return true;
            }
        }

        return false;
    }

    private getPawns(): Pawn[] {
        const pawns: Pawn[]=[];
        const values: PTObject[] = Array.from(this.objectRegistry.values());
        values.forEach((ptObj: PTObject) => {
            if (ptObj instanceof Pawn) {
                pawns.push(ptObj as Pawn);
            }
        })

        return pawns
    }

}