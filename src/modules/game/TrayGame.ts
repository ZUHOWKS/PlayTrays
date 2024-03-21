import type SceneController from "@/modules/game/SceneController";


export default class TrayGame {
    id: string;
    statement: "waiting" | "running" | "finished";
    players: string[];
    sceneController: SceneController;

    /**
     *
     * @param id id ou uuid de la partie
     * @param statement statut de la partie ("en attente de joueurs" | "en cours" | "terminée")
     * @param sceneController contrôleur de la vue 3D
     */
    constructor(id: string, statement: "waiting" | "running" | "finished", sceneController: SceneController) {
        this.id = id;
        this.statement = statement;
        this.players = [];
        this.sceneController = sceneController;
    }
}