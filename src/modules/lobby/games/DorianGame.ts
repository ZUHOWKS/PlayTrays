import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import PTLobby from "../PTLobby";
import PTServer from "../../PTServer";

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
        for (let i = 1; i <= this.players.size; i++) {
            this.server.io.to(this.uuid).emit("PlayerJoin", this.players.get(i), i);
        }
        if (this.players.size >= 2) {
            this.server.io.to(this.uuid).emit("SetupGame");
        }
        socket.on("Lancede", (callBack)=>{
            let r = (this.hasDice)? Math.floor(Math.random()*11+1) : Math.floor(Math.random()*5+1);
            if(socket.data.user == this.theOnePlaying){
                // @ts-ignore
                this.players.get(this.theOnePlaying).caseNb += r;
                // @ts-ignore
                if (this.players.get(this.theOnePlaying).caseNb > 40) this.players.get(this.theOnePlaying).caseNb -= 40;
                callBack(undefined, {random: r, player: this.players.get(this.theOnePlaying), id: this.theOnePlaying});
                this.emitWithout(socket,"pawnMove", this.theOnePlaying, r);
                this.theOnePlaying = (this.theOnePlaying == this.players.size) ? 1 : this.theOnePlaying+1;
            }
        })
    }
}