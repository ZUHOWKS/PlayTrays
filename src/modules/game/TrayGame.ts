import type SceneController from "@/modules/game/SceneController";


export default class TrayGame {
    id: string;
    statement: "waiting" | "running" | "finished";
    players: string[];
    sceneController: SceneController;

    constructor(id: string, statement: "waiting" | "running" | "finished", sceneController: SceneController) {
        this.id = id;
        this.statement = statement;
        this.players = [];
        this.sceneController = sceneController;
    }
}