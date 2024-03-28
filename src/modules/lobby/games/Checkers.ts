import PTLobby from "../PTLobby";
import {Socket} from "socket.io";
import PTServer from "../../PTServer";


export default class Checkers extends PTLobby {

    constructor(uuid: string, game: string, visibility: "public" | "private", server: PTServer) {
        super(uuid, game, visibility, server);
    }

    registerNewSocket(socket: Socket): void {
        socket.join(this.uuid);
        socket.on('disconnect', (user) => {
            this.removeSocket(user);
        });
    }
}