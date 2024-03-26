import PTServer from "./modules/PTServer";
require('dotenv').config();

import { createServer } from "http";

const httpServer = createServer();
const gServer: PTServer = new PTServer(httpServer, 10);
gServer.init();

console.log("Hello")