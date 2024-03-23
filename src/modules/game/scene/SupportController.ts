import {Object3D, PerspectiveCamera, Scene} from "three";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Ref} from "vue";
import {type GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import type Object from "@/modules/game/scene/objects/Object";
import type Actuator from "@/modules/game/scene/actionners/Actuator";

export default abstract class SupportController {
    scene: Scene;
    cameraRef: Ref<PerspectiveCamera>;
    orbitControlsRef: Ref<OrbitControls | null>;
    objectRegistry: Map<string, Object>;
    actuatorRegistry: Map<string, Actuator>;
    selectedObject: Object | null = null;
    selectedActuator: Actuator | null = null;

    /**
     * Cette classe permet d'ajouter un contrôleur sur le support de la partie
     * en gérant les évènements des joueurs (sélection d'objet de la scène,
     * d'actionneur, position de la caméra).
     *
     * @param scene Scene 3D
     * @param cameraRef Caméra du joueur (vue du joueur)
     * @param orbitControlsRef Contrôles orbitales de la caméra (autour d'un point,
     * par défaut le point de coordonnée x=0;y=0;z=0);
     * @protected
     */
    protected constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls | null>) {
        this.scene = scene;
        this.cameraRef = cameraRef;
        this.orbitControlsRef = orbitControlsRef;
        this.objectRegistry = new Map<string, Object>();
        this.actuatorRegistry = new Map<string, Actuator>();
        
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
     * Obtenir les contrôles orbitales de la caméra.
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
     * @return Object si l'objet est bien enregistré, undefined s'il n'existe pas
     */
    getObject(name: string): Object | undefined {
        return this.objectRegistry.get(name);
    }

    /**
     * Permet d'obtenir l'objet courant sélectionné
     *
     * @return un Object si un objet est en cours de sélection, sinon null.
     */
    getSelectedObject(): Object | null {
        return this.selectedObject
    }

    /**
     * Enregistrer un objet
     *
     * @param object objet à enregistrer
     */
    addObject(object: Object): void {
        this.objectRegistry.set(object.getName(), object);
    }

    /**
     * Supprimer un objet enregistré
     *
     * @param name identifiant de l'objet à supprimer
     */
    removeObject(name: string): void {
        this.objectRegistry.delete(name);
    }

    /**
     * Sélectionner un object
     *
     * @param name identifiant de l'objet à sélectionner
     */
    selectObject(name: string): void {
        const object: Object | undefined = this.getObject(name);
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

    abstract showSelectedObjectActuators(object: Object | null): void

    /**
     * Désélectionner l'objet et l'actionneur.
     */
    abstract unselectAll(): void;

}