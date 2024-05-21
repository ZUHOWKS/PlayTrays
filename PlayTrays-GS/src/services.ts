import axios from "axios";
import {ADONIS_URL} from "./config/serverConfig";


const Axios = axios.create({
    baseURL: ADONIS_URL + "/api/v1"
});

/**
 * Intércepteur de requêtes pour intégrer automatiquement les crédences
 * dans le body.
 */
Axios.interceptors.request.use(request => {
    const identifier = process.env.SERVER_IDENTIFIER;
    const token = process.env.SERVER_TOKEN;

    if (identifier && token) {
        request.data.append('identifier', identifier);
        request.data.append('token', token);
    }

    return request;
})

/**
 * Intércepteur de réponses.
 */
Axios.interceptors.response.use(response => {
    return response;
}, error => {
    /*
    if (error.response && error.response.status == 401) {

    }
     */
})

export {Axios}