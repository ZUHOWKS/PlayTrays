import PTServer from "./modules/PTServer";
import { createServer } from "http";

require('dotenv').config();

const httpServer = createServer();
const gServer: PTServer = new PTServer(httpServer, 10);
httpServer.listen(25526, '0.0.0.0')
gServer.init();