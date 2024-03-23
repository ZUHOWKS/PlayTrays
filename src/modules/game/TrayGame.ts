import SupportController from "@/modules/game/scene/SupportController";


export default class TrayGame {
    id: string;
    statement: "waiting" | "running" | "finished";
    player: any;
    controller: SupportController;

    /**
     * Cette classe facilite le rassemblement entre contrôleur de partie
     * et données utilisateurs
     *
     * @param id id ou uuid de la partie
     * @param statement statut de la partie ("en attente de joueurs" | "en cours" | "terminée")
     * @param player données de l'utilisateur
     * @param controller contrôleur de la partie
     */
    constructor(id: string, statement: "waiting" | "running" | "finished", player: any, controller: SupportController) {
        this.id = id;
        this.statement = statement;
        this.player = player; //TODO: remplacer any par la User class
        this.controller = controller;
    }
}