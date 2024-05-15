import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import PTLobby from "../PTLobby";
import PTServer from "../../PTServer";
import { cardAllHelper } from "../../DorianGame/CardHelper";

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

    constructor(uuid: string, game: string, visibility: "public" | "private", server: PTServer) {
        super(uuid, game, visibility, server);
        this.setupGame();
        this.players = new Map();

    }


    protected setupGame(): void {
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