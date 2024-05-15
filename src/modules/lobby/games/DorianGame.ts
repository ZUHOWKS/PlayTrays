import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import PTLobby from "../PTLobby";
import PTServer from "../../PTServer";
import {Card} from "../../DorianGame/cards/Card";
import {cardConfig} from "../../DorianGame/cards/CardConfig";
import {TownCard} from "../../DorianGame/cards/TownCard";

interface Players{
    name: string;
    city: string[];
    exitPrison: number;
    money: number;
    caseNb: number;
}



export default class DorianGame extends PTLobby {

    players: Map<number, Players>;
    theOnePlaying: number = 1;
    hasDice = true;

    cards: Map<number, Card>; // caseNb, Card

    constructor(uuid: string, game: string, visibility: "public" | "private", server: PTServer) {
        super(uuid, game, visibility, server);
        this.players = new Map();
        this.cards = new Map();

        this.setupGame();

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
        if (!(this.players.get(socket.data.user))) {
            this.players.set(socket.data.user, {name: "User" + socket.data.user, city: [], exitPrison: 0, money: 0, caseNb: 0});
        }

        socket.join(this.uuid);
        console.log(socket.data.user);
        for (let i = 1; i <= this.players.size; i++) {
            this.server.io.to(this.uuid).emit("PlayerJoin", this.players.get(i), i);
        }
        if (this.players.size >= 2) {
            this.server.io.to(this.uuid).emit("SetupGame");
        }
        socket.on("Lancede", (callBack)=>{
            let r = (this.hasDice)? Math.floor(Math.random()*11+1) : Math.floor(Math.random()*5+1);
            if(socket.data.user == this.theOnePlaying && this.players.get(this.theOnePlaying)){
                const player = this.players.get(this.theOnePlaying);
                if (player != undefined){
                player.caseNb += r;
                this.players.set(this.theOnePlaying, player);
                if (player.caseNb > 40) player.caseNb -= 40;
                callBack(undefined, {random: r, player: player, id: this.theOnePlaying});
                this.emitWithout(socket,"pawnMove", this.theOnePlaying, r);
                const whatCase = player.caseNb.toString();
                //if (whatCase in cardAllHelper) this.server.io.to(this.uuid).emit("AfficherEventCard", cardAllHelper."1");
                this.theOnePlaying = (this.theOnePlaying == this.players.size) ? 1 : this.theOnePlaying+1;
                }
            }
        })
    }
}