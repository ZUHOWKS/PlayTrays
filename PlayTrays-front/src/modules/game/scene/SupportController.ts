import {PerspectiveCamera, Scene} from "three";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Ref} from "vue";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import type {Socket} from "socket.io-client";
import type {UserInterface} from "@/modules/utils/UserInterface";

export default abstract class SupportController {
    scene: Scene;
    cameraRef: Ref<PerspectiveCamera>;
    orbitControlsRef: Ref<OrbitControls>;
    objectRegistry: Map<string, PTObject>;
    actuatorRegistry: Map<string, Actuator>;
    selectedObject: PTObject | undefined;
    selectedActuator: Actuator | undefined;
    ws: Socket
    player: UserInterface

    /**
     * Cette classe permet d'ajouter un contrôleur sur le support de la partie
     * en gérant les évènements des joueurs (sélection d'objet de la scène,
     * d'actionneur, position de la caméra).
     *
     * @param scene Scene 3D
     * @param cameraRef Caméra du joueur (vue du joueur)
     * @param orbitControlsRef Contrôles orbitaux de la caméra (autour d'un point,
     * par défaut le point de coordonnée x=0;y=0;z=0)
     * @param ws Socket connecté au serveur jeu
     * @protected
     */
    protected constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls>, ws: Socket, player: UserInterface) {
        this.scene = scene;
        this.cameraRef = cameraRef;
        this.orbitControlsRef = orbitControlsRef;
        this.objectRegistry = new Map<string, PTObject>();
        this.actuatorRegistry = new Map<string, Actuator>();
        this.ws = ws;
        this.player = player
        
    }

    /**
     * Permet d'initialiser tous les évènements liés à la partie
     */
    abstract setup(loaderFiller?: Ref<boolean>): void;

    /**
     * Obtenir la caméra qui correspond à la vue courante du joueur
     *
     * @return PerspectiveCamera caméra pour la vue du joueur
     */
    getCamera(): PerspectiveCamera {
        return this.cameraRef.value;
    }

    /**
     * Obtenir les contrôles orbitaux de la caméra.
     *
     * @return OrbitControls s'il y en a une, null si elle n'est pas définie
     */
    getOrbitControls(): OrbitControls {
        return this.orbitControlsRef.value;
    }

    /**
     * Obtenir un objet enregistré avec son name comme identifiant
     *
     * @param name identifiant de l'objet
     *
     * @return PTObject si l'objet est bien enregistré, undefined s'il n'existe pas
     */
    getObject(name: string): PTObject | undefined {
        return this.objectRegistry.get(name);
    }

    /**
     * Permet d'obtenir l'objet courant sélectionné
     *
     * @return un PTObject si un objet est en cours de sélection, sinon null.
     */
    getSelectedObject(): PTObject | undefined {
        return this.selectedObject
    }

    /**
     * Enregistrer un objet
     *
     * @param object objet à enregistrer
     */
    registerObject(object: PTObject): void {
        const _obj: PTObject | undefined = this.objectRegistry.get(object.getName())
        if (_obj) {
            this.scene.remove(_obj.getObject3D())
        }

        this.objectRegistry.set(object.getName(), object);
        this.scene.add(object.getObject3D());
        this.scene.children[this.scene.children.length - 1].name = object.getName();
    }

    /**
     * Supprimer un objet enregistré du registre
     *
     * @param name identifiant de l'objet à supprimer
     */
    unregisterObject(name: string): void {
        const _obj: PTObject | undefined = this.objectRegistry.get(name);
        if (_obj) {
            this.objectRegistry.delete(name);
            this.scene.remove(_obj.getObject3D());
        }
    }

    /**
     * Sélectionner un object.
     *
     * @param name identifiant de l'objet à sélectionner
     */
    selectObject(name: string): void {
        const object: PTObject | undefined = this.getObject(name);
        if (object) {
            this.selectedObject = object;
            this.selectedObject.select();
        }

    }

    /**
     * Désélectionner l'objet courant.
     */
    unselectObject(): void {
        if (this.selectedObject) {
            this.selectedObject.unselect();
            this.selectedObject = undefined;
        }
    }

    isActuator(name: string): boolean {
        return this.actuatorRegistry.get(name) != undefined;
    }

    /**
     * Enregistrer une action.
     *
     * @param act actionneur
     */
    registerActuator(act: Actuator) {
        this.actuatorRegistry.set(act.getName(), act);
    }

    /**
     * Sélectionner une action en fonctionnant de son identifiant.
     *
     * @param name identifiant de l'actionneur
     */
    abstract selectActuator(name: string): void

    /**
     * Confirmer et exécuter l'action sélectionnée.
     */
    abstract confirmAction(): void;

    /**
     * Obtenir l'actionneur courant sélectionné.
     *
     * @return Actuator si un actionneur est en cours de sélection, sinon null
     */
    getSelectedActuator(): Actuator | undefined {
        return this.selectedActuator
    }

    /**
     * Afficher les actions liées à l'objet sélectionné.
     */
    abstract showSelectedObjectActuators(): void

    /**
     * Désélectionner l'objet et les actions liées à ce premier
     */
    abstract unselectAll(): void;

    /**
     * Set les paramètres caméra à par défaut.
     */
    abstract defaultCamera(): void;

}