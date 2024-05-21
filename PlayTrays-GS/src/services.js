"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Axios = void 0;
var axios_1 = require("axios");
var serverConfig_1 = require("./config/serverConfig");
var Axios = axios_1.default.create({
    baseURL: serverConfig_1.ADONIS_URL + "/api/v1"
});
exports.Axios = Axios;
/**
 * Intércepteur de requêtes pour intégrer automatiquement les crédences
 * dans le body.
 */
Axios.interceptors.request.use(function (request) {
    var identifier = process.env.SERVER_IDENTIFIER;
    var token = process.env.SERVER_TOKEN;
    if (identifier && token) {
        request.data.append('identifier', identifier);
        request.data.append('token', token);
    }
    return request;
});
/**
 * Intércepteur de réponses.
 */
Axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    /*
    if (error.response && error.response.status == 401) {

    }
     */
});
