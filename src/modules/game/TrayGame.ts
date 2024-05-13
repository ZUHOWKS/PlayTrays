import SupportController from "@/modules/game/scene/SupportController";
import {Socket} from "socket.io-client";
import {PerspectiveCamera, Scene} from "three";
import type {Ref} from "vue";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import CheckersClient from "@/modules/game/scene/controllers/CheckersClient";


export default class TrayGame {
    id: string;
    status: "waiting" | "running" | "finished";
    player: any;
    controller: SupportController | undefined;
    ws: Socket;

    /**
     * Cette classe facilite le rassemblement entre contrôleur de partie
     * et données utilisateurs
     *
     * @param id id ou uuid de la partie
     * @param status statut de la partie ("en attente de joueurs" | "en cours" | "terminée")
     * @param player données de l'utilisateur
     * @param ws
     * @param game jeu de la partie
     * @param scene Scene 3D
     * @param cameraRef Caméra du joueur (vue du joueur)
     * @param orbitControlsRef Contrôles orbitaux de la caméra (autour d'un point,
     * par défaut le point de coordonnée x=0;y=0;z=0)
     */
    constructor(id: string, status: "waiting" | "running" | "finished", player: any, ws: Socket, game: string, scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls>,) {
        this.id = id;
        this.status = status;
        this.player = player; //TODO: remplacer any par la UserInterface class
        this.ws = ws;

        if (game == "checkers") {
            this.controller = new CheckersClient(scene, cameraRef, orbitControlsRef, this.ws);
        }
    }

    /**
     * Setup de la partie
     */
    setup(loaderFiller?: Ref<boolean>): void {
        if (this.controller) {
            this.controller.setup(loaderFiller);
            this.ws.on('end game', (whoWin) => {
                this.status = 'finished'
            })
        } else {
            this.ws.disconnect();
        }
    }
}