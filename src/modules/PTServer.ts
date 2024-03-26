import {Server} from "socket.io";
import PTLobby from "./lobby/PTLobby";

interface AuthServerData {
    id: string;
    key: string;
}

export default class PTServer {
    io: Server
    lobbies: Map<string, PTLobby>
    capacity: number

    constructor(httpServer: any, lobbyMax: number) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
                credentials: true,
                optionsSuccessStatus: 204
            }
        });
        this.lobbies = new Map<string, PTLobby>();
        this.capacity = lobbyMax;
    }

    init(): void {
        this.io.use((socket, next) => this.middleware(socket, next));
        this.io.on("connection", (socket) => {

        })

        this.io.listen(25525);
    }

    private middleware(socket: any, next: any): void {
        const auth = socket.handshake.auth;
        if (auth) {
            if (this.isServerAuthentificationValid(auth)) {
                socket.data.authType = "server";
                next();
            } else {
                console.log("invalid");
            }
        }
        next(new Error("not authorized"));
    }

    private isServerAuthentificationValid(auth: any): boolean {
        try {
            const authServerData: AuthServerData = auth as AuthServerData;
            if (authServerData.id == process.env.SERVER_ID && authServerData.key == process.env.SERVER_KEY) {
                return true;
            }
        } catch (e) {

        }

        return false;
    }
}