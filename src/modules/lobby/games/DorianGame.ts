import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import PTLobby from "../PTLobby";
import PTServer from "../../PTServer";
import {Card} from "../../DorianGame/cards/Card";
import {cardConfig} from "../../DorianGame/cards/CardConfig";
import {TownCard} from "../../DorianGame/cards/TownCard";

export interface Players{
    name: string;
    city: string[];
    exitPrison: number;
    tourInprison: number;
    money: number;
    caseNb: number;
    id: number
    playerName: string;
    pawnName: string;
}

export interface chance{
    message: string,
    type: string,
    aideReal: any
}

export default class DorianGame extends PTLobby {

    hasDice: boolean = true;
    cards: Map<number, Card>; // caseNb, Card
    players: Map<number, Players>;
    theOnePlaying: number = 1;
    chances: Array<chance>;
    idOfPlayers: Array<number>;
    register: number = 1;


    constructor(uuid: string, game: string, visibility: "public" | "private", server: PTServer) {
        super(uuid, game, visibility, server);
        this.players = new Map();
        this.cards = new Map();
        this.chances = new Array<chance>(
            {message: "test 10 000",type: "argent", aideReal: 10000},
            //{message: "test -10 000", type: "argent", aideReal: -10000},
            //{message: "Vous avez commis une fraude fiscale d'un grande ampleur avec un certain Franck Verdonck, \nvous allez en prison sans toucher les £20 000 de la case départ.", type: "deplacement", aideReal: {nbCase: 10, caseX: 10, caseY: 0, depart: false, prison: true}}
            );
        this.idOfPlayers = new Array<number>();
        this.setupGame();

    }

    protected finTour(): void{this.theOnePlaying = (this.theOnePlaying >= this.players.size) ? 1 : this.theOnePlaying + 1;}

    protected getPlayerByName(name: string): Players | undefined {
        let result: Players | undefined = undefined;
        this.players.forEach(player => {
            if (player.name === name) {
                result = player;
            }
        });
        return result;
    }

    protected setupGame(): void {

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

    registerNewSocket(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>): void {
        this.sockets.set(socket.data.user, socket);

        if(!(this.idOfPlayers.includes(socket.data.user))) this.idOfPlayers.push(socket.data.user);

        if (!(this.players.get(this.idOfPlayers.indexOf(socket.data.user)+1))) {

            console.log("La liste des id socket des joueurs: ", this.idOfPlayers, "\nL'id du joueur venant de se connecter: ", socket.data.user);
            this.players.set((this.register), {
                name: "User" + socket.data.user,
                city: [],
                exitPrison: 0,
                tourInprison: 0,
                money: 1000000,
                caseNb: 0,
                id: this.idOfPlayers.indexOf(socket.data.user)+1,
                playerName: "User" + (this.idOfPlayers.indexOf(socket.data.user)+1),
                pawnName: "pion" + (this.idOfPlayers.indexOf(socket.data.user)+1)
            });
            this.register += 1;


        }

        socket.join(this.uuid);
        //console.log("debug: ", this.players, socket.data.user +"\n");
        for (let i = 1; i <= this.players.size; i++) {
            this.server.io.to(this.uuid).emit("PlayerJoin", this.players.get(i));

        }

        socket.emit("UpdateHUD", this.players.get(this.idOfPlayers.indexOf(socket.data.user))?.money);

        socket.on("achatMaison", (nbMaison: number) => {
            const player = this.players.get(this.theOnePlaying)
            if (player) {
                const cardEnCours = this.cards.get(player.caseNb)
                if (cardEnCours && cardEnCours instanceof TownCard) {

                    if (this.hasAllProperty(player, cardEnCours)){
                        if (player.money >= cardEnCours.info.maison*nbMaison && cardEnCours.nbMaison + nbMaison <= 5){
                            player.money -= cardEnCours.info.maison*nbMaison
                            cardEnCours.nbMaison += nbMaison;
                            this.players.set(this.theOnePlaying, player);
                            this.cards.set(player.caseNb, cardEnCours);
                            console.log("la carte ", cardEnCours.name," a recu ", nbMaison, " maison, elle coute maintenant ", cardEnCours.getPassagePrice());
                        }
                    }
                    this.finTour();
                    }
                }
            })

        socket.on("Lancede", (callBack) => {

            if ((this.idOfPlayers.indexOf(socket.data.user) + 1) == this.theOnePlaying && this.players.get(this.theOnePlaying)) {
                const player = this.players.get(this.theOnePlaying);

                let de1 = Math.floor(Math.random() * 5 + 1);
                let de2 = Math.floor(Math.random() * 5 + 1);
                let r = (this.hasDice) ? de1 + de2 : de1;



                if (player != undefined) {

                    if(de1 == de2 && player.tourInprison>0) {
                        this.server.io.to(this.uuid).emit("retirer prison");
                        player.tourInprison = 0;
                    }

                    console.log("Le joueur ", player.name, " a ", player.tourInprison, "tours en prisons et les dés sont: ", de1, de2);

                    if (de1 == de2 || player.tourInprison == 0){


                        player.caseNb += r;

                        this.verifStart(player, socket);

                        this.players.set(this.theOnePlaying, player);

                        console.log("Le joueur ", player.playerName, " est sur la case ", player.caseNb, " avec £ ",player.money);
                        let caseInfo = this.cards.get(player.caseNb)
                        if (caseInfo) {

                            this.server.io.to(this.uuid).emit("pawnMove", this.theOnePlaying, r);

                            if (caseInfo.type == "chances") {
                                this.caseChance(caseInfo, player, socket);
                            } else if (caseInfo.type == "war") this.finTour();
                            else if (caseInfo.type == "bank") this.finTour();
                            else if (caseInfo.type == "start") this.finTour();
                            else if (caseInfo.type == "bataille") this.finTour();
                            else if (caseInfo.type == "prison") this.finTour();
                            else if (caseInfo instanceof TownCard) {
                                this.caseTown(caseInfo, player, socket);

                            }
                        }
                    }
                    else if (de1 != de2 && player.tourInprison > 0){

                        console.log("Il vous reste ", player.tourInprison-1, " tours en prison")
                        player.tourInprison -=1;
                        if (player.tourInprison == 0){this.server.io.to(this.uuid).emit("retirer prison");}
                        this.finTour()
                    }
                }
            }

        })

        socket.on("Update", (callBack) => {
            callBack(undefined, {
                playersUpdate: Array.from(this.players.entries()),
                cardsUpdate: Array.from(this.cards.entries()),
                player: this.players.get(this.theOnePlaying)
            });
        })

        socket.on("FinTour", () => {
            this.finTour()
        })

        socket.on("Achat", () => {
            const player = this.players.get(this.theOnePlaying);

            if (player != undefined) {
                this.achat(player);
            }
            this.finTour();
        })
        socket.on("Faillite", () => {
            console.log("Faillite");

        })
    }

    protected verifStart(player: Players, socket: Socket<DefaultEventsMap, DefaultEventsMap, any>): void {
        if (player.caseNb >= 40) {
            player.caseNb -= 40;
            player.money += 20000;
            socket.emit("Passage case départ", player.money);
        }
    }

    protected caseChance(caseInfo: Card, player: Players, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
        const chanceValue = this.chances[(Math.floor(Math.random()*this.chances.length))];
        if (chanceValue.type == "argent") {
            player.money += chanceValue.aideReal;
            this.players.set(this.theOnePlaying, player);
            socket.emit("Carte chance argent", chanceValue, player)
        }
        else if(chanceValue.type == "deplacement") {
            if (player.caseNb >= chanceValue.aideReal.nbCase && chanceValue.aideReal.depart) {
                player.money += 20000;
            }
            if (chanceValue.aideReal.prison) player.tourInprison = 3;
            player.caseNb = chanceValue.aideReal.nbCase;
            this.players.set(this.theOnePlaying, player);
            socket.emit("Carte chance deplacement", chanceValue, player);
            this.emitWithout(socket, "joueur en prison", player);
        }

    }

    private achat(player: Players) {
        const cardToSell = this.cards.get(player.caseNb);
        if (cardToSell != undefined && cardToSell instanceof TownCard) {
            if (player.money > cardToSell.info.prix && cardToSell.user == undefined) {
                player.money -= cardToSell.info.prix
                player.city.push(cardToSell.name);
                cardToSell.user = player.name;
                this.players.set(this.theOnePlaying, player);
                this.cards.set(player.caseNb, cardToSell);
                this.theOnePlaying = (this.theOnePlaying == this.players.size) ? 1 : this.theOnePlaying + 1;
            }
        }
    }

    protected caseTown(caseInfo: TownCard, player: Players, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
        if (caseInfo.user == undefined) {
            socket.emit("CasePossible", caseInfo, player, (player.money >= caseInfo.info.prix), this.theOnePlaying);
        }
        else if (caseInfo.user == player.name) {

            let maxHouse: number = 0

            for (let i = 1; i < 6; i++) {
                if (caseInfo.info.maison*i <= player.money) maxHouse += 1;
            }

            if (this.hasAllProperty(player, caseInfo)) socket.emit("MaisonPossible", maxHouse, caseInfo);

            else this.finTour();
        }
        else{
            //Ajouter un emit pour animation de retirer l'argent
            let playerPaid: undefined | Players = this.getPlayerByName(caseInfo.user);
            const prix = caseInfo.getPassagePrice();

            if(playerPaid != undefined){

                if (player.money >= prix && caseInfo.user != undefined && playerPaid != undefined) {
                    player.money -= prix;
                    playerPaid.money += prix;
                    this.players.set(this.theOnePlaying, player);
                    this.players.set(playerPaid.id, playerPaid);
                    socket.emit("Paiement", prix, player);
                    console.log("Le joueur ", player.playerName, " (£ ", player.money,"a payé £ ", prix, " à ", playerPaid.playerName, " (£ ", playerPaid.money,").");
                    this.finTour();
                }
                else{
                }
                console.log("prix: ", prix, player.money);
            }
        }
    }

    protected hasAllProperty(playerToCheck: Players, cardToCheck: TownCard): boolean {
        let cardSameType: Array<string> = [];
        let nbCardSame: number = 0;

        this.cards.forEach(card => {
            if (card instanceof TownCard && card.info.color == cardToCheck.info.color) {
                cardSameType.push(card.name);
            }
        })
        playerToCheck.city.forEach(city => {
            if (cardSameType.includes(city)) nbCardSame += 1;
        })

        return (nbCardSame == cardSameType.length);
    }

}