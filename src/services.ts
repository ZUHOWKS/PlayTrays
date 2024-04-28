import axios from "axios";
import AccountServices from "@/services/account_services";
import {useRouter} from "vue-router";


const Axios = axios.create({
    baseURL: "http://localhost:3333"
});

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