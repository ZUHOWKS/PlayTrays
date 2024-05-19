import axios from "axios";
import AccountServices from "@/services/account_services";
import {useRouter} from "vue-router";
import {ADONIS_URL} from "@/config/serverConfig";


const Axios = axios.create({
    baseURL: ADONIS_URL + "/api/v1",
});

Axios.defaults.headers['Access-Control-Allow-Origin'] = '*'
Axios.defaults.headers['Access-Control-Allow-Headers'] = '*'
Axios.defaults.headers['Access-Control-Allow-Headers'] = '*'

/**
 * Intércepteur de requêtes pour intégrer automatiquement le token
 * dans le header au niveau du champ 'Authorization'.
 */
Axios.interceptors.request.use(request => {
    let token = AccountServices.getToken();

    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
})

/**
 * Intércepteur de réponses pour vérifier la valabilité du token.
 * Si le token n'est plus valide alors l'utilisateur est déconnecté.
 */
Axios.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && error.response.status == 401) {
        AccountServices.logout(useRouter());
    }
})

export {Axios}