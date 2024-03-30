import {Object3D, PerspectiveCamera, Scene} from "three";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Ref} from "vue";
import {type GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import type Actuator from "@/modules/game/scene/actionners/Actuator";
import type {Socket} from "socket.io-client";

export default abstract class SupportController {
    scene: Scene;
    cameraRef: Ref<PerspectiveCamera>;
    orbitControlsRef: Ref<OrbitControls | null>;
    objectRegistry: Map<string, PTObject>;
    actuatorRegistry: Map<string, Actuator>;
    selectedObject: PTObject | null = null;
    selectedActuator: Actuator | null = null;
    ws: Socket

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
    protected constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls | null>, ws: Socket) {
        this.scene = scene;
        this.cameraRef = cameraRef;
        this.orbitControlsRef = orbitControlsRef;
        this.objectRegistry = new Map<string, PTObject>();
        this.actuatorRegistry = new Map<string, Actuator>();
        this.ws = ws;
        
    }

    /**
     * Permet d'initialiser tous les évènements liés à la partie
     */
    abstract setup(): void;

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
    getOrbitControls(): OrbitControls | null {
        return this.orbitControlsRef.value;
    }

    /**
     * Charger la scène 3D du modèle.
     * @param loader Loader utilisé pour charger les modèles .glb/.gltf
     * @param model chemin d'accès au modèle depuis le dossier "models/"
     */
    async loadGLTFSceneModel(loader: GLTFLoader, model: string): Promise<Object3D> {
        return new Promise((resolve, reject) => {
            loader.load(
                new URL("/src/assets/models/" + model, import.meta.url).href,
                function (gltf: GLTF): void {
                    resolve(gltf.scene);
                },
                undefined,
                function (error: any): void {
                    console.error(error);
                    reject(error);
                }
            );
        });
    };

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
    getSelectedObject(): PTObject | null {
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
    }

    /**
     * Supprimer un objet enregistré du registre
     *
     * @param name identifiant de l'objet à supprimer
     */
    unregisterObject(name: string): void {
        this.objectRegistry.delete(name);
    }

    /**
     * Sélectionner un object
     *
     * @param name identifiant de l'objet à sélectionner
     */
    selectObject(name: string): void {
        const object: PTObject | undefined = this.getObject(name);
        if (object != undefined) {
            this.selectedObject = object;
            this.selectedObject.select();
        }

    }

    /**
     * Désélectionner l'objet courant
     */
    unselectObject(): void {
        if (this.selectedObject != null) {
            this.selectedObject.unselect();
            this.selectedObject = null;
        }
    }

    /**
     * Sélectionner un actionneur en fonctionnant de son identifiant
     *
     * @param name identifiant de l'actionneur
     */
    abstract selectActuator(name: string): void

    /**
     * Confirmer et executé l'action de l'actionneur courant
     */
    abstract confirmAction(): void;

    /**
     * Obtenir l'actionneur courant sélectionné
     *
     * @return Actuator si un actionneur est en cours de sélection, sinon null
     */
    abstract getSelectedActuator(): Actuator | null;

    abstract showSelectedObjectActuators(object: PTObject | null): void

    /**
     * Désélectionner l'objet et l'actionneur.
     */
    abstract unselectAll(): void;

}