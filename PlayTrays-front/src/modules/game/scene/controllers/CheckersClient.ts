import SupportController from "@/modules/game/scene/SupportController";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import Tray from "@/modules/game/scene/objects/Tray";
import {BoxGeometry, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, Vector3} from "three";
import type {Ref} from "vue";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Socket} from "socket.io-client";
import Pawn from "@/modules/game/scene/objects/checkers/Pawn";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import ActuatorObject from "@/modules/game/scene/objects/ActuatorObject";
import {ModelLoader} from "@/modules/utils/scene/ModelLoader";
import type {UserInterface} from "@/modules/utils/UserInterface";


interface Action {
    pawn: string;
    queen: boolean
    moveX: number;
    moveY: number;
    moveZ: number;
    pawnKilled: string | undefined;
}

export default class CheckersClient extends SupportController {

    team: string | undefined;
    canPlay: boolean = false;
    timer: number = 0;

    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls>, ws: Socket, player: UserInterface) {
        super(scene, cameraRef, orbitControlsRef, ws, player);
    }

    /**
     * Permet d'initialiser tous les évènements liés à la partie
     */
    setup(loaderFiller?: Ref<boolean>): void {

        // on génére par défaut le plateau de jeu
        ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, "checkers/checkers_tray.glb").then((obj) => {
            obj.name = "checkersTray";
            this.registerObject(new Tray(obj.name, obj));
        });

        // on précharge les modèles des pions
        const modelWhitePawn: Promise<Object3D> = ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, "checkers/pawn_white.glb")
        const modelBlackPawn: Promise<Object3D> = ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, "checkers/pawn_black.glb");

        // configuration de la partie selon le serveur
        this.ws.on("setup game", async (pawns: { name: string; x: number; y: number; z: number; dead: boolean; queen: boolean }[], gameInfo: {team: string; canPlay: boolean, timer: number}, callback) => {
            
            this.timer = gameInfo.timer;

            await this.setupGame(pawns, modelWhitePawn, modelBlackPawn, gameInfo);
            callback(undefined, {loaded: true});
        })

        this.ws.on('start', (gameInfo: {team: string; canPlay: boolean, timer: number}, users: string[]) => {
            if (loaderFiller) setTimeout(() => {
                loaderFiller.value = false;

                setTimeout(() => {
                    (document.querySelector('.starter-user#user1') as HTMLElement).innerText = users[0];
                    (document.querySelector('.starter-user#user2') as HTMLElement).innerText = users[1];
                }, 200)

            }, 1000);
            this.timer = gameInfo.timer;
            this.team = gameInfo.team;
            this.canPlay = gameInfo.canPlay;


        })

        this.ws.on('timer', (timer: number) => {
            this.timer = timer
            const minutes: number = Math.floor(this.timer / 60);
            const secondes: number = this.timer - minutes * 60;

            (document.querySelector('.timer p') as HTMLElement).innerText = "" + (minutes < 10 ? '0' + minutes : minutes) + ':' + (secondes < 10 ? '0' + secondes : secondes)
        })

        // en cas de désynchronisation
        this.ws.on("rollback game", (pawns: { name: string; x: number; y: number; z: number; dead: boolean; queen: boolean }[], team: string): void => {
            pawns.forEach((pawn) => {
                const pawnObj: Pawn | undefined = this.getObject(pawn.name) as Pawn;
                if (pawnObj) {
                    pawnObj.setPositionTo(pawn.x, pawn.y, pawn.z);
                }
            })
        })

        // exécuté une ou plusieurs actions d'un même pion
        this.ws.on("pawn action", (actions: Action[], gameInfo: {team: string, canPlay: boolean, timer: number}) => {

            this.timer = gameInfo.timer;
            const _toRefreshSelection: string | undefined = this.selectedObject?.name;

            if (actions.length == 0) {
                this.team = gameInfo.team;
                this.canPlay = gameInfo.canPlay;
            } else {
                this.unselectAll();
            }

            /*

            Dans le jeu des dames, il existe une règle selon laquelle tous les pions qui ont été pris lors d'une série
            de coup ne doivent être retirer qu'après que le pion

             */

            const toKill: any[] = []; // liste des pions à tuer
            actions.forEach((action) => {
                const pawn: Pawn | undefined = this.getObject(action.pawn) as Pawn;

                if (pawn) {

                    if (action.pawnKilled) {

                        toKill.push(() => { // on push dans la liste des pions pris
                            //@ts-ignore
                            this.killPawn(action.pawnKilled);
                        });
                    }

                    if (action.queen) {
                        (this.getObject(action.pawn) as Pawn).queen = action.queen;
                    }

                    if (actions.indexOf(action) == actions.length-1) { // lorsqu'il s'agit de la dernière action, on enlève tous les pions du plateau
                        pawn.moveTo(action.moveX, action.moveY, action.moveZ, () => {
                            toKill.forEach((kill) => kill());

                            if (gameInfo) {

                                this.team = gameInfo.team;
                                this.canPlay = gameInfo.canPlay;
                            }

                            if (_toRefreshSelection) {
                                this.selectObject(_toRefreshSelection);
                                this.showSelectedObjectActuators();
                            } // on actualise la sélection
                        });


                    } else {
                        pawn.moveTo(action.moveX, action.moveY, action.moveZ);
                    }
                }
            });


        })

        // évènement de fin de partie
        this.ws.on('end game', (whoWin: string)  => {
            (document.querySelector('.end-annonce') as HTMLElement).style.visibility = 'visible';
            (document.querySelector('#userCongregated') as HTMLElement).innerText = whoWin;
            setTimeout(() => this.ws.disconnect(), 30000)
        })

    }

    /**
     * Initialise la partie.
     *
     * @param pawns liste des pions
     * @param modelWhitePawn modèle des pions blanc
     * @param modelBlackPawn modèles des pions noire
     * @param gameInfo informations de parties
     * @private
     */
    private async setupGame(pawns: {
        name: string;
        x: number;
        y: number;
        z: number;
        dead: boolean;
        queen: boolean
    }[], modelWhitePawn: Promise<Object3D>, modelBlackPawn: Promise<Object3D>, gameInfo: {team: string, canPlay: boolean}) {

        const whitePawn: Object3D = await modelWhitePawn;
        const blackPawn: Object3D = await modelBlackPawn;

        for (const pawn of pawns) {
            // filtre pour les pions mort
            if (!pawn.dead) {
                if (pawn.name.includes("white")) {
                    await this.registerPawn(whitePawn, pawn);
                } else if (pawn.name.includes("black")) {
                    await this.registerPawn(blackPawn, pawn);
                }
            }
        }

        this.team = gameInfo.team;
        this.canPlay = gameInfo.canPlay;

        // configuration spéciale de la caméra selon que l'on soit dans l'équipe blanc ou noir
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

    /**
     * Set les paramètres caméra à par défaut.
     */
    defaultCamera(): void {
        const camera: PerspectiveCamera = this.getCamera();
        camera.position.y = 40;
        camera.position.z = 35 * (this.team == "white" ? -1 : 1);
    }

    /**
     * Enregistre le pion.
     *
     * @param modelPawn
     * @param pawn
     * @private
     */
    private async registerPawn(modelPawn: Object3D, pawn: {
        name: string;
        x: number;
        y: number;
        z: number;
        dead: boolean;
        queen: boolean;
    }) {
        const obj: Object3D =  modelPawn.clone();
        obj.name = pawn.name;
        obj.position.x = pawn.x;
        obj.position.y = pawn.y;
        obj.position.z = pawn.z;
        this.registerObject(new Pawn(obj.name, obj, pawn.dead, pawn.queen));
    }

    /**
     * Sélectionner un object
     *
     * @param name identifiant de l'objet à sélectionner
     */
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

    /**
     * Afficher les actions liées à l'objet sélectionné.
     */
    showSelectedObjectActuators(): void {

        this.removeActuators();


        if (this.getSelectedObject() && this.getSelectedObject() instanceof Pawn) { // vérifie s'il s'agit d'un pion
            const pawn: Pawn = (this.getSelectedObject() as Pawn);
            if (!(pawn.dead)) {
                this.showPawnActuators(pawn);
            } else {
                // enlever la sélection
                this.unselectAll();
            }
        }
    }

    /**
     * Afficher les actions liées à au pion sélectionné.
     */
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

            // action de mouvement d'une reine
            for (let i: number = -1; i <= 1; i+=2) {
                const pasZ = i * 6;
                for (let j: number = -1; j <= 1; j+=2) {
                    const pasX = j * 6;

                    let x: number = pos.x + pasX;
                    let z: number = pos.z + pasZ;
                    let _pawn: Pawn | undefined = this.anyPawnAt(new Vector3(x, pos.y, z), pawns);

                    // tant qu'on ne recontre pas de pion on enregistre une action possible
                    while (Math.abs(x) <= 21 && Math.abs(z) <= 21 && !(_pawn && pawn.getName().includes(_pawn.getName().split("-")[0]))) {
                        if (!_pawn) {
                            this.registerPawnActuator(geometry, material, x, pos.y, z, "actuator-" + pawn.name + "" + n, pawn);
                            n++;
                            x+=pasX;
                            z+=pasZ;
                            _pawn = this.anyPawnAt(new Vector3(x, pos.y, z), pawns);
                        } else {
                            break
                        }
                    }

                    // s'il y a un pion de l'équipe adverse sur le chemin...
                    if (_pawn && !pawn.getName().includes(_pawn.getName().split("-")[0])) {
                        x+=pasX;
                        z+=pasZ;

                        // ...alors tant qu'il n'y a d'autre pion >> enregistrer une action
                        while (!(this.anyPawnAt(new Vector3(x, pos.y, z), pawns)) && Math.abs(x) <= 21 && Math.abs(z) <= 21) {
                            this.registerPawnActuator(geometry, material, x, pos.y, z, "actuator-" + pawn.name + "" + n, pawn);
                            n++;
                            x+=pasX;
                            z+=pasZ;
                        }
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
                    if (_pawn && !pawn.getName().includes(_pawn.getName().split("-")[0])) { // s'il y a un pion de l'équipe adverse...

                        x += i * 6;
                        z -= sideMoveUp * 6;

                        _pawn = this.anyPawnAt(new Vector3(x, pos.y, z), pawns);
                        if (!_pawn && Math.abs(x) <= 21 && Math.abs(z) <= 21) { // si l'action est possible...
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

    /**
     * Désélectionner l'objet et les actions liées à ce premier
     */
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

    /**
     * Considérer un pion comme pris.
     *
     * @param name
     * @private
     */
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

    /**
     * Sélectionner une action en fonctionnant de son identifiant.
     *
     * @param name identifiant de l'actionneur
     */
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

    /**
     * Confirmer et exécuter l'action sélectionnée.
     */
    confirmAction(): void {
        if (this.getSelectedActuator()) {


            // Lorsque l'actionneur est un objet
            if (this.getSelectedActuator() instanceof ActuatorObject) {

                // Lorsque que le sujet est pion
                this.performPawnAction();
            }
        }

        this.selectedActuator = undefined;
    }

    /**
     * Executer l'action du pion séléctionné.
     *
     * @private
     */
    private performPawnAction() {

        const subject: PTObject | undefined = this.getSelectedActuator()?.getSubject();
        if (subject instanceof Pawn && this.team && this.canPlay && this.timer > 0) {
            if (subject.name.includes(this.team)) {

                // position de l'actionneur dans l'espace
                const actPos: Vector3 = (this.getSelectedActuator() as ActuatorObject).getObject3D().position;

                this.unselectAll();
                subject.moveTo(actPos.x, actPos.y, actPos.z);

                this.ws.emit("pawn action",
                    ({
                        pawn: subject.getName(),
                        queen: subject.queen,
                        moveX: actPos.x,
                        moveY: actPos.y,
                        moveZ: actPos.z,
                    } as Action), (error: any, response: any) => { // Callback
                        if (error) {
                            console.error(error);
                            if (response.rollback) {
                                response.pawns.forEach((pawn: any) => {
                                    const pawnObj: Pawn | undefined = this.getObject(pawn.name) as Pawn;
                                    if (pawnObj) {
                                        pawnObj.dead = pawn.dead;
                                        pawnObj.queen = pawn.dead
                                        pawnObj.setPositionTo(pawn.x, pawn.y, pawn.z);
                                    }
                                })
                            }
                        } else if (response) {

                            this.timer = response.timer;

                            const actions: Action[] = response.actions as Action[];
                            const firstPawnToKill = response.actions[0].pawnKilled;

                            if (actions[0].queen) {
                                (this.getObject(actions[0].pawn) as Pawn).queen = actions[0].queen;
                            }

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

                                        if (action.queen) {
                                            (this.getObject(action.pawn) as Pawn).queen = action.queen;
                                        }

                                        if (actions.indexOf(action) == actions.length-1) {
                                            pawn.moveTo(action.moveX, action.moveY, action.moveZ, () => {
                                                toKill.forEach((kill) => kill());
                                            });

                                        } else {
                                            pawn.moveTo(action.moveX, action.moveY, action.moveZ);
                                        }
                                    }
                                });

                                if (actions.length == 0) {
                                    toKill[0]();
                                }

                                this.team = response.team;
                                this.canPlay = response.canPlay;
                            }
                        }
                    }
                );
            }
        }
    }

}