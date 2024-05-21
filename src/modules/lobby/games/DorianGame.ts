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
    canPlay: boolean = false;
    helpTimeout: NodeJS.Timeout | undefined;


    constructor(uuid: string, game: string, visibility: "public" | "private", server: PTServer) {

        super(uuid, game, visibility, server);
        this.players = new Map();
        this.cards = new Map();

        //Setup des chances possibles (deux types: argent qui permet de modifier 'argent du joueur ayant tiré la carte et
        // deplacement qui permet de deplacer vers la case voulue en decidant si le joueur va sur la case départ)
        this.chances = new Array<chance>(
            {message: "C'est votre anniversaire !\n Vous gagnez £ 10.\n\n Hourra!",type: "argent", aideReal: 10},
            {message: "Vous organisez un voyage à toulon\n Dirigez vous vers la case Toulon.\n\nVous recevez les £ 20 000 de la case départ",type: "deplacement", aideReal: {nbCase: 3, caseX: 3, caseY: 0, depart: true, prison: false}},
            {message: "Vous vous marriez avec Emma et devez donc subvenir à ses besoins.\n Vous perdez £ 1700.\n\nRelou la meuf...",type: "argent", aideReal: -1700},
            {message: "Vous decouvrez un super magasin de comics.\n Vous perdez £ 10 000.)",type: "argent", aideReal: -10000},
            {message: "Vous n'avez pas reussi à  échapper au fisc.\n Vous perdez £ 20 000.)",type: "argent", aideReal: -20000},
            {message: "Emmanuel Macron est réelu, vous avez de la chance, vous faites parti des 1%.\n\nVous gagnez £ 20 000",type: "argent", aideReal: 20000},
            {message: "Vous décidez de vous familiariser avec le dialecte tant aprecié des lyonnais\n Dirigez vous vers la case Lyon.\n\nVous recevez les £ 20 000 de la case départ",type: "deplacement", aideReal: {nbCase: 37, caseX: 0, caseY: 3, depart: true, prison: false}},
            {message: "Les pistons de Detroit jouent un match de charité, vous ne voulez pas y aller mais bon c'est gratuit...\n\nDirigez vous vers la case Detroit.\n\n Vous recevez les £ 20 000 de la case départ",type: "deplacement", aideReal: {nbCase: 32, caseX: 0, caseY: 8, depart: true, prison: false}},
            {message: "Vous avez commis une fraude fiscale d'un grande ampleur avec un certain Franck Verdonck, \n\nVous allez en prison sans recevoir les £20 000 de la case départ.", type: "deplacement", aideReal: {nbCase: 10, caseX: 10, caseY: 0, depart: false, prison: true}}

        );
        this.idOfPlayers = new Array<number>();
        this.setupGame();

    }

    //Passe au joueur suivant et applique un timeout pour que le joueur
    public finTour(): void{
        clearTimeout(this.helpTimeout)
        this.theOnePlaying = (this.theOnePlaying >= this.players.size) ? 1 : this.theOnePlaying + 1;
        this.canPlay = true;
        this.helpTimeout = setTimeout(() => {this.forfeit(this.players.get(this.theOnePlaying))}, 100000);
    }

    //Permet de return le joueur qui a le nom passé en parametre parmis la liste des joueurs
    protected getPlayerByName(name: string): Players | undefined {
        let result: Players | undefined = undefined;
        this.players.forEach(player => {
            if (player.name === name) {
                result = player;
            }
        });
        return result;
    }

    //Instancie les cartes
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

    //Instancie les sockets
    registerNewSocket(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>): void {
        this.sockets.set(socket.data.user, socket);

        //Ajoute le joueur aux idPlayer pour convertir ensuite la socket en id simple (Exemple: socket 8 ==> id 1)
        if(!(this.idOfPlayers.includes(socket.data.user))) this.idOfPlayers.push(socket.data.user);

        //On verifie si le joueur est existant
        if (!(this.players.get(this.idOfPlayers.indexOf(socket.data.user)+1))) {

            //Si il n'existe on l'ajoute avec les valeur initiales
            console.log("La liste des id socket des joueurs: ", this.idOfPlayers, "\nL'id du joueur venant de se connecter: ", socket.data.user);
            this.players.set((this.register), {
                name: "User" + socket.data.user,
                city: [],
                exitPrison: 0,
                tourInprison: 0,
                money: 150000,
                caseNb: 0,
                id: this.idOfPlayers.indexOf(socket.data.user)+1,
                playerName: "User" + (this.idOfPlayers.indexOf(socket.data.user)+1),
                pawnName: "pion" + (this.idOfPlayers.indexOf(socket.data.user)+1)
            });
            this.register += 1;


        }

        socket.join(this.uuid);
        //console.log("debug: ", this.players, socket.data.user +"\n");

        //On emit PlayerJoin pour chaques joueurs arrivés sur le serveur pour afficher leurs pions sur chacuns des clients
        for (let i = 1; i <= this.players.size; i++) {
            this.server.io.to(this.uuid).emit("PlayerJoin", this.players.get(i));

        }

        //Lance la partie
        if (this.players.size == 2){
            this.canPlay = true;
        }

        socket.emit("UpdateHUD", this.players.get(this.idOfPlayers.indexOf(socket.data.user))?.money);

        //Est appelé lorsqu'un joueur envoi une demande d'achat

        socket.on("achatMaison", (nbMaison: number) => {
            const player = this.players.get(this.theOnePlaying)
            if (player) {
                const cardEnCours = this.cards.get(player.caseNb)
                if (cardEnCours && cardEnCours instanceof TownCard) {

                    //On verifie si le joueur peut effectivement acheter
                    if (this.hasAllProperty(player, cardEnCours)){

                        //On verifie si le joueur peut poser le nombre de maisons demandé
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


        //Est émis dès que le joueur clique sur le dé
        socket.on("Lancede", (callBack) => {

            //Verifie si le joueur qui a cliqué peut jouer
            if ((this.idOfPlayers.indexOf(socket.data.user) + 1) == this.theOnePlaying && this.players.get(this.theOnePlaying) && this.canPlay) {

                //Retire le timeout et en rajoute un nouveau (le timeout laisse 60 secondes au joueur pour jouer sinon il perds la partie)
                clearTimeout(this.helpTimeout)
                this.helpTimeout = setTimeout(() => {this.forfeit(this.players.get(this.theOnePlaying))}, 100000);

                //Fait en sorte que personne ne joue tant que le tour n'est pas fini
                this.canPlay = false;

                const player = this.players.get(this.theOnePlaying);


                //Definis les dés pour le systeme de double (pour la prison actuellement)
                let de1 = Math.floor(Math.random() * 5 + 1);
                let de2 = Math.floor(Math.random() * 5 + 1);
                let r = (this.hasDice) ? de1 + de2 : de1;



                if (player != undefined) {

                    //Si le joueur est en prison mais a fait un double
                    if(de1 == de2 && player.tourInprison>0) {
                        this.server.io.to(this.uuid).emit("retirer prison");
                        player.tourInprison = 0;
                    }

                    console.log("Le joueur ", player.name, " a ", player.tourInprison, "tours en prisons et les dés sont: ", de1, de2);

                    //Si le joueur a fait un double ou qu'il n'est pas en prison
                    if (de1 == de2 || player.tourInprison == 0){

                        //On ajoute le nombre de case tirés au dés au joueur
                        player.caseNb += r;

                        //On verifie si le joueur passe sur la case départ
                        this.verifStart(player, socket);

                        this.players.set(this.theOnePlaying, player);

                        console.log("Le joueur ", player.playerName, " est sur la case ", player.caseNb, " avec £ ",player.money);

                        //On recupere la case sur lasuelle est le joueur et on en déduit les differents choix
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
                    //Si le joueur ne fait pas de double et est en prison
                    else if (de1 != de2 && player.tourInprison > 0){

                        console.log("Il vous reste ", player.tourInprison-1, " tours en prison")
                        player.tourInprison -=1;

                        //retire la prison si le joueur n'a plus qu'un tour
                        if (player.tourInprison == 0){this.server.io.to(this.uuid).emit("retirer prison");}
                        this.finTour()
                    }
                }
            }

        })

        //Permet d'update les varibales du serveur vers le client
        socket.on("Update", (callBack) => {
            callBack(undefined, {
                playersUpdate: Array.from(this.players.entries()),
                cardsUpdate: Array.from(this.cards.entries()),
                player: this.players.get(this.theOnePlaying)
            });
        })

        //Fini le tour
        socket.on("FinTour", () => {
            this.finTour()
        })

        //achete la case sur laquelle est le joueur
        socket.on("Achat", () => {
            const player = this.players.get(this.theOnePlaying);

            if (player != undefined) {
                this.achat(player);
            }
            this.finTour();
        })

        //Fini le tour pour le joueur
        socket.on("Faillite", (player: Players) => {

            this.forfeit(player);

        })

        //Bouge le joueur vers la case indiquée par la carte chance
        socket.on("moveChance", (chanceValue, player) => {
            this.emitWithout(socket, "Carte chance deplacement all", chanceValue, player);
        })
    }

    //Verifie si la case depart est franchie
    protected verifStart(player: Players, socket: Socket<DefaultEventsMap, DefaultEventsMap, any>): void {
        if (player.caseNb >= 40) {
            player.caseNb -= 40;
            player.money += 20000;
            socket.emit("Passage case départ", player.money);
        }
    }

    //Fait perdre le joueur
    forfeit(player: Players| undefined): void{
        if (player) {console.log("Le joueur ",player.name," a perdu");}
    }

    //Gere les carte chances
    protected caseChance(caseInfo: Card, player: Players, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
        const chanceValue = this.chances[(Math.floor(Math.random()*this.chances.length))];

        //Si la carte chance est basé sur l'ajout ou le retrait d'argent
        if (chanceValue.type == "argent") {
            player.money += chanceValue.aideReal;
            this.players.set(this.theOnePlaying, player);
            if (player.money < 0) this.forfeit(player);
            socket.emit("Carte chance argent", chanceValue, player)
        }

        //Si la carte chance est basé sur le deplacement d'un joueur
        else if(chanceValue.type == "deplacement") {

            //ajoute de l'argent si le joueur passe sur la case départ et a le droit à son argent
            if (player.caseNb >= chanceValue.aideReal.nbCase && chanceValue.aideReal.depart) {
                player.money += 20000;
            }

            //si la carte est une prison, on ajoute le tour en prison et on envoie aux joueurs un socket
            if (chanceValue.aideReal.prison) player.tourInprison = 3;
            player.caseNb = chanceValue.aideReal.nbCase;
            this.players.set(this.theOnePlaying, player);

            //Deplace vers les cases données par la carte
            socket.emit("Carte chance deplacement", chanceValue, player);
            if (chanceValue.aideReal.prison) this.emitWithout(socket, "joueur en prison", player);
            //else this.emitWithout(socket, "joueur déplacement", player);
        }

    }


    //Achete la case en cours
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

    //Gere les cartes villes
    protected caseTown(caseInfo: TownCard, player: Players, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){

        //Si la case n'est pas occupée
        if (caseInfo.user == undefined) {
            socket.emit("CasePossible", caseInfo, player, (player.money >= caseInfo.info.prix), this.theOnePlaying);
        }

        //Si la case est celle du joueur
        else if (caseInfo.user == player.name) {

            let maxHouse: number = 0

            for (let i = 1; i < 6; i++) {
                if (caseInfo.info.maison*i <= player.money) maxHouse += 1;
            }
            //Si le joueur possede toutes les autres cases de la meme couleur
            if (this.hasAllProperty(player, caseInfo)) socket.emit("MaisonPossible", maxHouse, caseInfo, player);

            else this.finTour();
        }

        //Si le joueur est sur la case d'un autre
        else{
            //Ajouter un emit pour animation de retirer l'argent
            let playerPaid: undefined | Players = this.getPlayerByName(caseInfo.user);
            const prix = caseInfo.getPassagePrice();

            if(playerPaid != undefined){

                //On ajoute l'argent du passage au joueur possedant la carte
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

    //Verifie si le joueur en entrée a toutes les cartes de la meme couleur passée en entrée
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