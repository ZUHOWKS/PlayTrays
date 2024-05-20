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
import {prison} from "@/modules/game/scene/objects/DorianGameObjects/Prison";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import {playerPawn} from "@/modules/game/scene/objects/DorianGameObjects/PlayerPawn";
import {CaseSelector} from "@/modules/game/scene/objects/DorianGameObjects/CaseSelector";
import Pawn from "@/modules/game/scene/objects/Pawn";
import {de} from "@/modules/game/scene/objects/DorianGameObjects/De";
import type {cardTypeInterface} from "@/modules/game/scene/objects/DorianGameObjects/CardHelper";
import {TownCard} from "@/modules/game/scene/objects/DorianGameObjects/cards/TownCard";
import {cardConfig} from "@/modules/game/scene/objects/DorianGameObjects/cards/CardConfig";
import {Card} from "@/modules/game/scene/objects/DorianGameObjects/cards/Card";
import {maison} from "@/modules/game/scene/objects/DorianGameObjects/Maison";
import { instance } from "three/examples/jsm/nodes/Nodes.js";


interface Players{
    name: string;
    city: string[];
    exitPrison: number;
    money: number;
    caseNb: number;
    id: number;
    playerName: string;
    pawnName: string;
}


export default class DorianGame extends SupportController{

    previousObjectSelected: PTObject | undefined;
    players: Map<number, Players>;
    cards: Map<number, Card>;

    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls>, ws: Socket) {
        super(scene, cameraRef, orbitControlsRef, ws);
        this.players = new Map();
        this.cards = new Map();
    }
    confirmAction(): void {
    }

    defaultCamera(): void {
        //this.displayCardHUD();
    }

    getSelectedActuator(): Actuator | null {
        return null;
    }

    selectActuator(name: string): void {
    }

    unselectObject() {
        this.previousObjectSelected = this.getSelectedObject();
        super.unselectObject();
    }

    // Permet d'initialiser le jeu DorianGame lors du lancement de la page
    setup(): void {
        const loader = new GLTFLoader();

        this.setupCard();

        //Ajout d'un plateau
        this.setupTray(loader);

        //Ajout de la prison
        this.setupPrison(loader);

        // Ajout de plans PTObjects que l'on rend invisible pour permettre de rendre les cartes du plateau selectionnables
        this.setupPlanes();

        this.setupHouses();

        this.setupDe();

        this.ws.on("PlayerJoin", (player : Players) : void => {
            this.setupPawn(loader, player);
            this.updateVariables();
        })

        this.ws.on("Paiement", (prix, player) => {
            console.log("Vous avez payé: ", prix);
            (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + player.money;
            this.updateVariables();
        })

        this.ws.on("Passage case départ", (money) => {
            (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + money;
            console.log("passage à la case départ");
        })

        this.ws.on("Update", ()=>{this.updateVariables()})

        this.ws.on("pawnMove", (id, r) => {
            const pawnToMove = (this.getObject("pion" + id) as playerPawn | undefined);
            if (pawnToMove) {
                for (let i = 0 ; i < r; i++){
                    pawnToMove.moveCase();
                }
            }
            this.updateVariables();
        })

        this.ws.on("Carte chance argent", (chanceCard: {message: string, aideReal: number}, player) => {
            (document.getElementsByClassName("chance-texte")[0] as HTMLElement).innerText = ""+chanceCard.message;
            (document.getElementsByClassName("card-chance")[0] as HTMLElement).style.visibility = "visible";
            (document.querySelector('#Ok') as HTMLElement).onclick = () => {
                (document.getElementsByClassName("card-chance")[0] as HTMLElement).style.visibility = "hidden";
                (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + (player.money);
                this.ws.emit("FinTour");
            }
            this.updateVariables();
        })

        this.ws.on("Carte chance deplacement", (chanceCard: {message: string, aideReal: {nbCase: number, caseX: number, caseY: number, depart: boolean, prison: boolean}}, player) => {
            (document.getElementsByClassName("chance-texte")[0] as HTMLElement).innerText = ""+chanceCard.message;
            (document.getElementsByClassName("card-chance")[0] as HTMLElement).style.visibility = "visible";
            (document.querySelector('#Ok') as HTMLElement).onclick = () => {
                (document.getElementsByClassName("card-chance")[0] as HTMLElement).style.visibility = "hidden";
                (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + (player.money);

                const tempPion : playerPawn | undefined = (this.getObject("pion" + player.id) as playerPawn | undefined);
                const tempPrison: prison | undefined = (this.getObject("Prison") as prison | undefined);
                if (tempPion){
                    tempPion.moveTo(chanceCard.aideReal.caseX, chanceCard.aideReal.caseY);
                }
                if (tempPrison && chanceCard.aideReal.prison) {
                    tempPrison.down();
                }
                this.ws.emit("FinTour");
            }
            this.updateVariables();
        })

        this.ws.on("joueur en prison", (player) => {
            const tempPrison: prison | undefined = (this.getObject("Prison") as prison | undefined);
            const tempPion : playerPawn | undefined = (this.getObject("pion" + player.id) as playerPawn | undefined);
            if (tempPion){
                tempPion.moveTo(10, 0);
            }
            if (tempPrison) {
                tempPrison.down();
            }

        })

        this.ws.on("retirer prison", () => {
            const tempPrison: prison | undefined = (this.getObject("Prison") as prison | undefined);
            if (tempPrison) {
                tempPrison.up();
            }
        })

        this.ws.on("UpdateHUD", (money) => {(document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + money;})

        this.ws.on("MaisonPossible", (maxHouse: number, caseInfo: TownCard)=>{

            console.log("Query test: ", (document.querySelector('#quit-house') as HTMLElement));

            this.displayCard(caseInfo, 2);
            (document.getElementsByClassName("card-action-maison")[0] as HTMLElement).style.visibility = "visible";
            (document.querySelector('#one') as HTMLElement).onclick = () => {this.achatNbMaison(maxHouse, caseInfo, 1);}

            (document.querySelector('#two') as HTMLElement).onclick = () => {this.achatNbMaison(maxHouse, caseInfo, 2);}

            (document.querySelector('#three') as HTMLElement).onclick = () => {this.achatNbMaison(maxHouse, caseInfo, 3);}

            (document.querySelector('#four') as HTMLElement).onclick = () => {this.achatNbMaison(maxHouse, caseInfo, 4);}

            (document.querySelector('#five') as HTMLElement).onclick = () => {this.achatNbMaison(maxHouse, caseInfo, 5);}

            (document.querySelector('#quit-house') as HTMLElement).onclick = () => {
                this.ws.emit("FinTour");
                (document.getElementsByClassName("card-action-maison")[0] as HTMLElement).style.visibility = "hidden";
            }

        })

        this.ws.on("CasePossible", (caseInfo: any, player: Players, achat: boolean, id: number) => {

            this.displayCard(caseInfo, 1);
            (document.getElementsByClassName("card-action")[0] as HTMLElement).style.visibility = "visible";

            (document.querySelector('#Buy') as HTMLElement).onclick = () => {
                console.log("debug achat: ", achat, caseInfo.info.prix, player.money);
                if (achat){
                    (document.getElementsByClassName("card-action")[0] as HTMLElement).style.visibility = "hidden";
                    this.ws.emit("Achat");
                    let playerPaying = this.getPlayerByName(player.name)
                    if(playerPaying != undefined){
                        playerPaying.money -= caseInfo.info.prix;
                        (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + playerPaying.money;
                        this.players.set(id, playerPaying);
                        this.updateVariables();
                    }
                    this.ws.emit("FinTour");
            }
                else console.log("Tu ne peux pas acheter");
                this.updateVariables();
            }
            (document.querySelector('#Quit') as HTMLElement).onclick = () => {
                (document.getElementsByClassName("card-action")[0] as HTMLElement).style.visibility = "hidden";
                this.ws.emit("FinTour");
                this.updateVariables();
            }
        })



        this.updateVariables();
    }

    private achatNbMaison(maxHouse: number, caseInfo: TownCard, nbMaison: number) {
        if (maxHouse <= nbMaison && caseInfo.nbMaison + nbMaison <= 5) {

            this.ws.emit("achatMaison", nbMaison);
            caseInfo.nbMaison = nbMaison;
            this.cards.set(caseInfo.caseNb, caseInfo);
            (document.getElementsByClassName("card-action-maison")[0] as HTMLElement).style.visibility = "hidden";
        }
    }

    private displayCard(caseInfo: TownCard, index: number): void {
        (document.getElementsByClassName("name")[index] as HTMLElement).innerText = ""+caseInfo.name;
        (document.getElementsByClassName("title")[index] as HTMLElement).style.backgroundColor = ""+caseInfo.info.color;
        (document.getElementsByClassName("price-default")[index] as HTMLElement).innerText = "£"+caseInfo.info.m0;
        (document.getElementsByClassName("price-1")[index] as HTMLElement).innerText = "£"+caseInfo.info.m1;
        (document.getElementsByClassName("price-2")[index] as HTMLElement).innerText = "£"+caseInfo.info.m2;
        (document.getElementsByClassName("price-3")[index] as HTMLElement).innerText = "£"+caseInfo.info.m3;
        (document.getElementsByClassName("price-4")[index] as HTMLElement).innerText = "£"+caseInfo.info.m4;
        (document.getElementsByClassName("price-5")[index] as HTMLElement).innerText = "£"+caseInfo.info.m5;
        (document.getElementsByClassName("price-hotel")[index] as HTMLElement).innerText = "£"+caseInfo.info.maison + "\nplus 4 maisons";
        (document.getElementsByClassName("price-maison")[index] as HTMLElement).innerText = "£"+caseInfo.info.maison;
    }

    private setupDe() {
        const geometry = new BoxGeometry(2, 2, 2);
        const material = new MeshBasicMaterial({color: 0x000000});
        const cube = new Mesh(geometry, material);
        this.registerObject(new de("dé", cube));
    }

    private setupHouses(){
        const loader = new GLTFLoader();
        for (let i: number = 0; i < 9; ++i) {
            this.addHousesOfCard(loader, 7.1 - 1.7767 * i, 8.32, i + 1, false);
            this.addHousesOfCard(loader, -8.25  , 7.1 - 1.7767 * i, i + 11, true);
            this.addHousesOfCard(loader, -7.1 + 1.7767 * i  , -8.3, i + 21, false);
            this.addHousesOfCard(loader, 8.25  , -7.1 + 1.7767 * i, i + 31, true);
        }
    }

    private setupPlanes() {
        //Ajout des plans des coins
        this.addPlaneOnTray(2.9, 2.9, 9.48458, 9.53537, "StartCard", 0);
        this.addPlaneOnTray(2.92, 2.92, -9.48716, 9.529, "PrisonCard", 10);
        this.addPlaneOnTray(2.92, 2.92, -9.48716, -9.529, "BankCard", 20);
        this.addPlaneOnTray(2.92, 2.92, 9.48716, -9.529, "WarCard", 30);

        //Boucle pour setup les plans restants
        for (let i: number = 0; i < 9; ++i) {



            this.addPlaneOnTray(1.71969, 2.88127, 7.10946 - 1.7767 * i, 9.54623, "card_" + (i + 1), i + 1);
            this.addPlaneOnTray(2.89, 1.74, -9.49878, 7.0904 - 1.7788 * i, "card_" + (i + 11), i + 11);
            this.addPlaneOnTray(1.71969, 2.88127, -7.10946 + 1.7767 * i, -9.49983, "card_" + (i + 21), i + 21);
            this.addPlaneOnTray(2.89, 1.74, 9.4985, -7.14 + 1.7788 * i, "card_" + (i + 31), i + 31);
        }
    }

    private setupPrison(loader: GLTFLoader) {
        this.loadGLTFSceneModel(loader, "DorianGame/prison.glb").then((obj) => {
            this.registerObject(new prison("Prison", obj))
        });
    }

    private setupTray(loader: GLTFLoader) {
        this.loadGLTFSceneModel(loader, "DorianGame/dorianTray.glb").then((obj) => {
            const tray = new Tray("DorianTray", obj);

            //Rend le plateau inselectable
            tray.selectable = false;
            this.registerObject(tray)
        });
    }

    private setupCard() {
        this.cards.set(cardConfig.start, new Card(cardConfig.start, "start"))
        this.cards.set(cardConfig.prison, new Card(cardConfig.prison, "prison"))
        this.cards.set(cardConfig.bank, new Card(cardConfig.bank, "bank"))
        this.cards.set(cardConfig.war, new Card(cardConfig.war, "war"))

        cardConfig.batailles.forEach((caseNb: number) => {
            this.cards.set(caseNb, new Card(caseNb, "bataille"))
        })

        cardConfig.chances.forEach((caseNb: number) => {
            this.cards.set(caseNb, new Card(caseNb, "chances"))
        })

        cardConfig.villes.forEach((town) => {
            this.cards.set(town.caseNb, new TownCard(town.caseNb, town.nameCity, town.infoCard))
        })
    }

    private setupPawn(loader: GLTFLoader, player: Players) {
        this.loadGLTFSceneModel(loader, "DorianGame/" + player.pawnName + ".glb").then((obj) => {
            this.registerObject(new playerPawn(player.pawnName, obj, player.name, player.money));
            const tempObject = this.getObject(player.pawnName) as playerPawn | undefined;
            this.players.set(player.id, player);
            if (tempObject) for (let i = 0; i < player.caseNb; i++) {
                tempObject.moveCase(false);
            }

        });
    }

    protected addHousesOfCard(loader: GLTFLoader, posx : number, posz : number, nbCase : number, rotate: boolean){

        let tempCard = this.cards.get(nbCase)
        if (tempCard instanceof TownCard){

            for(let i = 1; i<=5; i++){
                this.loadGLTFSceneModel(loader, "DorianGame/maison"+ i +".glb").then((obj) => {

                console.log("Help: ", tempCard, tempCard.nbMaison, i);
                obj.visible = (tempCard.nbMaison == i);

                obj.translateZ(posz);
                obj.translateX(posx);

                if (rotate) obj.rotateY(1.5708);

                //maison1-9
                this.registerObject(new maison("maison" + i + "-" + nbCase, obj, nbCase))
                });
            }
        }
    }

//Cree un plan et le register
    protected addPlaneOnTray(width : number, height : number, posx : number, posz : number, objectName : string, nbCase : number) : void {
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
        this.registerObject(new CaseSelector(objectName, plane, nbCase));
    }

    showSelectedObjectActuators(): void {
    }

    unselectAll(): void {
        this.unselectObject();
    }

    getPlayerByName(name: string): Players | undefined{
        let playerreturn: Players | undefined = undefined;
        this.players.forEach((player) => {if (player.name == name) {
            playerreturn = player;
        }});
        return playerreturn;
    }

    selectObject(name: string) {
        //console.log("Debug horrible: ", this.players, (this.selectedObject instanceof de))
        //Abaisse la carte d'information si l'objet cliqué est la même carte que celle deja en mémoire
        if (this.getObject(name) instanceof CaseSelector && name === this.previousObjectSelected?.getName()) {(document.getElementsByClassName("caseCard")[0] as HTMLElement).style.transform = "translateY(60vh)";}
        //Sinon on effectue le code classique
        else{

        super.selectObject(name);

        //Si l'objet selectionné est une caseselector, on applique des modififcations en fonction du type de la case
        if (this.selectedObject && this.selectedObject instanceof CaseSelector) {
            const tempcase: CaseSelector = this.selectedObject as CaseSelector;
            const tempCard: Card | undefined = this.cards.get(tempcase.nbCase);
            if (tempCard != undefined){
                (document.getElementsByClassName("caseCard")[0] as HTMLElement).style.transform = "translateY(60vh)";
                if (tempCard.type == "start") {
                } else if (tempCard.type == "prison") {
                    this.getObject("Prison")?.select();
                } else if (tempCard.type == "bank") {
                } else if (tempCard.type == "war") {
                } else if (tempCard.type == "chance") {
                } else if (tempCard.type == "bataille") {
                } else if (tempCard.type == "ville"){
                    //Convertir
                    //Ajoute les parametres propres aux villes dans la carte d'information

                    (tempCard.user != undefined)? (document.getElementsByClassName("user-card")[0] as HTMLElement).innerText = "La carte appartient actuellement à "+tempCard.user : (document.getElementsByClassName("user-card")[0] as HTMLElement).innerText = "Aucune personne ne possède cette carte actuellement";
                    (document.getElementsByClassName("caseCard")[0] as HTMLElement).style.transform = "translateY(0vh)";
                    this.displayCard(tempCard as TownCard, 0);
                }
        }
        }
    }
        if (this.selectedObject instanceof playerPawn) this.updateVariables();
        if (this.selectedObject instanceof de) this.lancerDe();

        }

    updateVariables() : void {
        this.ws.emit("Update", (error: any, response: any) => {
            if(error) throw error;
            else {
                this.players = new Map(response.playersUpdate);
                this.cards = new Map(response.cardsUpdate);
                for (let i = 1; i <= this.players.size; i++) {
                    let tempPion: any;
                    const playerEnCours = this.players.get(i) as Players | undefined
                    if (playerEnCours) {const tempPion : playerPawn | undefined = (this.getObject(playerEnCours.pawnName) as playerPawn | undefined);}

                    if (tempPion != undefined && playerEnCours != undefined){
                        tempPion.money = playerEnCours.money;
                    }
                }
            }
        })
    }

    lancerDe() : void {
        this.ws.emit("Lancede", (error : any, response : any) => {
            console.log("response lancerDe(): ", response);
            this.updateVariables();
            if (error) throw error;
            else{
                const tempPion : playerPawn | undefined = (this.getObject(response.player.pawnName) as playerPawn | undefined);

                if (tempPion){
                    for (let i: number = 0; i < response.random; i++) {
                        tempPion.moveCase();
                    }
                }
            }
        })
    }

}
