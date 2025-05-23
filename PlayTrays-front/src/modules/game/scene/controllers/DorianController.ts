import SupportController from "@/modules/game/scene/SupportController";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import {Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene,} from "three";
import type {Ref} from "vue";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Socket} from "socket.io-client";
import Tray from "@/modules/game/scene/objects/Tray";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import {playerPawn} from "@/modules/game/scene/objects/DorianGameObjects/PlayerPawn";
import {CaseSelector} from "@/modules/game/scene/objects/DorianGameObjects/CaseSelector";
import {de} from "@/modules/game/scene/objects/DorianGameObjects/De";
import {TownCard} from "@/modules/game/scene/objects/DorianGameObjects/cards/TownCard";
import {cardConfig} from "@/modules/game/scene/objects/DorianGameObjects/cards/CardConfig";
import {Card} from "@/modules/game/scene/objects/DorianGameObjects/cards/Card";
import {Maison} from "@/modules/game/scene/objects/DorianGameObjects/Maison";
import type {Prison} from "@/modules/game/scene/objects/DorianGameObjects/Prison";
import {ModelLoader} from "@/modules/utils/scene/ModelLoader";
import type {UserInterface} from "@/modules/utils/UserInterface";


interface Player {
    name: string;
    city: string[];
    exitPrison: number;
    money: number;
    caseNb: number;
    id: number;
    realUserId: number;
    playerName: string;
    pawnName: string;
}


export default class DorianGame extends SupportController{

    previousObjectSelected: PTObject | undefined;
    players: Map<number, Player>;
    cards: Map<number, Card>;

    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls>, ws: Socket, player: UserInterface) {
        super(scene, cameraRef, orbitControlsRef, ws, player);
        this.players = new Map();
        this.cards = new Map();
    }
    confirmAction(): void {
    }

    defaultCamera(): void {
        //this.displayCardHUD();
    }

    getSelectedActuator(): Actuator | undefined {
        return undefined;
    }

    selectActuator(name: string): void {
    }

    unselectObject() {
        this.previousObjectSelected = this.getSelectedObject();
        super.unselectObject();
    }

    /**
     * Permet d'initialiser le jeu DorianGame lors du lancement de la page
     * @param loaderFiller
     */
    setup(loaderFiller?: Ref<boolean>): void {

        const controls: OrbitControls = this.getOrbitControls();

        controls.minDistance = 5;
        controls.maxTargetRadius = 25;
        controls.rotateSpeed = 0.5;
        controls.maxDistance = 85;

        controls.saveState();

        this.setupCard();

        //Ajout d'un plateau
        this.setupTray();

        //Ajout de la prison
        this.setupPrison();

        // Ajout de plans PTObjects que l'on rend invisible pour permettre de rendre les cartes du plateau selectionnables
        this.setupPlanes();

        this.setupDe();

        this.updateVariables();

        if (loaderFiller) setTimeout(() => loaderFiller.value = false, 15000);

        this.ws.on("PlayerJoin", (player : Player) : void => {
            this.setupPawn(player);
            this.updateVariables();
            if (player.realUserId == this.player.id) {
                setTimeout(() => {
                    let i = 0;
                    (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = ""+i;
                    const interval = setInterval(() => {
                        try {
                            if (i < player.money) {
                                (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = ""+i;
                                i+=1981;
                            } else {
                                (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = ""+player.money;
                                clearInterval(interval);
                            }
                        } catch (e) {
                            clearInterval(interval)
                        }

                    },10)

                }, 3000);
            }
        })

        //Gere l hud lorsque le joueur tombe sur la case d'un autre
        this.ws.on("Paiement", (prix, player) => {
            console.log("Vous avez payé: ", prix);
            (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + player.money;
            if (player.money < 0) this.ws.emit("faillite", player)
            this.updateVariables();
        })

        //Update l'hud si le jouuer passe sur la case départ
        this.ws.on("Passage case départ", (money) => {
            (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + money;
            console.log("passage à la case départ");
        })

        this.ws.on("Update", ()=>{this.updateVariables()})

        this.ws.on("start", () => {
            if (loaderFiller) setTimeout(() => loaderFiller.value = false, 1000);
        })

        //Fait avancer le pion du joueur possedant l'id donnée en parametre
        this.ws.on("pawnMove", (id, r) => {
            const pawnToMove = (this.getObject("pion" + id) as playerPawn | undefined);
            if (pawnToMove) {
                for (let i = 0 ; i < r; i++){
                    pawnToMove.moveCase();
                }
            }
            this.updateVariables();
        })

        //Gere le cas ou la carte chance change l'argent
        this.ws.on("Carte chance argent", (chanceCard: {message: string, aideReal: number}, player) => {
            (document.getElementsByClassName("chance-texte")[0] as HTMLElement).innerText = ""+chanceCard.message;
            (document.getElementsByClassName("card-chance")[0] as HTMLElement).style.visibility = "visible";

            //Si le joueur a fini de lire il appuie sur Ok et voit son hud modifié avec son nouvel argent
            (document.querySelector('#Ok') as HTMLElement).onclick = () => {
                (document.getElementsByClassName("card-chance")[0] as HTMLElement).style.visibility = "hidden";
                (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + (player.money);
                this.ws.emit("moveChance");
                if (player.money < 0) this.ws.emit("faillite", player)
                else this.ws.emit("FinTour");
            }
            this.updateVariables();
        })

        //Deplace les pions vers la case definie par la carte chance
        this.ws.on("Carte chance deplacement all", (chanceCard: {message: string, aideReal: {nbCase: number, caseX: number, caseY: number, depart: boolean, prison: boolean}}, player) => {
            const tempPion : playerPawn | undefined = (this.getObject("pion" + player.id) as playerPawn | undefined);
            const tempPrison: Prison | undefined = (this.getObject("Prison") as Prison | undefined);
            if (tempPion){
                tempPion.moveTo(chanceCard.aideReal.caseX, chanceCard.aideReal.caseY);
            }
            if (tempPrison && chanceCard.aideReal.prison) {
                tempPrison.down();
            }
        })

        //Gere l'event de deplacement de joueur apres avoir pioché une carte chance de ce type
        this.ws.on("Carte chance deplacement", (chanceCard: {message: string, aideReal: {nbCase: number, caseX: number, caseY: number, depart: boolean, prison: boolean}}, player) => {
            (document.getElementsByClassName("chance-texte")[0] as HTMLElement).innerText = ""+chanceCard.message;
            (document.getElementsByClassName("card-chance")[0] as HTMLElement).style.visibility = "visible";

            //Si le joueur a fini de lire il appuie sur Ok et va à la case choisie (la prison s'abaisse si la carte est une prison)
            (document.querySelector('#Ok') as HTMLElement).onclick = () => {
                (document.getElementsByClassName("card-chance")[0] as HTMLElement).style.visibility = "hidden";
                (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + (player.money);

                const tempPion : playerPawn | undefined = (this.getObject("pion" + player.id) as playerPawn | undefined);
                const tempPrison: Prison | undefined = (this.getObject("Prison") as Prison | undefined);
                if (tempPion){
                    tempPion.moveTo(chanceCard.aideReal.caseX, chanceCard.aideReal.caseY);
                }
                if (tempPrison && chanceCard.aideReal.prison) {
                    tempPrison.down();
                }
                this.ws.emit("moveChance", chanceCard, player);
                this.ws.emit("FinTour");
            }
            this.updateVariables();
        })

        this.ws.on("joueur en prison", (player) => {
            const tempPrison: Prison | undefined = (this.getObject("Prison") as Prison | undefined);
            if (tempPrison) {
                tempPrison.down();
            }

        })

        this.ws.on("retirer prison", () => {
            const tempPrison: Prison | undefined = (this.getObject("Prison") as Prison | undefined);
            if (tempPrison) {
                tempPrison.up();
            }
        })

        this.ws.on("UpdateHUD", (money) => {(document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + money;})

        //Si on peut ajouter une maison
        this.ws.on("MaisonPossible", (maxHouse: number, caseInfo: TownCard, player: Player)=>{


            this.displayCard(caseInfo, 2);
            (document.getElementsByClassName("card-action-maison")[0] as HTMLElement).style.visibility = "visible";
            console.log("max houses: ", maxHouse);

            //On attends que le joueur achete ou quitte le menu de selection
            (document.querySelector('#one') as HTMLElement).onclick = () => {this.achatNbMaison(maxHouse, caseInfo, 1, player);}

            (document.querySelector('#two') as HTMLElement).onclick = () => {this.achatNbMaison(maxHouse, caseInfo, 2, player);}

            (document.querySelector('#three') as HTMLElement).onclick = () => {this.achatNbMaison(maxHouse, caseInfo, 3, player);}

            (document.querySelector('#four') as HTMLElement).onclick = () => {this.achatNbMaison(maxHouse, caseInfo, 4, player);}

            (document.querySelector('#five') as HTMLElement).onclick = () => {this.achatNbMaison(maxHouse, caseInfo, 5, player);}

            (document.querySelector('#quit-house') as HTMLElement).onclick = () => {
                this.ws.emit("FinTour");
                (document.getElementsByClassName("card-action-maison")[0] as HTMLElement).style.visibility = "hidden";
            }

        })

        //Gere la situation ou la carte sur laquelle est le joueur est achetable
        this.ws.on("CasePossible", (caseInfo: any, player: Player, achat: boolean, id: number) => {


            this.displayCard(caseInfo, 1);
            (document.getElementsByClassName("card-action")[0] as HTMLElement).style.visibility = "visible";

            (document.querySelector('#Buy') as HTMLElement).onclick = () => {

                if (achat){
                    (document.getElementsByClassName("card-action")[0] as HTMLElement).style.visibility = "hidden";

                    //Envoie une requete serveur qui reverifiera si l'achat est possible et l'efectuera
                    this.ws.emit("Achat");

                    //Modifie l'HUD
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

    /**
     * Verifie si le joueur peut acheter et envoie le choix du client au serveur
     *
     * @param maxHouse
     * @param caseInfo
     * @param nbMaison
     * @param player
     * @private
     */
    private achatNbMaison(maxHouse: number, caseInfo: TownCard, nbMaison: number, player: Player) {
        console.log("max house: ", maxHouse, nbMaison, caseInfo.nbMaison + nbMaison)

        //On effectue les verifiactions pour savoir si le joueur a le droit (les verifications sont refaites coté serveur pour éviter les erreurs)
        if (maxHouse >= nbMaison && caseInfo.nbMaison + nbMaison <= 5) {

            this.ws.emit("achatMaison", nbMaison);

            caseInfo.nbMaison += nbMaison;
            player.money -= caseInfo.info.maison*nbMaison

            this.cards.set(caseInfo.caseNb, caseInfo);
            this.players.set(player.id, player);

            (document.getElementsByClassName("user-money")[0] as HTMLElement).innerText = "" + player.money;
            this.updateHouses(caseInfo.nbMaison, caseInfo.caseNb);
            this.updateVariables();
            (document.getElementsByClassName("card-action-maison")[0] as HTMLElement).style.visibility = "hidden";
        }
    }

    /**
     * Modifie les informations de la carte à display (index gere la carte à modifier car chacune des cartes a la meme class)
     *
     * @param caseInfo
     * @param index
     * @private
     */
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

    /**
     * Ajoute le modele de dé sur le plateau
     * @private
     */
    private setupDe() {
        ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, '/DorianGame/de_party.glb').then((cube) => {
            cube.scale.set(0.5,0.5, 0.5);
            this.registerObject(new de("dé", cube));
        })
    }

    /**
     * Ajoute les modeles de maisons/hotels sur le plateau
     *
     * @param cards
     * @private
     */
    private setupHouses(cards: Map<number, Card>){
        //Boucle pour setup les maisons et les affilier à un nom.
        for (let i: number = 0; i < 9; ++i) {
            this.addHousesOfCard(7.1 - 1.7767 * i, 8.32, i + 1, false, cards.get(i+1));
            this.addHousesOfCard(-8.25  , 7.1 - 1.7767 * i, i + 11, true, cards.get(i+11));
            this.addHousesOfCard(-7.1 + 1.7767 * i  , -8.3, i + 21, false, cards.get(i+21));
            this.addHousesOfCard(8.25  , -7.1 + 1.7767 * i, i + 31, true, cards.get(i+31));
        }
    }

    /**
     * Ajoute les modeles de plans sur le plateau (les plans seront invisibles pour permettre d'activer la surbrillance)
     *
     * @private
     */
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

    /**
     * Ajoute le modele de prison sur le plateau
     *
     * @private
     */
    private setupPrison() {
        ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, "DorianGame/prison.glb").then((obj) => {
            //@ts-ignore
            this.registerObject(new Prison("Prison", obj))
        });
    }

    /**
     * Ajoute le modele de plateau
     *
     * @private
     */
    private setupTray() {
        ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, "DorianGame/dorianTray.glb").then((obj) => {
            const tray = new Tray("DorianTray", obj);

            //Rend le plateau inselectable
            tray.selectable = false;
            this.registerObject(tray)
        });
    }

    /**
     * Ajoute les cartes et leurs information dans une map
     *
     * @private
     */
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

        cardConfig.villes.forEach((town: any) => {
            this.cards.set(town.caseNb, new TownCard(town.caseNb, town.nameCity, town.infoCard))
        })
    }

    /**
     * Ajoute le pion et les informations de son joueur assigné
     *
     * @param player
     * @private
     */
    private setupPawn(player: Player) {
        ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, "DorianGame/" + player.pawnName + ".glb").then((obj) => {
            this.registerObject(new playerPawn(player.pawnName, obj, player.name, player.money));
            const tempObject = this.getObject(player.pawnName) as playerPawn | undefined;
            this.players.set(player.id, player);
            if (tempObject) for (let i = 0; i < player.caseNb; i++) {
                tempObject.moveCase(false);
            }

        });
    }

    /**
     * Ajoute les maisons existantes
     *
     * @param nbHouses
     * @param nbCase
     * @protected
     */
    protected updateHouses(nbHouses: number, nbCase: number){
        for(let i = 1; i<6;i++){
            const maison = this.getObject("maison" + nbHouses + "-" + nbCase) as Maison | undefined;
            if (maison != undefined){
                if (i == nbHouses) {

                    maison.changeVisible(true);
                    maison.object3D.visible = true;
                    maison.object3D.updateMatrix();

                }
                else {
                    maison.changeVisible(false);
                }
            }
        }
    }

    /**
     * Ajoute les 5 types de maisons sur les cartes (seules les cartes qui on un nbMaison > 0 ont une maison visible)
     *
     * @param posx
     * @param posz
     * @param nbCase
     * @param rotate
     * @param tempCard
     */
    addHousesOfCard(posx : number, posz : number, nbCase : number, rotate: boolean, tempCard: Card | undefined) {
        if (tempCard?.type == "ville") {
            const tempCardHelp = tempCard as TownCard | undefined;
            if (tempCardHelp != undefined) {
                for (let i = 1; i <= 5; i++) {

                    //Si la maison est à afficher
                    if (tempCardHelp.nbMaison == i) {
                        ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, "DorianGame/maison" + i + ".glb").then((obj) => {


                            obj.translateZ(posz);
                            obj.translateX(posx);

                            //rotate si la maison est sur les cotés
                            if (rotate) obj.rotateY(1.5708);
                            obj.updateMatrix();

                            //Exemple pour la maison unique à la case 9: maison1-9
                            const m = new Maison("maison" + i + "-" + nbCase, obj, nbCase);
                            this.registerObject(m)
                            m.object3D.visible = true;
                        })
                    }
                    //Si la maison n'est pas à afficher
                    else {
                        ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, "DorianGame/maison" + i + ".glb").then((obj) => {

                            const m = new Maison("maison" + i + "-" + nbCase, obj, nbCase);
                            m.object3D.visible = false;
                            this.registerObject(m)

                        })
                    }
                }
            }
        }
    }

    /**
     * Cree un plan et le register
     *
     * @param width
     * @param height
     * @param posx
     * @param posz
     * @param objectName
     * @param nbCase
     * @protected
     */
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

    /**
     *
     * @param name
     */
    getPlayerByName(name: string): Player | undefined{
        let playerreturn: Player | undefined = undefined;
        this.players.forEach((player) => {if (player.name == name) {
            playerreturn = player;
        }});
        return playerreturn;
    }

    /**
     * Gere la selection du joueur
     *
     * @param name
     */
    selectObject(name: string) {
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
                    //Ajoute les parametres propres aux villes dans la carte d'information
                    const tempCardCity = tempCard as TownCard;
                    (tempCardCity.user != undefined)? (document.getElementsByClassName("user-card")[0] as HTMLElement).innerText = "La carte appartient actuellement à "+tempCardCity.user : (document.getElementsByClassName("user-card")[0] as HTMLElement).innerText = "Aucune personne ne possède cette carte actuellement";
                    (document.getElementsByClassName("caseCard")[0] as HTMLElement).style.transform = "translateY(0vh)";
                    this.displayCard(tempCard as TownCard, 0);
                }
        }
        }
    }
        if (this.selectedObject instanceof playerPawn) this.updateVariables();

        //Lance le dé
        if (this.selectedObject instanceof de) this.lancerDe();

        }

    /**
     * recupere les variables chez le serveur et les appliques au client
     */
    updateVariables() : void {
        this.ws.emit("Update", (error: any, response: any) => {
            if(error) throw error;
            else {
                this.players = new Map(response.playersUpdate);
                this.cards = new Map(response.cardsUpdate);
                for (let i = 1; i <= this.players.size; i++) {
                    const playerEnCours = this.players.get(i) as Player | undefined
                    if (playerEnCours) {
                        const tempPion: playerPawn | undefined = (this.getObject(playerEnCours.pawnName) as playerPawn | undefined);
                        if (tempPion) tempPion.money = playerEnCours.money;
                    }
                }
                this.setupHouses(this.cards);
            }
        })
    }

    /**
     * Lance le dé
     */
    lancerDe() : void {
        this.ws.emit("Lancede", (error : any, response : any) => {

            //Envoie une requete au serveur pour indiquer que le joueur a bien joué
            console.log("response lancerDe(): ", response);
            this.updateVariables();
            if (error) throw error;
            else{
                const tempPion : playerPawn | undefined = (this.getObject(response.player.pawnName) as playerPawn | undefined);

                //Avance le pion du nombre aleatoire choisi
                if (tempPion){
                    for (let i: number = 0; i < response.random; i++) {
                        tempPion.moveCase();
                    }
                }
            }
        })
    }

}
