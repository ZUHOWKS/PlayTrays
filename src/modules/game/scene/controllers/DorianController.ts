import SupportController from "@/modules/game/scene/SupportController";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import {BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene} from "three";
import type {Ref} from "vue";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Socket} from "socket.io-client";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import Tray from "@/modules/game/scene/objects/Tray";
import {arcade} from "@/modules/game/scene/objects/DorianGameObjects/Cards";
import {prison} from "@/modules/game/scene/objects/DorianGameObjects/Prison";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import {playerPawn} from "@/modules/game/scene/objects/DorianGameObjects/PlayerPawn";

export default class DorianGame extends SupportController{
    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls>, ws: Socket) {
        super(scene, cameraRef, orbitControlsRef, ws);
    }
    confirmAction(): void {
    }

    defaultCamera(): void {
        this.getObject("Prison")?.select();
    }

    getSelectedActuator(): Actuator | null | undefined {
        return undefined;
    }

    selectActuator(name: string): void {
    }

    setup(): void {
        const loader = new GLTFLoader();
        this.loadGLTFSceneModel(loader, "DorianGame/dorianTray.glb").then((obj) => {
            const tray = new Tray("DorianTray", obj);
            //tray.selectable = false;
            this.registerObject(tray)
        });
        this.loadGLTFSceneModel(loader, "DorianGame/prison.glb").then((obj) => {
            this.registerObject(new prison("Prison", obj))
        });
        this.loadGLTFSceneModel(loader, "DorianGame/pion.glb").then((obj) => {
            this.registerObject(new playerPawn("PlayerPawn", obj))
        });
    }

    showSelectedObjectActuators(): void {
    }

    unselectAll(): void {
    }
    /*
    setupGame(): void {
        const players : {
            name: string;
            x: number;
            y: number;
            z: number;
            cards : {cardName: string;};
            money: number;
            civilisation : number;
            pawnModel : PTObject;
        }[] = [];
        const cardlist : {
            cardName: string;
            x: number;
            y: number;
            z: number;
            playerName: null | string;
            houses: number | null;
            //cardModel : PTObject;
        }[] = [];

    }
    */
}