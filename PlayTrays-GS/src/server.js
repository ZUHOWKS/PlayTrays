"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PTServer_1 = require("./modules/PTServer");
var http_1 = require("http");
require('dotenv').config();
var httpServer = (0, http_1.createServer)();
var gServer = new PTServer_1.default(httpServer, 10);
httpServer.listen(25526, '0.0.0.0');
gServer.init();
