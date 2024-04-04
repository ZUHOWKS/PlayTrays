import SupportController from "@/modules/game/scene/SupportController";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import Tray from "@/modules/game/scene/objects/Tray";
import {
    BoxGeometry,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PerspectiveCamera,
    Scene,
    Vector3
} from "three";
import type {Ref} from "vue";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Socket} from "socket.io-client";
import Pawn from "@/modules/game/scene/objects/Pawn";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import ActuatorObject from "@/modules/game/scene/objects/ActuatorObject";


export default class CheckersClient extends SupportController {

    team: string | undefined;

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

        this.ws.on("setup game", (pawns: { name: string; x: number; y: number; z: number; dead: boolean; queen: boolean }[], team: string): void => {
            pawns.forEach((pawn) => {
                if (pawn.name.includes("white")) {
                    this.registerPawn(modelWhitePawn, pawn);
                } else if (pawn.name.includes("black")) {
                    this.registerPawn(modelBlackPawn, pawn);
                }
            })

            this.team = team;

            if (this.team == "white" || this.team == "black") {

                const side: number = this.team == "white" ? -1 : 1;
                const camera: PerspectiveCamera = this.getCamera();
                camera.position.y = 40;
                camera.position.z = 35 * side;

                const controls: OrbitControls = this.getOrbitControls();
                controls.enableDamping = true; // autoriser le contrôle de la caméra (distance, rotation, déplacement)
                //controls.enablePan = false; //désactiver les déplacements de la caméra
                controls.minAzimuthAngle = -10/(Math.PI * 2.5) * side;
                controls.maxAzimuthAngle = 10/(Math.PI * 2.5) * side;
                controls.minDistance = 15;
                controls.maxTargetRadius = 25;
                controls.rotateSpeed = 0.5;
                controls.maxDistance = 85;

                controls.saveState();



                this.getOrbitControls().saveState();
            }

        })


    }

    defaultCamera(): void {
        const camera: PerspectiveCamera = this.getCamera();
        camera.position.y = 40;
        camera.position.z = 35 * (this.team == "white" ? -1 : 1);

        //const controls: OrbitControls = this.getOrbitControls();

    }

    /**
     * Enregistre le pion.
     *
     * @param modelPawn
     * @param pawn
     * @private
     */
    private registerPawn(modelPawn: Promise<Object3D>, pawn: {
        name: string;
        x: number;
        y: number;
        z: number;
        dead: boolean;
        queen: boolean;
    }) {
        modelPawn.then((_obj) => {
            const obj: Object3D = _obj.clone();
            obj.name = pawn.name;
            obj.position.x = pawn.x;
            obj.position.y = pawn.y;
            obj.position.z = pawn.z;
            this.registerObject(new Pawn(obj.name, obj, pawn.dead, pawn.queen));
        });
    }

    selectObject(name: string) {
        super.selectObject(name);
        if (this.selectedObject instanceof Pawn && (!this.team || this.team == "spectator" || this.selectedObject.getName().includes((this.team == "white" ? "black" : "white")))) {
            const mesh: Mesh<BoxGeometry, MeshBasicMaterial> | undefined = (this.selectedObject as Pawn).selectEffect;
            if (mesh) {
                mesh.material.color.set(0xfcc09a);
            }
        }
    }

    private removeActuators(): void {
        Array.from(this.actuatorRegistry.values()).forEach((act: Actuator) => {
            if (act instanceof ActuatorObject) {
                this.scene.remove((act as ActuatorObject).getObject3D());
            }
        });
        this.actuatorRegistry.clear();
    }

    showSelectedObjectActuators(): void {

        this.removeActuators();


        if (this.selectedObject && this.selectedObject instanceof Pawn) { // vérifie s'il s'agit d'un pion
            if (!(this.selectedObject as Pawn).dead) {
                const obj: Object3D = this.selectedObject.getObject3D();
                const geometry: BoxGeometry = new BoxGeometry( 6, 0.5, 6);

                let canUse = false
                if (this.team) {
                    canUse = this.selectedObject.getName().includes(this.team);
                }

                const material: MeshBasicMaterial = new MeshBasicMaterial( { color: canUse ? 0x68d0fc : 0xfcdf03 } );
                material.transparent = true;
                material.opacity = 0.65;

                const pawns: Pawn[] = this.getPawns(); // optimale
                let n: number = 1; // compte le nombre d'actionneurs enregistré


                let sideMoveUp: number = 1; // Sens primaire du pion
                if (this.selectedObject.getName().includes("black")) {
                    sideMoveUp = -1;
                }

                // vérifie et affiche les cases jouables
                for (let queen: number = 1; queen >= ((this.selectedObject as Pawn).queen ? -1 : 0); queen-=2) { // On parcourt une deuxième fois la boucle si c'est une reine
                    for (let i: number = -1; i <= 1; i+=2) {
                        const x: number = obj.position.x + i * 6;
                        const z: number = obj.position.z + queen * sideMoveUp * 6; // devant ou derrière selon que le pion est une reine ou non

                        const pawn: Pawn | undefined = this.anyPawnAt(new Vector3(x, 0, z), pawns);
                        if (Math.abs(x) <= 21 && Math.abs(z) <= 21) {
                            if (!pawn) { // s'il n'y a aucun pion alors...
                                this.registerPawnActuator(geometry, material, x, obj.position.y + 0.025, z, "actuator-" + this.selectedObject.name + "" + n, this.selectedObject);
                                n++;
                            } else if (!this.selectedObject.getName().includes(pawn.getName().split("-")[0])) {
                                this.registerPawnActuator(geometry, material, x + i * 6, obj.position.y + 0.025, z + sideMoveUp * 6, "actuator-" + this.selectedObject.name + "" + n, this.selectedObject);
                                n++;
                            }

                        }
                    }
                }
            }
        }
    }

    /**
     * Enregistre et affiche l'actionneur du pion.
     *
     * @param geometry forme de l'actionneur
     * @param material matériel de l'actionneur
     * @param x position en x
     * @param y position en y
     * @param z position en z
     * @param name nom de l'actionneur
     * @param subject sujet
     * @private
     */
    private registerPawnActuator(geometry: BoxGeometry, material: MeshBasicMaterial, x: number, y: number, z: number, name: string, subject: PTObject): void {
        const actuatorObj: Mesh<BoxGeometry,MeshBasicMaterial> = new Mesh(geometry, material);
        actuatorObj.position.x = x;
        actuatorObj.position.y = y;
        actuatorObj.position.z = z;

        const actuator: ActuatorObject = new ActuatorObject(name, actuatorObj, subject);
        this.registerActuator(actuator);
        this.scene.add(actuatorObj);
        this.scene.children[this.scene.children.length - 1].name = actuator.getName();
    }

    private registerActuator(act: Actuator) {
        this.actuatorRegistry.set(act.getName(), act);
    }

    unselectAll(): void {
        this.unselectObject();
        this.removeActuators();
    }

    /**
     * Renvoie le pion trouvé à une localisation donnée.
     *
     * @param pos Localisation
     * @param pawns Liste des pions
     * @return Le pion trouvé à la localisation donnée, sinon undefined.
     * @private
     */
    private anyPawnAt(pos: Vector3, pawns?: Pawn[]): Pawn | undefined {
        if (!pawns) {
            pawns = this.getPawns();
        }

        for (let i:number = 0; i < pawns.length; i++) {
            const pawn: Pawn = pawns[i];
            const obj: Object3D = pawn.getObject3D();

            if (obj.position.equals(pos)) {
                return pawn;
            }
        }

        return undefined;
    }

    /**
     * Renvoie la liste des pions.
     *
     * @private
     */
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