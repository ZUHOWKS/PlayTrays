import PTServer from "./modules/PTServer";
import { createServer } from "http";

require('dotenv').config();

const httpServer = createServer();
const gServer: PTServer = new PTServer(httpServer, 10);
gServer.init();

gServer.createLobby("testCheckers", "checkers", "public");