import SupportController from "@/modules/game/scene/SupportController";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import {
    BoxGeometry,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    Vector3
} from "three";
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
import Pawn from "@/modules/game/scene/objects/Pawn";

export default class DorianGame extends SupportController{

    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls>, ws: Socket) {
        super(scene, cameraRef, orbitControlsRef, ws);
    }
    confirmAction(): void {
    }

    defaultCamera(): void {
        //this.displayCardHUD();
    }

    getSelectedActuator(): Actuator | null | undefined {
        return undefined;
    }

    selectActuator(name: string): void {
    }

    unselectObject() {
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

        //Abaisse la carte d'information si l'objet cliqué est la même carte que celle deja en mémoire
        if (this.selectedObject && this.selectedObject instanceof CaseSelector && this.selectedObject.getName() == name) {(document.getElementsByClassName("hud")[0] as HTMLElement).style.transform = "translateY(60vh)";}

        //Sinon on effectue le code classique
        else{

        super.selectObject(name);

        //Si l'objet selectionné est une caseselector, on applique des modififcations en fonction du type de la case
        if (this.selectedObject && this.selectedObject instanceof CaseSelector) {
            const tempcase: CaseSelector = this.selectedObject as CaseSelector;
            if (tempcase.case.caseType == "start") {
            } else if (tempcase.case.caseType == "prison") {
                this.getObject("Prison")?.select();
            } else if (tempcase.case.caseType == "bank") {
            } else if (tempcase.case.caseType == "war") {
            } else if (tempcase.case.caseType == "chance") {
            } else if (tempcase.case.caseType == "bataille") {
            } else {
                //Ajoute les parametres propres aux villes dans la carte d'information
                (document.getElementsByClassName("name")[0] as HTMLElement).innerText = ""+tempcase.case.cityName;
                (document.getElementsByClassName("title")[0] as HTMLElement).style.backgroundColor = tempcase.case.colorCase;
                (document.getElementsByClassName("price-default")[0] as HTMLElement).innerText = "£"+tempcase.case.m0;
                (document.getElementsByClassName("price-1")[0] as HTMLElement).innerText = "£"+tempcase.case.m1;
                (document.getElementsByClassName("price-2")[0] as HTMLElement).innerText = "£"+tempcase.case.m2;
                (document.getElementsByClassName("price-3")[0] as HTMLElement).innerText = "£"+tempcase.case.m3;
                (document.getElementsByClassName("price-4")[0] as HTMLElement).innerText = "£"+tempcase.case.m4;
                (document.getElementsByClassName("price-5")[0] as HTMLElement).innerText = "£"+tempcase.case.m5;
                (document.getElementsByClassName("price-hotel")[0] as HTMLElement).innerText = "£"+tempcase.case.maison + "\nplus 4 maisons";
                (document.getElementsByClassName("price-maison")[0] as HTMLElement).innerText = "£"+tempcase.case.maison;



                (document.getElementsByClassName("hud")[0] as HTMLElement).style.transform = "translateY(0vh)";
            }

            //Juste pour les tests (avance jusque la case et affiche des choses importantes)
            //this.getObject("PlayerPawn3")?.select(tempcase.case.casePawnX, tempcase.case.casePawnY);
            //this.displayCardHUD();

            //Tests pour verifier les coordonnées
            console.log("Carte choisie: " + tempcase.case.caseType + ".\nVoici les coordonnées: " + tempcase.case.casePawnX + ", " + tempcase.case.casePawnY + "\nVoici l'addition des cos: " + tempcase.case.casePawnX + tempcase.case.casePawnY);

        }
    }
        }
    // Inutile car trop d'inconvénients
    displayCardHUD(): void {
        const cam = this.getCamera();

        const direction = new Vector3();
        cam.getWorldDirection(direction);

        const geometry = new PlaneGeometry(1.5, 2);
        const material = new MeshBasicMaterial({ color: 0x000000});

        const cubeTest : Mesh<PlaneGeometry, MeshBasicMaterial> = new Mesh(geometry, material);

        cubeTest.position.copy(cam.position).addScaledVector(direction, 5);
        cubeTest.lookAt(cam.position);

        this.scene.add(cubeTest);

        console.log("position: \nx: " + Math.round(cam.position.x) + "\ny: " + Math.round(cam.position.y) + "\nz: " + Math.round(cam.position.z) + "\n\nrotation: \nx: " + (cam.rotation.x).toFixed(2) + "\ny: " + Math.round(cam.rotation.y) + "\nz: " + Math.round(cam.rotation.z));
    }


}
