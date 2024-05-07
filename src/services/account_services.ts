import {Axios} from "@/services";
import type {Router} from "vue-router";

export default class AccountServices {
    /**
     * Réaliser une requête de connexion à un compte utilisateur.
     *
     * @param formData formulaire de la requête
     */
    static login(formData: FormData) {
        return Axios.post('/login', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * Réaliser une requête d'enregistrement d'un compte utilisateur.
     *
     * @param formData formulaire de la requête
     */
    static register(formData: FormData) {
        return Axios.post('/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * Enregistrer le token dans le stockage local du navigateur.
     *
     * @param token token
     */
    static registerToken(token: string): void {
        localStorage.setItem("PTToken", token);
    }

    /**
     * Obtenir le token stocké dans le navigateur.
     */
    static getToken(): string | null {
        return localStorage.getItem("PTToken");
    }

    /**
     * Supprimer le token stocké dans le navigateur.
     */
    static removeToken(): void {
        localStorage.removeItem("PTToken");
    }

    /**
     * Vérifier si l'utilisateur est connecté.
     */
    static isLogged(): boolean {
        return this.getToken() != null;
    }

    /**
     * Déconnecter l'utilisateur.
     */
    static logout(router: Router): void {
        this.removeToken();
        router.push('/');
    }

    /**
     * Obtenir les informations du compte utilisateur.
     */
    static getUserInfos() {
        return Axios.get('/user/info');
    }

    static inviteFriend(email: string) {
        const form = new FormData()
        form.append('email', email)
        return Axios.post('/friend/invite', form)
    }

    static acceptFriend(id: number) {
        const form = new FormData()
        form.append('id', id)
        return Axios.post('/friend/accept', form)
    }

    static getFriends() {
        return Axios.get('/user/friends')
    }

    static getFriendInvitations() {
        return Axios.get('/friend/invitations')
    }

    static getOwnFriendInvitations() {
        return Axios.get('/friend/own-invitations')
    }

}
