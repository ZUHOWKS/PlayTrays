import SupportController from "@/modules/game/scene/SupportController";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import {BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene} from "three";
import type {Ref} from "vue";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Socket} from "socket.io-client";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import Tray from "@/modules/game/scene/objects/Tray";
import {arcade} from "@/modules/game/scene/objects/DorianGameObjects/Cards";
import {prison} from "@/modules/game/scene/objects/DorianGameObjects/Prison";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import {playerPawn} from "@/modules/game/scene/objects/DorianGameObjects/PlayerPawn";
import {CaseSelector} from "@/modules/game/scene/objects/DorianGameObjects/CaseSelector";

export default class DorianGame extends SupportController{
    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls>, ws: Socket) {
        super(scene, cameraRef, orbitControlsRef, ws);
    }
    confirmAction(): void {
    }

    defaultCamera(): void {
    }

    getSelectedActuator(): Actuator | null | undefined {
        return undefined;
    }

    selectActuator(name: string): void {
    }

    // Permet d'initialiser le jeu DorianGame lors du lancement de la page
    setup(): void {
        const loader = new GLTFLoader();

        //Ajout d'un plateau
        this.loadGLTFSceneModel(loader, "DorianGame/dorianTray.glb").then((obj) => {
            const tray = new Tray("DorianTray", obj);

            //Rend le plateau inselectable
            tray.selectable = false;
            this.registerObject(tray)
        });

        //Ajout de la prison
        this.loadGLTFSceneModel(loader, "DorianGame/prison.glb").then((obj) => {
            this.registerObject(new prison("Prison", obj))
        });

        //Ajout des 4 pions
        this.loadGLTFSceneModel(loader, "DorianGame/pionRouge.glb").then((obj) => {
            this.registerObject(new playerPawn("PlayerPawn1", obj))
        });
        this.loadGLTFSceneModel(loader, "DorianGame/pionBleu.glb").then((obj) => {
            this.registerObject(new playerPawn("PlayerPawn2", obj))
        });
        this.loadGLTFSceneModel(loader, "DorianGame/pionVeigar.glb").then((obj) => {
            this.registerObject(new playerPawn("PlayerPawn3", obj))
        });
        this.loadGLTFSceneModel(loader, "DorianGame/pionDrake.glb").then((obj) => {
            this.registerObject(new playerPawn("PlayerPawn4", obj))
        });

        // Ajout de plans PTObjects que l'on rend invisible pour permettre de rendre les cartes du plateau selectionnables
        //Ajout des plans des coins
        this.addPlaneOnTray(2.9, 2.9, 9.48458, 9.53537, "StartCard", 0, 0);
        this.addPlaneOnTray(2.92, 2.92, -9.48716, 9.529, "PrisonCard", 10, 0);
        this.addPlaneOnTray(2.92, 2.92, -9.48716, -9.529, "BankCard", 10, 10);
        this.addPlaneOnTray(2.92, 2.92, 9.48716, -9.529, "WarCard", 0, 10);

        //Boucle pour setup les plans restants
        for (let i : number = 0; i < 9; ++i) {
            this.addPlaneOnTray(1.71969, 2.88127, 7.10946 - 1.7767 * i, 9.54623, "card_" + (i+1), i+1, 0);
            this.addPlaneOnTray(2.89, 1.74, -9.49878, 7.0904 - 1.7788 * i, "card_" + (i+11), 10, i+1);
            this.addPlaneOnTray(1.71969, 2.88127, -7.10946 + 1.7767*i, -9.49983, "card_" + (i+21), 10-(i+1), 10);
            this.addPlaneOnTray(2.89, 1.74, 9.4985, -7.14 +1.7788 * i, "card_" + (i+31), 0, 10-(i+1));
        }
    }

    //Cree un plan et le register
    addPlaneOnTray(width : number, height : number, posx : number, posz : number, objectName : string, caseX : number, caseY : number) : void {
        const geometry = new PlaneGeometry(width, height);
        const material = new MeshBasicMaterial( { color: 0x000000 } );

        //Rend le mesh invisible mais laisse la surbrillance lorsque la souris passe sur la carte
        material.transparent = true;
        material.opacity = 0;
        const plane = new Mesh( geometry, material );

        //Modification du plan et de ses coordonnées
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(posx,0.16, posz);
        plane.visible = true;
        this.registerObject(new CaseSelector(objectName, plane, caseX, caseY));
    }

    showSelectedObjectActuators(): void {
    }

    unselectAll(): void {
    }
    selectObject(name: string) {
        super.selectObject(name);

        //Si l'objet selectionné est une caseselector, on applique des modififcations en fonction du type de la case
        if (this.selectedObject && this.selectedObject instanceof CaseSelector){
            const tempcase : CaseSelector = this.selectedObject as CaseSelector;
            if (tempcase.case.caseType == "start"){}
            else if (tempcase.case.caseType == "prison"){this.getObject("Prison")?.select();}
            else if (tempcase.case.caseType == "bank"){}
            else if (tempcase.case.caseType == "war"){}
            else if (tempcase.case.caseType == "chance"){}
            else if (tempcase.case.caseType == "bataille"){}
            else {}

            //Juste pour les tests (avance jusque la case et affiche des choses importantes)
            this.getObject("PlayerPawn3")?.select(tempcase.case.casePawnX, tempcase.case.casePawnY);
            console.log("Carte choisie: " + tempcase.case.caseType + ".\nVoici les coordonnées: " + tempcase.case.casePawnX + ", "+ tempcase.case.casePawnY + "\nVoici l'addition des cos: " + tempcase.case.casePawnX + tempcase.case.casePawnY);
        }

    }
}