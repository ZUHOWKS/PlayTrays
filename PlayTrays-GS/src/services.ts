import axios from "axios";


const Axios = axios.create({
    baseURL: process.env.SERVER_HOST + "/api/v1"
});

/**
 * Intércepteur de requêtes pour intégrer automatiquement les crédences
 * dans le body.
 */
Axios.interceptors.request.use(request => {

    const identifier = process.env.SERVER_IDENTIFIER;
    const token = process.env.SERVER_TOKEN;

    if (identifier && token) {
        request.headers['Authorization'] = `Bearer ${identifier}:${token}`;
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