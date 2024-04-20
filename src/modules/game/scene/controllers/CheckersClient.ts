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

interface Action {
    pawn: string;
    moveX: number;
    moveY: number;
    moveZ: number;
    pawnKilled: string | undefined;
}

export default class CheckersClient extends SupportController {

    team: string | undefined;
    canPlay: boolean = false;

    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls>, ws: Socket) {
        super(scene, cameraRef, orbitControlsRef, ws);
    }

    confirmAction(): void {
        if (this.selectedActuator) {


            // Lorsque l'actionneur est un objet
            if (this.selectedActuator instanceof ActuatorObject) {

                // Lorsque que le sujet est pion
                this.performPawnAction();
            }
        }

        this.selectedActuator = undefined;
    }

    private performPawnAction() {

        const subject: PTObject | undefined = this.selectedActuator?.getSubject();
        if (subject instanceof Pawn && this.team && this.canPlay) {
            if (true && subject.name.includes(this.team)) {

                // position de l'actionneur dans l'espace
                const actPos: Vector3 = (this.selectedActuator as ActuatorObject).getObject3D().position;

                this.unselectAll();
                subject.moveTo(actPos.x, actPos.y, actPos.z);

                this.ws.emit("pawn action",
                    ({
                        pawn: subject.getName(),
                        moveX: actPos.x,
                        moveY: actPos.y,
                        moveZ: actPos.z,
                    } as Action), (error: any, response: any) => {
                        if (error) {
                            console.error(error);

                            response.pawns.forEach((pawn: any) => {
                                const pawnObj: Pawn | undefined = this.getObject(pawn.name) as Pawn;
                                if (pawnObj) {
                                    pawnObj.setPositionTo(pawn.x, pawn.y, pawn.z);
                                }
                            })
                        } else if (response) {
                            const actions: Action[] = response.actions as Action[];

                            this.team = response.team;
                            this.canPlay = response.canPlay

                            const firstPawnToKill = response.actions[0].pawnKilled;

                            // s'il un premier pion a été tué alors régle de la prise maxiamle obligatoire
                            if (firstPawnToKill) {
                                const toKill: any[] = [() => {this.killPawn(firstPawnToKill);}];

                                actions.shift(); // première animation de déplacement déjà en cours

                                // boucle pour animer les prises suivantes
                                actions.forEach((action) => {
                                    const pawn: Pawn | undefined = this.getObject(action.pawn) as Pawn;
                                    if (pawn) {

                                        if (action.pawnKilled) {

                                            toKill.push(() => {
                                                //@ts-ignore
                                                this.killPawn(action.pawnKilled);
                                            });
                                        }

                                        if (actions.indexOf(action) == actions.length-1) {
                                            pawn.moveTo(action.moveX, action.moveY, action.moveZ, () => {
                                                toKill.forEach((kill) => kill());
                                            });
                                        }
                                    }
                                });

                                if (actions.length == 0) {
                                    toKill[0]();
                                }
                            }
                        }

                        console.log(response)
                    }
                );
            }
        }
    }

    getSelectedActuator(): Actuator | null {
        return null;
    }

    selectActuator(name: string): void {
        const act: Actuator | undefined = this.actuatorRegistry.get(name);

        if (act) {
            if (this.selectedActuator) {
                if (this.selectedActuator.name != act.name) {
                    this.selectedActuator = act;
                    this.confirmAction();
                }
            } else {
                this.selectedActuator = act;
                this.confirmAction();
            }

        }
    }

    setup(): void {
        const loader = new GLTFLoader();

        this.loadGLTFSceneModel(loader, "checkers/checkers_tray.glb").then((obj) => {
            obj.name = "checkersTray";
            this.registerObject(new Tray(obj.name, obj));
        });

        const modelWhitePawn: Promise<Object3D> = this.loadGLTFSceneModel(loader, "checkers/pawn_white.glb")
        const modelBlackPawn: Promise<Object3D> = this.loadGLTFSceneModel(loader, "checkers/pawn_black.glb");

        this.ws.on("setup game", (pawns: { name: string; x: number; y: number; z: number; dead: boolean; queen: boolean }[], gameInfo: {team: string; canPlay: boolean}): void => {
            this.setupGame(pawns, modelWhitePawn, modelBlackPawn, gameInfo);
        })

        this.ws.on("rollback game", (pawns: { name: string; x: number; y: number; z: number; dead: boolean; queen: boolean }[], team: string): void => {
            pawns.forEach((pawn) => {
                const pawnObj: Pawn | undefined = this.getObject(pawn.name) as Pawn;
                if (pawnObj) {
                    pawnObj.setPositionTo(pawn.x, pawn.y, pawn.z);
                }
            })
        })

        this.ws.on("pawn action", (actions: Action[], gameInfo: {team: string, canPlay: boolean}) => {

            const toKill: any[] = [];
            actions.forEach((action) => {
                const pawn: Pawn | undefined = this.getObject(action.pawn) as Pawn;
                if (pawn) {

                    if (action.pawnKilled) {

                        toKill.push(() => {
                            //@ts-ignore
                            this.killPawn(action.pawnKilled);
                        });
                    }

                    if (actions.indexOf(action) == actions.length-1) {
                        pawn.moveTo(action.moveX, action.moveY, action.moveZ, () => {
                            toKill.forEach((kill) => kill());

                            if (gameInfo) {
                                this.team = gameInfo.team;
                                this.canPlay = gameInfo.canPlay;
                            }
                        });
                    } else {
                        pawn.moveTo(action.moveX, action.moveY, action.moveZ);
                    }
                }
            });

            this.showSelectedObjectActuators();
        })


    }

    /**
     * Initialise la partie.
     *
     * @param pawns liste des pions
     * @param modelWhitePawn modèle des pions blanc
     * @param modelBlackPawn modèles des pions noire
     * @param team équipe du joueur
     * @private
     */
    private setupGame(pawns: {
        name: string;
        x: number;
        y: number;
        z: number;
        dead: boolean;
        queen: boolean
    }[], modelWhitePawn: Promise<Object3D>, modelBlackPawn: Promise<Object3D>, gameInfo: {team: string, canPlay: boolean}) {

        pawns.forEach((pawn) => {
            // filtre pour les pions mort
            if (!pawn.dead) {
                if (pawn.name.includes("white")) {
                    this.registerPawn(modelWhitePawn, pawn);
                } else if (pawn.name.includes("black")) {
                    this.registerPawn(modelBlackPawn, pawn);
                }
            }

        })

        this.team = gameInfo.team;
        this.canPlay = gameInfo.canPlay;

        if (this.team == "white" || this.team == "black") {

            const side: number = this.team == "white" ? -1 : 1;
            const camera: PerspectiveCamera = this.getCamera();
            camera.position.y = 40;
            camera.position.z = 35 * side;

            const controls: OrbitControls = this.getOrbitControls();
            controls.enableDamping = true; // autoriser le contrôle de la caméra (distance, rotation, déplacement)
            //controls.enablePan = false; //désactiver les déplacements de la caméra
            let angle = 6 * Math.PI / 10;
            controls.minAzimuthAngle = -angle + (side > 0 ? 0 : Math.PI);
            controls.maxAzimuthAngle = angle + (side > 0 ? 0 : Math.PI);
            controls.minDistance = 15;
            controls.maxTargetRadius = 25;
            controls.rotateSpeed = 0.5;
            controls.maxDistance = 85;

            controls.saveState();


            this.getOrbitControls().saveState();
        }
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
            const pawn: Pawn = (this.selectedObject as Pawn);
            if (!(pawn.dead)) {
                this.showPawnActuators(pawn);
            } else {
                // enlever la sélection
                this.unselectAll();
            }
        }
    }

    private showPawnActuators(pawn: Pawn) {
        const pos: Vector3 = pawn.position;
        const geometry: BoxGeometry = new BoxGeometry(6, 0.5, 6);

        let canUse = false
        if (this.team) {
            canUse = pawn.getName().includes(this.team);
        }

        const material: MeshBasicMaterial = new MeshBasicMaterial({color: canUse ? 0x68d0fc : 0xfcdf03});
        material.transparent = true;
        material.opacity = 0.65;

        const pawns: Pawn[] = this.getPawns(); // optimale
        let n: number = 1; // compte le nombre d'actionneurs enregistré


        let sideMoveUp: number = 1; // Sens primaire du pion
        if (pawn.getName().includes("black")) {
            sideMoveUp = -1;
        }
        if (pawn.queen) {
            for (let i: number = -1; i <= 1; i+=2) {
                const pasZ = i * 6;
                for (let j: number = -1; j <= 1; j+=2) {
                    const pasX = j * 6;

                    let x: number = pos.x + pasX;
                    let z: number = pos.z + pasZ;
                    let _pawn: Pawn | undefined = this.anyPawnAt(new Vector3(x, pos.y, z), pawns);

                    while (Math.abs(x) <= 21 && Math.abs(z) <= 21 && !(_pawn && pawn.getName().includes(_pawn.getName().split("-")[0]))) {
                        if (!_pawn) {
                            this.registerPawnActuator(geometry, material, x, pos.y, z, "actuator-" + pawn.name + "" + n, pawn);
                            n++;
                        }

                        x+=pasX;
                        z+=pasZ;
                        _pawn = this.anyPawnAt(new Vector3(x, pos.y, z), pawns);
                    }

                }
            }
        } else {
            // actions des mouvements en avant simple + prises en avant
            for (let i: number = -1; i <= 1; i += 2) {
                let x: number = pos.x + i * 6;
                let z: number = pos.z + sideMoveUp * 6; // devant

                let _pawn: Pawn | undefined = this.anyPawnAt(new Vector3(x, pos.y, z), pawns);
                if (Math.abs(x) <= 21 && Math.abs(z) <= 21) {
                    if (!_pawn) { // s'il n'y a aucun pion alors...
                        this.registerPawnActuator(geometry, material, x, pos.y, z, "actuator-" + pawn.name + "" + n, pawn);
                        n++;
                    } else if (!pawn.getName().includes(_pawn.getName().split("-")[0])) { // il y a un pion donc si il est dans l'équipe adverse action de prise si possible
                        x += i * 6;
                        z += sideMoveUp * 6;

                        _pawn = this.anyPawnAt(new Vector3(x, pos.y, z), pawns);
                        if (!_pawn && Math.abs(x) <= 21 && Math.abs(z) <= 21) {
                            this.registerPawnActuator(geometry, material, x, pos.y, z, "actuator-" + pawn.name + "" + n, pawn);
                            n++;
                        }
                    }
                }
            }

            // actions de prises de pions en arrière
            for (let i: number = -1; i <= 1; i += 2) {
                let x: number = pos.x + i * 6;
                let z: number = pos.z - sideMoveUp * 6; // derrière

                let _pawn: Pawn | undefined = this.anyPawnAt(new Vector3(x, pos.y, z), pawns);
                if (Math.abs(x) <= 21 && Math.abs(z) <= 21) {
                    if (_pawn && !pawn.getName().includes(_pawn.getName().split("-")[0])) { // s'il y a un pion.

                        x += i * 6;
                        z -= sideMoveUp * 6;

                        _pawn = this.anyPawnAt(new Vector3(x, pos.y, z), pawns);
                        if (!_pawn && Math.abs(x) <= 21 && Math.abs(z) <= 21) {
                            this.registerPawnActuator(geometry, material, x, pos.y, z, "actuator-" + pawn.name + "" + n, pawn);
                            n++;
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
        this.selectedActuator = undefined;
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
            if (pawn.position.equals(pos)) {
                return pawn;
            }
        }

        return;
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

    private killPawn(name: string) {
        const pawnKilled: Pawn | undefined = this.getObject(name) as Pawn;

        if (pawnKilled) {
            pawnKilled.kill();
            console.log("ce pion est tué: ", name);
            this.objectRegistry.delete(name);
            if (this.selectedObject?.getName() == pawnKilled.getName()) {
                this.unselectAll();
            }
        }
    }

}