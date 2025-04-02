import PTServer from "./modules/PTServer";
import { createServer } from "http";

require('dotenv').config();

const httpServer = createServer();
const gServer: PTServer = new PTServer(httpServer, 10);

httpServer.listen(25565, "0.0.0.0", () => {
    console.log('The server is listening on port 25565');
    gServer.init();
})




